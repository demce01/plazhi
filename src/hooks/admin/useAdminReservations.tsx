
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Reservation } from "@/types";

export interface ReservationWithBeachAdmin extends Reservation {
  beach_name?: string;
}

export function useAdminReservations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchReservationsAdmin = async (): Promise<ReservationWithBeachAdmin[]> => {
    console.log("Fetching reservations for admin/employee view");
    
    // Use the regular supabase client instead of adminSupabase
    // The RLS policies now allow admins to view all reservations
    const { data, error } = await supabase
      .from("reservations")
      .select(`
        *,
        beach:beach_id (
          id,
          name
        )
      `)
      .order("reservation_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading reservations:", error);
      throw new Error(error.message || "Failed to fetch reservations. Please ensure you have proper permissions.");
    }

    if (!data) {
      console.log("No reservations found");
      return [];
    }

    console.log(`Found ${data.length} reservations`);
    
    // Transform data
    return data.map(reservation => ({
      ...reservation,
      beach_name: (reservation.beach as any)?.name || "Unknown Beach"
    }));
  };

  const { 
    data: reservations = [], 
    isLoading,
    error 
  } = useQuery<ReservationWithBeachAdmin[], Error>({
    queryKey: ['adminReservations'],
    queryFn: fetchReservationsAdmin,
    staleTime: 1 * 60 * 1000, // Refetch after 1 minute
    retry: 1, // Only retry once if there's an error
  });

  // Handle error state with more specific messaging
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading reservations",
        description: "Please ensure you have proper permissions to view reservations. If the problem persists, contact your administrator.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return {
    isLoading,
    reservations,
    refreshReservations: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReservations'] });
    },
  };
}
