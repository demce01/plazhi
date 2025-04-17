
import { useState } from "react";
import { Manager, Beach } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useManagerOperations(onUpdate: () => void) {
  const { toast } = useToast();
  const [updating, setUpdating] = useState<string | null>(null);

  const getBeachName = (beachId: string | null, beaches: Beach[]) => {
    if (!beachId) return "Not assigned";
    const beach = beaches.find(b => b.id === beachId);
    return beach ? beach.name : "Unknown Beach";
  };

  const handleBeachAssignment = async (managerId: string, beachId: string | null, beaches: Beach[]) => {
    try {
      setUpdating(managerId);
      
      const { data, error } = await supabase
        .from("managers")
        .update({ beach_id: beachId === "none" ? null : beachId })
        .eq("id", managerId)
        .select();
      
      if (error) throw error;
      
      console.log("Manager updated:", data);
      
      toast({
        title: "Manager updated",
        description: beachId && beachId !== "none" 
          ? `Manager assigned to ${getBeachName(beachId, beaches)}`
          : "Manager removed from beach assignment",
      });
      
      onUpdate();
    } catch (error: any) {
      console.error("Failed to update manager:", error);
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  return {
    updating,
    getBeachName,
    handleBeachAssignment
  };
}
