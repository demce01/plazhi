
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
        console.log("No managers provided to useManagerDetails");
        setEnrichedManagers([]);
        return;
      }

      setLoading(true);
      try {
        console.log("Fetching details for managers:", managers);
        
        // Create a copy of the managers array and enrich it with user details
        const managersWithDetails: ManagerWithUserDetails[] = [...managers];
        
        // For development testing without real auth users
        if (process.env.NODE_ENV === 'development') {
          // Add some fake user details for testing
          for (let i = 0; i < managersWithDetails.length; i++) {
            managersWithDetails[i].userDetails = {
              email: `manager${i+1}@example.com`,
              fullName: `Test Manager ${i+1}`,
            };
          }
          
          console.log("Added development test data to managers:", managersWithDetails);
          setEnrichedManagers(managersWithDetails);
          setLoading(false);
          return;
        }
        
        // Fetch user details for each manager directly from auth.users
        for (let i = 0; i < managersWithDetails.length; i++) {
          const manager = managersWithDetails[i];
          
          if (manager.user_id) {
            console.log("Fetching details for manager with user_id:", manager.user_id);
            
            try {
              // Get user data from Supabase Auth
              const { data: userData, error } = await supabase.auth.admin.getUserById(
                manager.user_id
              );
              
              if (error) {
                console.error(`Error fetching user details for manager ${manager.id}:`, error);
                continue;
              }
              
              if (userData && userData.user) {
                console.log("Found user data:", userData.user.email);
                
                // Add user details to the manager object
                const userMetadata = userData.user.user_metadata || {};
                
                managersWithDetails[i].userDetails = {
                  email: userData.user.email,
                  fullName: userMetadata.full_name || userMetadata.name || 'Manager',
                };
              } else {
                console.log("No user data found for manager:", manager.user_id);
              }
            } catch (error) {
              console.error(`Error processing user details for manager ${manager.id}:`, error);
            }
          }
        }
        
        console.log("Enriched managers with details:", managersWithDetails);
        setEnrichedManagers(managersWithDetails);
      } catch (error: any) {
        console.error("Error fetching user details:", error);
        toast({
          title: "Error loading user details",
          description: "There was a problem fetching user information",
          variant: "destructive",
        });
        
        // Still set the managers even if we couldn't enrich them
        setEnrichedManagers([...managers]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [managers, toast]);

  return { enrichedManagers, loading };
}
