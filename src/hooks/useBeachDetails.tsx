import { useState, useEffect } from "react";
import { Beach, Zone, Set, Database } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

// Helper function to format date consistently for query keys
const formatDateKey = (date: Date): string => format(date, "yyyy-MM-dd");

export function useBeachDetails(beachId: string | undefined) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Fetch Beach Details
  const { data: beach, isLoading: isLoadingBeach, error: beachError } = useQuery<Beach | null, Error>({
    queryKey: ['beachDetails', beachId],
    queryFn: async () => {
      if (!beachId) return null;
      const { data, error } = await supabase
        .from("beaches")
        .select("*")
        .eq("id", beachId)
        .single();
      if (error) throw new Error(error.message || "Failed to fetch beach details");
      return data;
    },
    enabled: !!beachId, // Only run if beachId is available
    staleTime: 15 * 60 * 1000, // Beach details likely don't change often
  });

  // Fetch Zones
  const { data: zones = [], isLoading: isLoadingZones, error: zonesError } = useQuery<Zone[], Error>({
    queryKey: ['beachZones', beachId],
    queryFn: async () => {
      if (!beachId) return [];
      const { data, error } = await supabase
        .from("zones")
        .select("*")
        .eq("beach_id", beachId)
        .order("name");
      if (error) throw new Error(error.message || "Failed to fetch zones");
      return data || [];
    },
    enabled: !!beachId, // Only run if beachId is available
    staleTime: 15 * 60 * 1000,
  });

  // Fetch Sets using the RPC to get status directly
  const { data: sets = [], isLoading: isLoadingSets, error: setsError } = useQuery<Set[], Error>({
    queryKey: ['beachSetsWithStatus', beachId, formatDateKey(selectedDate)],
    queryFn: async () => {
      if (!beachId) return [];
      const dateString = formatDateKey(selectedDate);
      
      // Call the RPC function
      const { data, error } = await supabase.rpc('get_sets_with_status', { 
        target_beach_id: beachId,
        target_date: dateString
      });
      
      // Log the raw RPC response
      console.log(`[useBeachDetails] RPC response for ${dateString}:`, { data, error });

      if (error) {
        console.error("RPC get_sets_with_status error:", error);
        throw new Error(error.message || "Failed to fetch set availability");
      }
      // The RPC result should match the structure, potentially needs casting if types aren't perfect
      return (data as Set[]) || []; 
    },
    enabled: !!beachId, 
    staleTime: 1 * 60 * 1000, // Keep relatively short stale time for availability
  });

  // Combined loading state
  const loading = isLoadingBeach || isLoadingZones || isLoadingSets;
  
  // Handle errors (consider more specific error handling)
  useEffect(() => {
    const firstError = beachError || zonesError || setsError;
    if (firstError) {
      toast({
        title: "Error loading beach data",
        description: firstError.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      // Navigate away only if the core beach details fail?
      if (beachError && !beach) { 
           console.error("Redirecting due to beachError and no beach data");
           navigate("/beaches");
      }
    }
  }, [beachError, zonesError, setsError, toast, navigate, beach]);

  return {
    loading,
    beach: beach || null, // Ensure beach is null if undefined
    sets, 
    zones, 
    selectedDate,
    setSelectedDate,
  };
}
