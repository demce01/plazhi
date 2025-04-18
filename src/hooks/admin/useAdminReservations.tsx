import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Reservation } from "@/types"; // Assuming Reservation type exists

// Combine reservation with beach name for display
export interface ReservationWithBeachAdmin extends Reservation {
  beach_name?: string;
}

export function useAdminReservations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchReservationsAdmin = async (): Promise<ReservationWithBeachAdmin[]> => {
    // RLS policy should ensure only admins can fetch all reservations
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
      console.error("Admin: Error loading reservations:", error);
      throw new Error(error.message || "Failed to fetch reservations");
    }

    // Transform data
    return data?.map(reservation => ({
      ...reservation,
      beach_name: (reservation.beach as any)?.name || "Unknown Beach"
    })) || [];
  };

  const { 
    data: reservations = [], 
    isLoading,
    error 
  } = useQuery<ReservationWithBeachAdmin[], Error>({
    queryKey: ['adminReservations'],
    queryFn: fetchReservationsAdmin,
    staleTime: 1 * 60 * 1000, // Refetch after 1 minute
  });

  // Handle error state
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading reservations",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Function to trigger refetch
  const refreshReservations = () => {
    queryClient.invalidateQueries({ queryKey: ['adminReservations'] });
  };

  return {
    isLoading,
    reservations,
    refreshReservations,
  };
} 