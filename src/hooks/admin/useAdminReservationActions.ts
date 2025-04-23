
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adminSupabase } from "@/integrations/supabase/admin-client";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { Reservation } from "@/types";

// This hook provides functions for admin-specific reservation actions
export function useAdminReservationActions(onActionComplete?: () => void) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({}); // Track processing state per reservation ID

  const setProcessing = (reservationId: string, processing: boolean) => {
    setIsProcessing(prev => ({ ...prev, [reservationId]: processing }));
  };

  // Admin Check-In
  const handleAdminCheckIn = async (reservation: Reservation) => {
    if (!reservation || reservation.checked_in) return; // Don't check in if already done
    
    setProcessing(reservation.id, true);
    try {
      const { error } = await adminSupabase
        .from("reservations")
        .update({ 
          checked_in: true,
          updated_at: new Date().toISOString() 
        })
        .eq("id", reservation.id);
        
      if (error) throw error;
      
      sonnerToast.success(`Reservation ${reservation.id.substring(0, 8)} checked in.`);
      onActionComplete?.(); // Refresh data if callback provided
    } catch (error: any) {
      console.error("Admin check-in error:", error);
      toast({
        title: "Check-In Failed",
        description: error.message || "Could not update check-in status.",
        variant: "destructive",
      });
    } finally {
      setProcessing(reservation.id, false);
    }
  };

  // Admin Cancel Reservation
  const handleAdminCancel = async (reservation: Reservation) => {
     if (!reservation || reservation.status === 'cancelled') return; // Don't cancel if already cancelled

    setProcessing(reservation.id, true);
    try {
      const { error } = await adminSupabase
        .from("reservations")
        .update({ 
          status: "cancelled",
          updated_at: new Date().toISOString()
        })
        .eq("id", reservation.id);
        
      if (error) throw error;
      
      sonnerToast.warning(`Reservation ${reservation.id.substring(0, 8)} cancelled.`);
      onActionComplete?.(); // Refresh data if callback provided
    } catch (error: any) {
      console.error("Admin cancellation error:", error);
      toast({
        title: "Cancellation Failed",
        description: error.message || "Could not cancel the reservation.",
        variant: "destructive",
      });
    } finally {
      setProcessing(reservation.id, false);
    }
  };

  return {
    isProcessing, // Returns the map { reservationId: boolean }
    handleAdminCheckIn,
    handleAdminCancel,
  };
}
