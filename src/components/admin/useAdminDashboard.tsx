
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Beach, Manager } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useAdminDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [beaches, setBeaches] = useState<Beach[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [activeTab, setActiveTab] = useState("beaches");

  useEffect(() => {
    fetchAllBeaches();
    fetchAllManagers();
  }, []);

  const fetchAllBeaches = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('beaches')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setBeaches(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading beaches",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllManagers = async () => {
    try {
      setLoading(true);
      console.log("Fetching managers...");
      
      // Fetch manager records from the managers table
      const { data: managerData, error: managerError } = await supabase
        .from('managers')
        .select('*');
      
      if (managerError) {
        console.error("Error fetching managers:", managerError);
        throw managerError;
      }
      
      // Check if we actually retrieved any managers
      console.log("Fetched manager records:", managerData);
      
      if (managerData && managerData.length > 0) {
        setManagers(managerData);
      } else {
        // If no managers found in the database, log it
        console.log("No manager records found in database");
        
        // Try a different approach to fetch managers if needed
        try {
          // This is a more direct query without using the non-existent RPC function
          const { data: directData, error: directError } = await supabase
            .from('managers')
            .select('*')
            .limit(100);
            
          if (directError) {
            console.error("Error with direct manager query:", directError);
            setManagers([]);
          } else if (directData && directData.length > 0) {
            console.log("Found managers through direct query:", directData);
            setManagers(directData);
          } else {
            console.log("No managers found through any method");
            setManagers([]);
          }
        } catch (fallbackError: any) {
          console.error("Error in fallback manager query:", fallbackError);
          setManagers([]);
        }
      }
    } catch (error: any) {
      console.error("Error loading managers:", error);
      toast({
        title: "Error loading managers",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBeachCreated = (beach: Beach) => {
    setBeaches(prev => [...prev, beach]);
    toast({
      title: "Beach created",
      description: `${beach.name} has been successfully created.`,
    });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Refresh data when switching to certain tabs
    if (value === "managers" || value === "manager-management") {
      fetchAllManagers();
    }
    if (value === "beaches") {
      fetchAllBeaches();
    }
  };

  return {
    loading,
    beaches,
    managers,
    activeTab,
    setActiveTab: handleTabChange,
    fetchAllBeaches,
    fetchAllManagers,
    handleBeachCreated
  };
}
