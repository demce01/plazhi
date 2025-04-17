
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useTestManager(onSuccess: () => void) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const createTestManager = async () => {
    try {
      setIsLoading(true);
      
      // Get current user to verify admin status
      const { data: authData } = await supabase.auth.getUser();
      
      if (!authData.user) {
        throw new Error("You must be logged in to create a test manager");
      }
      
      // Verify admin role from JWT claims
      const isAdmin = authData.user.app_metadata?.role === 'admin';
      
      if (!isAdmin) {
        throw new Error("Only admin users can create test managers");
      }
      
      console.log("Creating test manager...");
      
      // Create a test manager linked to the admin user
      const { data: testManager, error: createError } = await supabase
        .from('managers')
        .insert({
          user_id: authData.user.id,
          beach_id: null
        })
        .select();
        
      if (createError) {
        throw createError;
      }
      
      if (testManager && testManager.length > 0) {
        console.log("Created test manager:", testManager);
        
        toast({
          title: "Test manager created",
          description: "A test manager was created for development purposes.",
        });
        
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error creating test manager:", error);
      toast({
        title: "Failed to create test manager",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    createTestManager
  };
}
