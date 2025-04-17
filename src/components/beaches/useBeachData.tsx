
import { useState, useEffect } from "react";
import { Beach, Set, Zone } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useBeachData(beach: Beach, isExpanded: boolean) {
  const { toast } = useToast();
  const [sets, setSets] = useState<Set[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSets = async () => {
    if (!isExpanded) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("sets")
        .select("*")
        .eq("beach_id", beach.id)
        .order("row_number")
        .order("position");

      if (error) throw error;
      setSets(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to load beach sets: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchZones = async () => {
    if (!isExpanded) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("zones")
        .select("*")
        .eq("beach_id", beach.id)
        .order("created_at");

      if (error) throw error;
      setZones(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to load beach zones: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    fetchZones();
    fetchSets();
  };

  useEffect(() => {
    if (isExpanded) {
      refreshData();
    }
  }, [isExpanded]);

  return {
    sets,
    zones,
    isLoading,
    setSets,
    setZones,
    refreshData
  };
}
