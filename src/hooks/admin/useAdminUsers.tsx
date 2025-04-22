
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Define the structure of the user data returned by the RPC
export interface AdminManagedUser {
  user_id: string;
  email: string | null;
  role: string | null;
}

export function useAdminUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchUsersAdmin = async (): Promise<AdminManagedUser[]> => {
    try {
      // RLS policy on the function handles authorization
      const { data, error } = await supabase.rpc('list_all_users');

      if (error) {
        console.error("Admin: Error listing users:", error);
        // Check for specific permission error if needed
        if (error.code === 'P0001' || error.message.includes('Requires admin privileges')) { 
            throw new Error("You do not have permission to view users.");
        } else {
            throw new Error(error.message || "Failed to list users");
        }
      }
      return data || [];
    } catch (error: any) {
      console.error("Error in fetchUsersAdmin:", error);
      throw error;
    }
  };

  const { 
    data: users = [], 
    isLoading,
    error 
  } = useQuery<AdminManagedUser[], Error>({
    queryKey: ['adminUsers'],
    queryFn: fetchUsersAdmin,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Handle error state
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading users",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Function to trigger refetch
  const refreshUsers = () => {
    queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
  };

  return {
    isLoading,
    users,
    refreshUsers,
  };
}
