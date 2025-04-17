
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Reservation } from "@/types";

export function useReservationActions(reservation: Reservation | null) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  
  const handleCancelReservation = async () => {
    if (!reservation) return;
    
    try {
      setIsProcessing(true);
      
      const { error } = await supabase
        .from("reservations")
        .update({ 
          status: "cancelled",
          updated_at: new Date().toISOString()
        })
        .eq("id", reservation.id)
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Reservation cancelled",
        description: "Your reservation has been successfully cancelled",
      });
      
      // Refresh the page to show updated status
      navigate(0);
      
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
  
  const isCancellable = reservation && 
    reservation.status !== "cancelled" && 
    !reservation.checked_in;
  
  return {
    handleCancelReservation,
    isCancellable,
    isProcessing
  };
}
