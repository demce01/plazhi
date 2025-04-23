
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Beach, Set, Zone, Database } from '@/types';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast as sonnerToast } from "sonner";

// Explicit type for the RPC result if needed, otherwise rely on generated types
// type SetWithStatus = Set & { status: 'available' | 'reserved' };

interface GuestData {
  name: string;
  phone: string;
  email?: string;
}

export function useOnSiteReservation() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [beaches, setBeaches] = useState<Beach[]>([]);
  const [selectedBeach, setSelectedBeach] = useState<Beach | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [zones, setZones] = useState<Zone[]>([]);
  const [sets, setSets] = useState<Set[]>([]); // Holds ALL sets + status from RPC
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedSets, setSelectedSets] = useState<Set[]>([]);
  const [guestData, setGuestData] = useState<GuestData | null>(null);

  // Fetch all beaches for selection
  useEffect(() => {
    const fetchBeaches = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('beaches').select('*');
      if (error) {
        toast({ title: 'Error fetching beaches', description: error.message, variant: 'destructive' });
      } else {
        setBeaches(data || []);
      }
      setIsLoading(false);
    };
    fetchBeaches();
  }, [toast]);

  // Fetch zones and AVAILABLE sets when beach and date change
  useEffect(() => {
    if (!selectedBeach || !selectedDate) {
        setZones([]);
        setSets([]); 
        setSelectedZone(null);
        setSelectedSets([]); 
        return;
    }

    const fetchLayoutAndSetStatuses = async () => {
      setIsLoading(true);
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      console.log(`Fetching layout and set statuses for beach ${selectedBeach.id} on ${dateString}`);

      try {
        // Fetch zones concurrently
        const zonesPromise = supabase
          .from('zones')
          .select('*')
          .eq('beach_id', selectedBeach.id);

        // Fetch all sets with their status using the RPC function
        // Use explicit type from generated Database types if needed
        const setsWithStatusPromise = supabase.rpc('get_sets_with_status', {
          target_beach_id: selectedBeach.id,
          target_date: dateString
        });
        // Type assertion if needed: as Promise<{ data: SetWithStatus[] | null; error: any }>
        
        const [zonesResult, setsWithStatusResult] = await Promise.all([zonesPromise, setsWithStatusPromise]);

        // Handle zones result
        if (zonesResult.error) throw zonesResult.error;
        setZones(zonesResult.data || []);

        // Handle sets with status result
        if (setsWithStatusResult.error) throw setsWithStatusResult.error;
        // Now Supabase types should know the return type of the RPC
        const allSetsWithStatus = setsWithStatusResult.data || []; 
        setSets(allSetsWithStatus as Set[]); // Assert type if RPC return doesn't perfectly match base Set type

      } catch (error: any) {
        console.error("Error fetching layout/sets:", error);
        toast({ title: 'Error loading beach layout', description: error.message, variant: 'destructive' });
        setZones([]);
        setSets([]);
      } finally {
        setIsLoading(false);
        setSelectedZone(null); 
        setSelectedSets([]); 
      }
    };

    fetchLayoutAndSetStatuses();
  }, [selectedBeach, selectedDate, toast]); 

  const handleSelectSet = (set: Set) => {
    // Find the set in our current state to check its actual status
    const setInState = sets.find(s => s.id === set.id);
    // Use the status field returned by the RPC
    if (setInState && (setInState as any).status === 'reserved') { 
        toast({ 
            title: "Set Reserved", 
            description: `${set.name} is already reserved for this date.`, 
        });
        return; // Don't allow selecting reserved sets
    }

    setSelectedSets(prev => {
      const isSelected = prev.some(s => s.id === set.id);
      if (isSelected) {
        return prev.filter(s => s.id !== set.id);
      } else {
        return [...prev, set]; 
      }
    });
  };

  const handleRemoveSet = (setId: string) => {
    setSelectedSets(prev => prev.filter(s => s.id !== setId));
  };

  const handleZoneSelect = (zone: Zone | null) => {
    setSelectedZone(zone);
  };

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
       // Optional final availability check here

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
        client_id: null, 
        checked_in: false 
      };

      const { data: reservation, error: reservationError } = await supabase
        .from("reservations")
        .insert(reservationDataToInsert)
        .select()
        .single();
      
      if (reservationError) throw reservationError;
      
      const reservationSets = selectedSets.map(set => ({
        reservation_id: reservation.id,
        set_id: set.id,
        price: set.price, 
      }));
      
      const { error: setsError } = await supabase
        .from("reservation_sets")
        .insert(reservationSets);
      
      if (setsError) {
         console.error("Reservation sets error, attempting rollback of reservation:", setsError);
         await supabase.from('reservations').delete().eq('id', reservation.id);
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
  }, [selectedBeach, selectedSets, guestData, selectedDate, toast, navigate]);

  return {
    isLoading,
    isSubmitting,
    beaches,
    selectedBeach,
    setSelectedBeach: setSelectedBeach as React.Dispatch<React.SetStateAction<Beach | null>>,
    selectedDate,
    setSelectedDate: setSelectedDate as React.Dispatch<React.SetStateAction<Date>>,
    zones,
    sets, 
    selectedZone,
    handleZoneSelect: handleZoneSelect as (zone: Zone | null) => void,
    selectedSets,
    handleSelectSet: handleSelectSet as (set: Set) => void,
    handleRemoveSet: handleRemoveSet as (setId: string) => void,
    setGuestData: setGuestData as React.Dispatch<React.SetStateAction<GuestData | null>>,
    submitOnSiteReservation,
  };
} 
