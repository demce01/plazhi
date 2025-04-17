
import { useState } from "react";
import { Beach, Set, Zone } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { UserSession } from "@/types";

export function useReservation(
  beach: Beach | null, 
  selectedDate: Date,
  userSession: UserSession
) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, clientId } = userSession;
  
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedSets, setSelectedSets] = useState<Set[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [currentStep, setCurrentStep] = useState<"date" | "location" | "payment">("date");

  const handleSelectSet = (set: Set) => {
    if (set.status === "reserved") return;
    
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

  const handleZoneSelect = (zone: Zone) => {
    setSelectedZone(zone);
    // Clear selected sets when changing zone
    setSelectedSets([]);
    // Move to next step
    setCurrentStep("location");
  };

  const getSetsForZone = (zoneName: string, sets: Set[]) => {
    return sets.filter(set => set.name.startsWith(zoneName));
  };

  const getSetsByRow = (zoneSets: Set[]) => {
    const rows = new Map<number, Set[]>();
    
    zoneSets.forEach(set => {
      const rowNum = set.row_number || 0;
      if (!rows.has(rowNum)) {
        rows.set(rowNum, []);
      }
      rows.get(rowNum)?.push(set);
    });
    
    // Sort rows by row number and sets by position within each row
    return Array.from(rows.entries())
      .sort(([a], [b]) => a - b)
      .map(([rowNum, sets]) => ({
        rowNum,
        sets: sets.sort((a, b) => (a.position || 0) - (b.position || 0))
      }));
  };

  const handleReservation = async () => {
    if (!user || !clientId) {
      setShowGuestForm(true);
      return;
    }
    
    if (selectedSets.length === 0) {
      toast({
        title: "No sets selected",
        description: "Please select at least one beach set to reserve.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      
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
      
      if (reservationError) throw reservationError;
      
      // Create reservation_sets entries
      const reservationSets = selectedSets.map(set => ({
        reservation_id: reservation.id,
        set_id: set.id,
        price: set.price,
      }));
      
      const { error: setsError } = await supabase
        .from("reservation_sets")
        .insert(reservationSets);
      
      if (setsError) throw setsError;
      
      toast({
        title: "Reservation successful",
        description: `Your reservation has been created with ID: ${reservation.id.substring(0, 8)}`,
      });
      
      // Redirect to reservation confirmation page
      navigate(`/reservations/${reservation.id}`);
      
    } catch (error: any) {
      toast({
        title: "Reservation failed",
        description: error.message,
        variant: "destructive",
      });
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
      return;
    }
    
    try {
      setIsProcessing(true);
      
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
          guest_email: guestData.email,
          reservation_date: format(selectedDate, "yyyy-MM-dd"),
          payment_amount: totalAmount,
        })
        .select()
        .single();
      
      if (reservationError) throw reservationError;
      
      // Create reservation_sets entries
      const reservationSets = selectedSets.map(set => ({
        reservation_id: reservation.id,
        set_id: set.id,
        price: set.price,
      }));
      
      const { error: setsError } = await supabase
        .from("reservation_sets")
        .insert(reservationSets);
      
      if (setsError) throw setsError;
      
      toast({
        title: "Reservation successful",
        description: `Your reservation has been created with ID: ${reservation.id.substring(0, 8)}`,
      });
      
      // Redirect to reservation confirmation page
      navigate(`/reservations/${reservation.id}`);
      
    } catch (error: any) {
      toast({
        title: "Reservation failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setShowGuestForm(false);
    }
  };

  const goToStep = (step: "date" | "location" | "payment") => {
    if (step === "location" && !selectedDate) {
      toast({
        title: "Please select a date first",
        variant: "destructive",
      });
      return;
    }
    
    if (step === "payment" && selectedSets.length === 0) {
      toast({
        title: "Please select at least one set",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentStep(step);
  };

  return {
    selectedZone,
    selectedSets,
    currentStep,
    isProcessing,
    showGuestForm,
    handleSelectSet,
    handleRemoveSet,
    handleZoneSelect,
    getSetsForZone,
    getSetsByRow,
    handleReservation,
    handleGuestReservation,
    goToStep,
    setShowGuestForm
  };
}
