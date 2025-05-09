import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Reservation } from "@/types";
import { toast as sonnerToast } from "sonner";

export function useReservationActions(reservation: Reservation | null) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  
  const handleCancelReservation = async () => {
    if (!reservation) return;
    
    try {
      setIsProcessing(true);
      console.log(`Cancelling reservation ${reservation.id} from details`);
      
      const { data, error } = await supabase
        .from("reservations")
        .update({ 
          status: "cancelled",
          updated_at: new Date().toISOString()
        })
        .eq("id", reservation.id)
        .select();  // Add .select() to return the updated data
      
      if (error) {
        console.error("Cancel error:", error);
        throw error;
      }
      
      console.log("Cancellation response:", data);
      
      sonnerToast.success("Reservation cancelled successfully");
      
      // Don't navigate if we're on the dashboard
      if (window.location.pathname.includes('/reservations/')) {
        // We're on the reservation detail page, refresh the page
        navigate(0);
      }
      
      return true;
    } catch (error: any) {
      console.error("Failed to cancel reservation:", error);
      toast({
        title: "Cancellation Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Check if a reservation can be cancelled
  const isCancellable = reservation && 
    reservation.status !== "cancelled" && 
    !reservation.checked_in;
  
  return {
    handleCancelReservation,
    isCancellable,
    isProcessing
  };
}
