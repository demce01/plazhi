
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Reservation, Beach, Set } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export function useReservationDetail(reservationId: string | undefined) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [beach, setBeach] = useState<Beach | null>(null);
  const [sets, setSets] = useState<Set[]>([]);

  useEffect(() => {
    if (!reservationId) return;
    fetchReservation(reservationId);
  }, [reservationId]);

  const fetchReservation = async (reservationId: string) => {
    try {
      setLoading(true);
      
      // Fetch reservation details
      const { data, error } = await supabase
        .from("reservations")
        .select(`
          *,
          beach:beach_id (*),
          reservation_sets (
            *,
            set:set_id (*)
          )
        `)
        .eq("id", reservationId)
        .single();
      
      if (error) throw error;
      
      // Extract data
      setReservation(data);
      setBeach(data.beach);
      
      // Extract sets from reservation_sets
      const reservedSets = data.reservation_sets.map((rs: any) => rs.set);
      setSets(reservedSets);
      
    } catch (error: any) {
      toast({
        title: "Error loading reservation",
        description: error.message,
        variant: "destructive",
      });
      navigate("/beaches");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!reservation || !reservationId) return;
    
    try {
      const { data, error } = await supabase
        .from("reservations")
        .update({ 
          checked_in: true,
          updated_at: new Date().toISOString()
        })
        .eq("id", reservationId)
        .select();
      
      if (error) throw error;
      
      console.log("Check-in successful", data);
      setReservation({ ...reservation, checked_in: true });
      
      toast({
        title: "Guest checked in",
        description: "Guest has been successfully checked in",
      });
    } catch (error: any) {
      console.error("Failed to check in guest:", error);
      toast({
        title: "Error checking in guest",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatReservationId = (id: string) => {
    return id.substring(0, 8).toUpperCase();
  };

  return {
    loading,
    reservation,
    beach,
    sets,
    handleCheckIn,
    formatReservationId
  };
}
