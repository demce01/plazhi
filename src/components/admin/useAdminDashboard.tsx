import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Beach } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useAdminDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [beaches, setBeaches] = useState<Beach[]>([]);
  const [activeTab, setActiveTab] = useState("beaches");

  useEffect(() => {
    fetchAllBeaches();
  }, []);

  const fetchAllBeaches = async () => {
    try {
      setLoading(true);
      setBeaches([]);
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

  const handleBeachCreated = (beach: Beach) => {
    setBeaches(prev => [...prev, beach]);
    toast({
      title: "Beach created",
      description: `${beach.name} has been successfully created.`,
    });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Refresh data when switching to beaches tab
    if (value === "beaches") {
      fetchAllBeaches();
    }
  };

  return {
    loading,
    beaches,
    activeTab,
    setActiveTab: handleTabChange,
    fetchAllBeaches,
    handleBeachCreated
  };
}
