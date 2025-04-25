
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
    if (!user || !clientId || !beach) {
      toast({ title: "Error", description: "User or beach data missing.", variant: "destructive" });
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
      
      // Check set availability again before proceeding
      const selectedSetIds = selectedSets.map(s => s.id);
      const { data: currentSets, error: checkError } = await supabase
        .from("sets")
        .select("id, status")
        .in("id", selectedSetIds);
      
      if (checkError) {
        console.error("Error checking set availability:", checkError);
        toast({ title: "Reservation Failed", description: "Could not verify set availability. Please try again.", variant: "destructive" });
        setIsProcessing(false);
        return false;
      }
      
      const alreadyReserved = currentSets?.find(s => s.status === "reserved");
      if (alreadyReserved) {
        toast({ title: "Set Unavailable", description: `Sorry, one or more selected sets (ID: ${alreadyReserved.id.substring(0,8)}...) were just booked. Please select different sets.`, variant: "destructive" });
        setIsProcessing(false);
        return false;
      }
      
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
          status: "confirmed",
          payment_status: "completed",
        })
        .select()
        .single();
      
      if (reservationError) {
        console.error("Reservation creation error:", reservationError);
        toast({ title: "Reservation Failed", description: reservationError.message || "Could not create reservation record.", variant: "destructive" });
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
        toast({ title: "Reservation Partially Failed", description: setsError.message || "Could not link sets to reservation. Please contact support.", variant: "destructive" });
        throw setsError;
      }
      
      toast({
        title: "Reservation successful",
        description: `Your reservation has been created with ID: ${reservation.id.substring(0, 8)}`,
      });
      
      // Redirect to reservation confirmation page
      console.log('[useReservationSubmit] Navigating to confirmation. User Session:', userSession);
      navigate(`/reservations/${reservation.id}`, { state: { justReserved: true } });
      return true;
      
    } catch (error: any) {
      console.error("Reservation error:", error);
      toast({
        title: "Reservation failed",
        description: error.message || "An unexpected error occurred during reservation.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Completely separate guest reservation function with no auth references
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
    if (!beach) {
      toast({ title: "Error", description: "Beach data missing.", variant: "destructive" });
      return false;
    }
    
    try {
      setIsProcessing(true);
      // Avoid any reference to auth
      console.log("Creating guest reservation with data:", { ...guestData, beach_id: beach.id });
      
      // Check set availability again before proceeding
      const selectedSetIds = selectedSets.map(s => s.id);
      const { data: currentSets, error: checkError } = await supabase
        .from("sets")
        .select("id, status")
        .in("id", selectedSetIds);
      
      if (checkError) {
        console.error("Error checking set availability:", checkError);
        toast({ title: "Reservation Failed", description: "Could not verify set availability. Please try again.", variant: "destructive" });
        setIsProcessing(false);
        return false;
      }
      
      const alreadyReserved = currentSets?.find(s => s.status === "reserved");
      if (alreadyReserved) {
        toast({ title: "Set Unavailable", description: `Sorry, one or more selected sets (ID: ${alreadyReserved.id.substring(0,8)}...) were just booked. Please select different sets.`, variant: "destructive" });
        setIsProcessing(false);
        return false;
      }
      
      // Calculate total amount
      const totalAmount = selectedSets.reduce(
        (sum, set) => sum + Number(set.price || 0), 
        0
      );
      
      // Define guest reservation explicitly with only the fields we need
      const guestReservationData = {
        beach_id: beach.id,
        guest_name: guestData.name,
        guest_phone: guestData.phone,
        guest_email: guestData.email || null,
        reservation_date: format(selectedDate, "yyyy-MM-dd"),
        payment_amount: totalAmount,
        status: "confirmed",
        payment_status: "completed"
      };
      
      console.log('[handleGuestReservation] Creating guest reservation:', guestReservationData);
      
      // Insert the reservation with explicit fields to avoid any auth references
      const { data: reservation, error: reservationError } = await supabase
        .from("reservations")
        .insert(guestReservationData)
        .select()
        .single();
      
      if (reservationError) {
        console.error("Guest reservation error:", reservationError);
        toast({ title: "Reservation Failed", description: reservationError.message || "Could not create reservation record.", variant: "destructive" });
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
        toast({ title: "Reservation Partially Failed", description: setsError.message || "Could not link sets to reservation. Please contact support.", variant: "destructive" });
        throw setsError;
      }
      
      toast({
        title: "Reservation successful",
        description: `Your reservation has been created with ID: ${reservation.id.substring(0, 8)}`,
      });
      
      // Redirect to reservation confirmation page
      console.log('[useReservationSubmit] Navigating to confirmation after GUEST reservation.');
      navigate(`/reservations/${reservation.id}`, { state: { justReserved: true } });
      return true;
      
    } catch (error: any) {
      console.error("Guest reservation error:", error);
      toast({
        title: "Reservation failed",
        description: error.message || "An unexpected error occurred during guest reservation.",
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
