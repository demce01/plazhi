import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Beach } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useAdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("beaches");

  const { data: beaches = [], isLoading: loading, error: beachesError } = useQuery<Beach[], Error>({
    queryKey: ['adminBeaches'],
    queryFn: async () => {
      const { data, error: queryFnError } = await supabase
        .from('beaches')
        .select('*')
        .order('name');
      
      if (queryFnError) {
        console.error("Error loading beaches:", queryFnError);
        throw new Error(queryFnError.message || "Failed to fetch beaches");
      }
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (beachesError) {
      toast({
        title: "Error loading beaches",
        description: beachesError.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }, [beachesError, toast]);

  const refreshBeaches = () => {
    queryClient.invalidateQueries({ queryKey: ['adminBeaches'] });
  };

  const fetchAllBeaches = refreshBeaches;

  const handleBeachCreated = (beach: Beach) => {
    refreshBeaches();
    toast({
      title: "Beach created",
      description: `${beach.name} has been successfully created.`,
    });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
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
