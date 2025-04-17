
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Reservation } from "@/types";
import { toast as sonnerToast } from "sonner";

export function useReservationOperations(onReservationsChanged: () => Promise<void>) {
  const { toast } = useToast();
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpdateStatus = async (reservationId: string, newStatus: string) => {
    try {
      setIsProcessing(true);
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
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckIn = async (reservationId: string) => {
    try {
      setIsProcessing(true);
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
      
      sonnerToast.success("Guest checked in successfully");
      
      // Refresh the reservations list
      await onReservationsChanged();
    } catch (error: any) {
      console.error("Failed to check in guest:", error);
      toast({
        title: "Error checking in guest",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const openCancelDialog = (reservation: Reservation) => {
    console.log("Opening cancel dialog for reservation:", reservation);
    setSelectedReservation(reservation);
  };

  const handleCancelComplete = async () => {
    if (!selectedReservation) {
      console.error("No reservation selected for cancellation");
      return;
    }
    
    try {
      setIsProcessing(true);
      console.log(`Cancelling reservation ${selectedReservation.id}`);
      
      // Directly cancel the reservation in the database
      const { error } = await supabase
        .from("reservations")
        .update({ 
          status: "cancelled",
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedReservation.id);
      
      if (error) {
        console.error("Cancel error:", error);
        throw error;
      }
      
      sonnerToast.success("Reservation cancelled successfully");
      
      // Refresh the reservations list
      await onReservationsChanged();
      
      // Clear the selected reservation
      setSelectedReservation(null);
    } catch (error: any) {
      console.error("Failed to cancel reservation:", error);
      toast({
        title: "Error cancelling reservation",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
