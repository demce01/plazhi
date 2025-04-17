
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
        
        // Create a manager for testing if no managers exist
        // IMPORTANT: This is just for development - remove in production
        try {
          console.log("Attempting to create a test manager");
          
          // Get current user to verify admin status before creating test data
          const { data: authData } = await supabase.auth.getUser();
          if (!authData?.user) {
            console.log("No authenticated user to create test manager");
            setManagers([]);
            return;
          }
          
          // Check if the user is an admin
          const isAdmin = authData.user.app_metadata?.role === 'admin';
          if (!isAdmin) {
            console.log("User is not an admin, cannot create test manager");
            setManagers([]);
            return;
          }
          
          // Create a test manager linked to the admin user
          const { data: testManager, error: createError } = await supabase
            .from('managers')
            .insert({
              user_id: authData.user.id,
              beach_id: null
            })
            .select();
            
          if (createError) {
            console.error("Error creating test manager:", createError);
            setManagers([]);
          } else if (testManager && testManager.length > 0) {
            console.log("Created test manager:", testManager);
            setManagers(testManager);
            
            toast({
              title: "Test manager created",
              description: "A test manager was created for demonstration purposes.",
            });
          }
        } catch (fallbackError: any) {
          console.error("Error in test manager creation:", fallbackError);
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
    if (value === "managers") {
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
