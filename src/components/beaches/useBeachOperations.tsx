
import { useState } from "react";
import { Beach, Set, Zone } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useBeachOperations(beach: Beach, onUpdate: () => void) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleBeachUpdate = (updatedBeach: Beach) => {
    toast({
      title: "Beach updated",
      description: `${updatedBeach.name} has been successfully updated.`,
    });
    onUpdate();
  };

  const handleDeleteBeach = async () => {
    try {
      setIsLoading(true);
      
      // First, check for any managers that might be assigned to this beach
      const { data: managers, error: managersError } = await supabase
        .from("managers")
        .select("id")
        .eq("beach_id", beach.id);
        
      if (managersError) throw managersError;
      
      // If there are managers assigned to this beach, unassign them
      if (managers && managers.length > 0) {
        const { error: updateError } = await supabase
          .from("managers")
          .update({ beach_id: null })
          .eq("beach_id", beach.id);
          
        if (updateError) throw updateError;
      }
      
      // Delete all zones belonging to this beach
      const { error: zonesError } = await supabase
        .from("zones")
        .delete()
        .eq("beach_id", beach.id);
      
      if (zonesError) throw zonesError;
      
      // Delete all sets belonging to this beach
      const { error: setsError } = await supabase
        .from("sets")
        .delete()
        .eq("beach_id", beach.id);
      
      if (setsError) throw setsError;
      
      // Check for reservations related to this beach
      const { data: reservations, error: reservationsError } = await supabase
        .from("reservations")
        .select("id")
        .eq("beach_id", beach.id);
        
      if (reservationsError) throw reservationsError;
      
      // If there are reservations, delete them
      if (reservations && reservations.length > 0) {
        // Delete reservation_sets for each reservation
        for (const reservation of reservations) {
          const { error: rSetsError } = await supabase
            .from("reservation_sets")
            .delete()
            .eq("reservation_id", reservation.id);
            
          if (rSetsError) throw rSetsError;
        }
        
        // Now delete the reservations
        const { error: deleteReservationsError } = await supabase
          .from("reservations")
          .delete()
          .eq("beach_id", beach.id);
          
        if (deleteReservationsError) throw deleteReservationsError;
      }
      
      // Finally delete the beach itself
      const { error } = await supabase
        .from("beaches")
        .delete()
        .eq("id", beach.id);

      if (error) throw error;

      toast({
        title: "Beach deleted",
        description: `${beach.name} has been successfully deleted.`,
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete beach: ${error.message}`,
        variant: "destructive",
      });
      console.error("Delete beach error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetAdded = (newSet: Set, sets: Set[], setSets: (sets: Set[]) => void) => {
    setSets([...sets, newSet]);
    toast({
      title: "Set added",
      description: `${newSet.name} has been added to ${beach.name}.`,
    });
  };

  const handleZoneAdded = (newZone: Zone, zones: Zone[], setZones: (zones: Zone[]) => void) => {
    setZones([...zones, newZone]);
    toast({
      title: "Zone created",
      description: `${newZone.name} zone has been created with ${newZone.rows * newZone.spots_per_row} sets.`,
    });
  };

  return {
    isLoading,
    handleBeachUpdate,
    handleDeleteBeach,
    handleSetAdded,
    handleZoneAdded
  };
}
