
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Reservation } from "@/types";
import { useReservationActions } from "@/hooks/reservations";

export function useReservationOperations(onReservationsChanged: () => Promise<void>) {
  const { toast } = useToast();
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const { handleCancelReservation, isProcessing } = useReservationActions(selectedReservation);

  const handleUpdateStatus = async (reservationId: string, newStatus: string) => {
    try {
      console.log(`Updating reservation ${reservationId} status to ${newStatus}`);
      
      // Update the reservation status in the database
      const { data, error } = await supabase
        .from("reservations")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", reservationId)
        .select();
      
      if (error) {
        console.error("Update error:", error);
        throw error;
      }
      
      toast({
        title: "Reservation updated",
        description: `Reservation status changed to ${newStatus}`,
      });
      
      // Refresh the reservations list
      await onReservationsChanged();
    } catch (error: any) {
      console.error("Failed to update reservation:", error);
      toast({
        title: "Error updating reservation",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCheckIn = async (reservationId: string) => {
    try {
      console.log(`Checking in reservation ${reservationId}`);
      
      // Update the reservation check-in status in the database
      const { data, error } = await supabase
        .from("reservations")
        .update({ 
          checked_in: true,
          updated_at: new Date().toISOString()
        })
        .eq("id", reservationId)
        .select();
      
      if (error) {
        console.error("Check-in error:", error);
        throw error;
      }
      
      toast({
        title: "Guest checked in",
        description: "Guest has been successfully checked in",
      });
      
      // Refresh the reservations list
      await onReservationsChanged();
    } catch (error: any) {
      console.error("Failed to check in guest:", error);
      toast({
        title: "Error checking in guest",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openCancelDialog = (reservation: Reservation) => {
    setSelectedReservation(reservation);
  };

  const handleCancelComplete = async () => {
    await handleCancelReservation();
    setSelectedReservation(null);
    await onReservationsChanged();
  };

  return {
    selectedReservation,
    isProcessing,
    handleUpdateStatus,
    handleCheckIn,
    openCancelDialog,
    setSelectedReservation,
    handleCancelComplete
  };
}
