
import { useState, useCallback, useEffect } from 'react';
import { adminSupabase } from '@/integrations/supabase/admin-client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast as sonnerToast } from "sonner";
import { useAuth } from '@/contexts/auth';
import { useBeachSelection } from './useBeachSelection';
import { useDateAndZoneSelection } from './useDateAndZoneSelection';
import { useSetSelection } from './useSetSelection';

interface GuestData {
  name: string;
  phone: string;
  email?: string;
}

export function useOnSiteReservation() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userSession } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guestData, setGuestData] = useState<GuestData | null>(null);

  const {
    beaches,
    selectedBeach,
    isBeachLoading,
    setSelectedBeach
  } = useBeachSelection();

  const {
    selectedDate,
    setSelectedDate,
    zones,
    sets,
    selectedZone,
    isLayoutLoading,
    setSelectedZone,
    fetchLayoutAndSetStatuses,
    handleZoneSelect
  } = useDateAndZoneSelection();

  const {
    selectedSets,
    handleSelectSet,
    handleRemoveSet,
    setSelectedSets
  } = useSetSelection();

  // Use fetchLayoutAndSetStatuses when beach changes
  useEffect(() => {
    if (!selectedBeach || !selectedDate) {
      return;
    }

    fetchLayoutAndSetStatuses(selectedBeach, selectedDate);
  }, [selectedBeach, selectedDate, fetchLayoutAndSetStatuses]);

  const submitOnSiteReservation = useCallback(async () => {
    if (!selectedBeach || selectedSets.length === 0 || !guestData) {
      toast({
        title: "Missing Information",
        description: "Please select a beach, at least one set, and provide guest details.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const totalAmount = selectedSets.reduce((sum, set) => sum + Number(set.price || 0), 0);
      
      const reservationDataToInsert = {
        beach_id: selectedBeach.id,
        guest_name: guestData.name,
        guest_phone: guestData.phone,
        guest_email: guestData.email || null,
        reservation_date: format(selectedDate, "yyyy-MM-dd"),
        payment_amount: totalAmount,
        status: "confirmed",
        payment_status: "paid_on_site",
        created_by: userSession?.user?.id || null,
        client_id: null, 
        checked_in: false 
      };

      console.log("Creating on-site reservation with data:", reservationDataToInsert);
      
      const { data: reservation, error: reservationError } = await adminSupabase
        .from("reservations")
        .insert(reservationDataToInsert)
        .select()
        .single();
      
      if (reservationError) {
        console.error("Reservation creation error:", reservationError);
        throw reservationError;
      }
      
      console.log("Reservation created successfully:", reservation);
      
      const reservationSets = selectedSets.map(set => ({
        reservation_id: reservation.id,
        set_id: set.id,
        price: set.price, 
      }));
      
      console.log("Creating reservation sets:", reservationSets);
      
      const { error: setsError } = await adminSupabase
        .from("reservation_sets")
        .insert(reservationSets);
      
      if (setsError) {
         console.error("Reservation sets error, attempting rollback of reservation:", setsError);
         await adminSupabase.from('reservations').delete().eq('id', reservation.id);
         throw new Error(`Failed to link sets to reservation: ${setsError.message}. Reservation cancelled.`);
      }
      
      sonnerToast.success("On-site reservation created successfully!");
      navigate(`/admin/reservations/${reservation.id}`);

    } catch (error: any) {
      console.error("On-site reservation error:", error);
      toast({
        title: "Reservation Failed",
        description: error.message || "Could not create the on-site reservation.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedBeach, selectedSets, guestData, selectedDate, toast, navigate, userSession]);

  return {
    isLoading: isBeachLoading || isLayoutLoading,
    isSubmitting,
    beaches,
    selectedBeach,
    setSelectedBeach,
    selectedDate,
    setSelectedDate,
    zones,
    sets, 
    selectedZone,
    setSelectedZone,
    selectedSets,
    handleSelectSet,
    handleRemoveSet,
    setGuestData,
    submitOnSiteReservation,
    handleZoneSelect
  };
}
