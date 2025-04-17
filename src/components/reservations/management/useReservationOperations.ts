
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Reservation } from "@/types";

export function useReservationOperations(onSuccess?: () => void) {
  const { toast } = useToast();
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpdateStatus = async (reservationId: string, status: string) => {
    try {
      setIsProcessing(true);
      
      const { error } = await supabase
        .from("reservations")
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq("id", reservationId);
      
      if (error) throw error;
      
      toast({
        title: "Status updated",
        description: `Reservation status updated to ${status}`,
      });
      
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error updating status",
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
      
      const { error } = await supabase
        .from("reservations")
        .update({ 
          checked_in: true,
          updated_at: new Date().toISOString()
        })
        .eq("id", reservationId);
      
      if (error) throw error;
      
      toast({
        title: "Check-in successful",
        description: "Guest has been checked in",
      });
      
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error checking in",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const openCancelDialog = (reservation: Reservation) => {
    setSelectedReservation(reservation);
  };

  const handleCancelComplete = async () => {
    if (!selectedReservation) return;
    
    try {
      setIsProcessing(true);
      
      const { error } = await supabase
        .from("reservations")
        .update({ 
          status: "cancelled",
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedReservation.id);
      
      if (error) throw error;
      
      toast({
        title: "Reservation cancelled",
        description: "The reservation has been cancelled successfully",
      });
      
      setSelectedReservation(null);
      onSuccess?.();
    } catch (error: any) {
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
