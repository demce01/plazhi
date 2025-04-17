
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
      
      // Success! Don't navigate if we're on the dashboard
      if (window.location.pathname.includes('/reservations/')) {
        // We're on the reservation detail page, refresh the page
        navigate(0);
      }
      
      return true;
    } catch (error: any) {
      console.error("Failed to cancel reservation:", error);
      toast({
        title: "Error cancelling reservation",
        description: error.message,
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
