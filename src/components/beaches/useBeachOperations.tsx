import { useState } from "react";
import { Beach, Set, Zone } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useBeachOperations(beach: Beach, onUpdate: () => void) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Log the beach object received by the hook
  console.log(`[useBeachOperations] Hook initialized for Beach:`, JSON.stringify(beach));

  const handleBeachUpdate = (updatedBeach: Beach) => {
    toast({
      title: "Beach updated",
      description: `${updatedBeach.name} has been successfully updated.`,
    });
    onUpdate();
  };

  const handleDeleteBeach = async () => {
    // Log the beach ID being used for deletion *inside* the handler
    console.log(`[handleDeleteBeach] Attempting to delete beach ID: ${beach?.id}`);
    if (!beach?.id) {
        console.error("[handleDeleteBeach] Aborting delete: Beach ID is missing.");
        toast({ title: "Delete Failed", description: "Cannot delete beach, ID is missing.", variant: "destructive" });
        return;
    }
    try {
      setIsLoading(true);
      
      // Delete all zones belonging to this beach
      console.log(`[handleDeleteBeach] Deleting zones for beach ${beach.id}...`);
      // Try explicitly requesting no data back
      const { error: zonesError } = await supabase
        .from("zones")
        .delete()
        .eq("beach_id", beach.id);
      
      // Log the specific result of deleting zones
      console.log('[handleDeleteBeach] Zones delete result:', { zonesError });
      if (zonesError) {
        console.error('[handleDeleteBeach] Error deleting zones:', zonesError);
        throw zonesError;
      }
      console.log(`[handleDeleteBeach] Zones deleted.`);
      
      // Delete all sets belonging to this beach
      console.log(`[handleDeleteBeach] Deleting sets for beach ${beach.id}...`);
      // Try explicitly requesting no data back
      const { error: setsError } = await supabase
        .from("sets")
        .delete()
        .eq("beach_id", beach.id);
      
      // Log the specific result of deleting sets
      console.log('[handleDeleteBeach] Sets delete result:', { setsError });
      if (setsError) {
        console.error('[handleDeleteBeach] Error deleting sets:', setsError);
        throw setsError;
      }
      console.log(`[handleDeleteBeach] Sets deleted.`);
      
      // Finally delete the beach itself
      console.log(`[handleDeleteBeach] Deleting beach record ${beach.id}...`);
      // Try explicitly requesting no data back
      const { error: beachError } = await supabase
        .from("beaches")
        .delete()
        .eq("id", beach.id);

      // Log the specific result of deleting the beach
      console.log('[handleDeleteBeach] Beach delete result:', { beachError });
      if (beachError) {
         console.error('[handleDeleteBeach] Error deleting beach record:', beachError);
         throw beachError;
      }
      console.log(`[handleDeleteBeach] Beach record reported deleted by client.`);

      toast({
        title: "Beach deleted",
        description: `${beach.name} has been successfully deleted.`,
      });
      console.log('[handleDeleteBeach] Calling onUpdate() after a short delay...');
      // Add a small delay before refreshing UI
      await new Promise(resolve => setTimeout(resolve, 100)); 
      onUpdate();
      console.log('[handleDeleteBeach] onUpdate() called.');
    } catch (error: any) {
      // Detailed error logging
      console.error("-----------------------------------");
      console.error("[handleDeleteBeach] CAUGHT ERROR:", error);
      console.error("Error Type:", typeof error);
      console.error("Error Keys:", Object.keys(error || {}));
      console.error("Error Message:", error?.message);
      console.error("Error Code:", error?.code);
      console.error("Full Error String:", JSON.stringify(error, null, 2));
      console.error("-----------------------------------");
      
      toast({ 
        title: "Delete Failed",
        description: error?.message || "An unexpected error occurred during delete.", // Use optional chaining
        variant: "destructive",
      });
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
