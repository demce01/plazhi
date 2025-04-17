
import { useState } from "react";
import { Beach, Set, UserSession } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export function useReservationSubmit(
  beach: Beach | null, 
  selectedDate: Date,
  userSession: UserSession,
  selectedSets: Set[],
  setIsProcessing: (value: boolean) => void
) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, clientId } = userSession;

  const handleReservation = async () => {
    if (!user || !clientId) {
      return false;
    }
    
    if (selectedSets.length === 0) {
      toast({
        title: "No sets selected",
        description: "Please select at least one beach set to reserve.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setIsProcessing(true);
      console.log("Creating reservation for logged-in user with clientId:", clientId);
      
      // Create the reservation
      const totalAmount = selectedSets.reduce(
        (sum, set) => sum + Number(set.price || 0), 
        0
      );
      
      const { data: reservation, error: reservationError } = await supabase
        .from("reservations")
        .insert({
          client_id: clientId,
          beach_id: beach?.id,
          reservation_date: format(selectedDate, "yyyy-MM-dd"),
          payment_amount: totalAmount,
        })
        .select()
        .single();
      
      if (reservationError) {
        console.error("Reservation creation error:", reservationError);
        throw reservationError;
      }
      
      console.log("Reservation created:", reservation);
      
      // Create reservation_sets entries
      const reservationSets = selectedSets.map(set => ({
        reservation_id: reservation.id,
        set_id: set.id,
        price: set.price,
      }));
      
      const { error: setsError } = await supabase
        .from("reservation_sets")
        .insert(reservationSets);
      
      if (setsError) {
        console.error("Reservation sets error:", setsError);
        throw setsError;
      }
      
      toast({
        title: "Reservation successful",
        description: `Your reservation has been created with ID: ${reservation.id.substring(0, 8)}`,
      });
      
      // Redirect to reservation confirmation page
      navigate(`/reservations/${reservation.id}`);
      return true;
      
    } catch (error: any) {
      console.error("Reservation error:", error);
      toast({
        title: "Reservation failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGuestReservation = async (guestData: {
    name: string;
    phone: string;
    email?: string;
  }) => {
    if (selectedSets.length === 0) {
      toast({
        title: "No sets selected",
        description: "Please select at least one beach set to reserve.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setIsProcessing(true);
      console.log("Creating guest reservation with data:", guestData);
      
      // Create the reservation
      const totalAmount = selectedSets.reduce(
        (sum, set) => sum + Number(set.price || 0), 
        0
      );
      
      const { data: reservation, error: reservationError } = await supabase
        .from("reservations")
        .insert({
          beach_id: beach?.id,
          guest_name: guestData.name,
          guest_phone: guestData.phone,
          guest_email: guestData.email || null,
          reservation_date: format(selectedDate, "yyyy-MM-dd"),
          payment_amount: totalAmount,
          status: "confirmed", // Auto-confirm guest reservations
          payment_status: "completed", // Consider it paid for simplicity
        })
        .select()
        .single();
      
      if (reservationError) {
        console.error("Guest reservation error:", reservationError);
        throw reservationError;
      }
      
      console.log("Guest reservation created:", reservation);
      
      // Create reservation_sets entries
      const reservationSets = selectedSets.map(set => ({
        reservation_id: reservation.id,
        set_id: set.id,
        price: set.price,
      }));
      
      const { error: setsError } = await supabase
        .from("reservation_sets")
        .insert(reservationSets);
      
      if (setsError) {
        console.error("Reservation sets error:", setsError);
        throw setsError;
      }
      
      toast({
        title: "Reservation successful",
        description: `Your reservation has been created with ID: ${reservation.id.substring(0, 8)}`,
      });
      
      // Redirect to reservation confirmation page
      navigate(`/reservations/${reservation.id}`);
      return true;
      
    } catch (error: any) {
      console.error("Guest reservation error:", error);
      toast({
        title: "Reservation failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    handleReservation,
    handleGuestReservation
  };
}
