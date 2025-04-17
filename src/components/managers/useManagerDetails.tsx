
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Manager } from "@/types";
import { useToast } from "@/hooks/use-toast";

export interface ManagerWithUserDetails extends Manager {
  userDetails?: {
    email?: string;
    fullName?: string;
  };
}

export function useManagerDetails(managers: Manager[]) {
  const [enrichedManagers, setEnrichedManagers] = useState<ManagerWithUserDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!managers.length) {
        setEnrichedManagers([]);
        return;
      }

      setLoading(true);
      try {
        // Create a copy of the managers array and enrich it with user details
        const managersWithDetails = [...managers];
        
        // Fetch user details for each manager
        for (let i = 0; i < managersWithDetails.length; i++) {
          const manager = managersWithDetails[i];
          
          if (manager.user_id) {
            const { data, error } = await supabase.auth.admin.getUserById(
              manager.user_id
            );
            
            if (error) {
              console.error(`Error fetching user details for manager ${manager.id}:`, error);
              continue;
            }
            
            if (data && data.user) {
              // Add user details to the manager object
              const userMetadata = data.user.user_metadata || {};
              
              (managersWithDetails[i] as ManagerWithUserDetails).userDetails = {
                email: data.user.email,
                fullName: userMetadata.full_name || userMetadata.name || 'N/A',
              };
            }
          }
        }
        
        setEnrichedManagers(managersWithDetails as ManagerWithUserDetails[]);
      } catch (error: any) {
        console.error("Error fetching user details:", error);
        toast({
          title: "Error loading user details",
          description: "There was a problem fetching user information",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [managers, toast]);

  return { enrichedManagers, loading };
}
