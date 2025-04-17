
import { useState, useEffect } from "react";
import { Beach, Zone } from "@/types";
import type { Set } from "@/types"; // Changed to type-only import to avoid conflict with global Set
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export function useBeachDetails(beachId: string | undefined) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [beach, setBeach] = useState<Beach | null>(null);
  const [sets, setSets] = useState<Set[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [reservedSets, setReservedSets] = useState<Set[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Fetch beach details
  useEffect(() => {
    if (!beachId) return;
    
    fetchBeach(beachId);
  }, [beachId]);

  // Fetch sets and zones when beach or date changes
  useEffect(() => {
    if (beach?.id && selectedDate) {
      fetchBeachSets(beach.id, selectedDate);
      fetchBeachZones(beach.id);
    }
  }, [beach, selectedDate]);

  const fetchBeach = async (beachId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("beaches")
        .select("*")
        .eq("id", beachId)
        .single();
      
      if (error) throw error;
      setBeach(data);
    } catch (error: any) {
      toast({
        title: "Error loading beach",
        description: error.message,
        variant: "destructive",
      });
      navigate("/beaches");
    } finally {
      setLoading(false);
    }
  };

  const fetchBeachZones = async (beachId: string) => {
    try {
      const { data, error } = await supabase
        .from("zones")
        .select("*")
        .eq("beach_id", beachId)
        .order("name");
      
      if (error) throw error;
      
      console.log("Fetched zones:", data);
      
      setZones(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading beach zones",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchBeachSets = async (beachId: string, date: Date) => {
    try {
      // Fetch all sets for this beach
      const { data: allSets, error: setsError } = await supabase
        .from("sets")
        .select("*")
        .eq("beach_id", beachId)
        .order("row_number")
        .order("position");
      
      if (setsError) throw setsError;
      
      console.log("All sets fetched:", allSets?.length || 0);
      
      // Fetch reserved sets for this date
      const formattedDate = format(date, "yyyy-MM-dd");
      const { data: reservations, error: reservationsError } = await supabase
        .from("reservations")
        .select(`
          id,
          reservation_sets (
            set_id
          )
        `)
        .eq("beach_id", beachId)
        .eq("reservation_date", formattedDate)
        .not("status", "eq", "cancelled");
      
      if (reservationsError) throw reservationsError;
      
      // Mark sets as reserved if they're in a reservation
      const reservedSetIds = new Set<string>();
      reservations?.forEach(reservation => {
        reservation.reservation_sets?.forEach((rs: any) => {
          reservedSetIds.add(rs.set_id);
        });
      });
      
      const updatedSets = allSets?.map(set => ({
        ...set,
        status: reservedSetIds.has(set.id) ? "reserved" : "available"
      })) || [];
      
      console.log("Fetched sets:", updatedSets.length);
      
      setSets(updatedSets);
      setReservedSets(updatedSets.filter(set => set.status === "reserved"));
    } catch (error: any) {
      toast({
        title: "Error loading beach sets",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    loading,
    beach,
    sets,
    zones,
    reservedSets,
    selectedDate,
    setSelectedDate,
  };
}
