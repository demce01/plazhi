import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { Reservation } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface ReservationWithBeach extends Reservation {
  beach_name?: string;
}

export function useMyReservations() {
  const { toast } = useToast();
  const { userSession } = useAuth();
  const queryClient = useQueryClient();

  const { 
    data: reservations = [], 
    isLoading: loading, 
    error: reservationsError 
  } = useQuery<ReservationWithBeach[], Error>({
    queryKey: ['myReservations', userSession.clientId], 
    queryFn: async () => {
      if (!userSession.user || !userSession.clientId) {
        console.warn("Attempted to fetch reservations without user or clientId");
        return [];
      }
      
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("phone")
        .eq("user_id", userSession.user.id)
        .single();
        
      if (clientError && clientError.code !== 'PGRST116') {
        console.error("Error fetching client phone for reservations:", clientError);
      }
      const userPhone = clientData?.phone;
      
      let query = supabase
        .from("reservations")
        .select(`*, beaches:beach_id (id, name)`)
        .order('reservation_date', { ascending: false });

      let filterConditions = `client_id.eq.${userSession.clientId}`;
      if (userPhone) {
          filterConditions += `,guest_phone.eq.${userPhone}`;
      }
      query = query.or(filterConditions);
              
      const { data, error: fetchError } = await query;
              
      if (fetchError) {
          console.error("Error loading reservations:", fetchError);
          throw new Error(fetchError.message || "Failed to fetch reservations");
      }

      const reservationsWithBeach = data?.map(reservation => ({
        ...reservation,
        beach_name: (reservation.beaches as any)?.name || "Unknown Beach"
      })) || [];
      
      return reservationsWithBeach;
    },
    enabled: !!userSession.clientId, 
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (reservationsError) {
      toast({
        title: "Error loading reservations",
        description: reservationsError.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }, [reservationsError, toast]);

  const fetchReservations = () => {
    queryClient.invalidateQueries({ queryKey: ['myReservations', userSession.clientId] });
  };

  return {
    loading,
    reservations,
    fetchReservations,
  };
}
