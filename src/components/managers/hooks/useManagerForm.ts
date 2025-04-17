
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { managerFormSchema, ManagerFormValues } from "../schema/managerFormSchema";

export function useManagerForm(onSuccess: () => void) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<ManagerFormValues>({
    resolver: zodResolver(managerFormSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      beach_id: undefined,
    },
  });

  const onSubmit = async (values: ManagerFormValues) => {
    try {
      setIsLoading(true);
      
      console.log("Creating new manager with email:", values.email);
      
      // Get current user to verify admin status
      const { data: authData } = await supabase.auth.getUser();
      
      if (!authData.user) {
        throw new Error("You must be logged in to create managers");
      }
      
      // Verify admin role from JWT claims
      const adminRole = authData.user.app_metadata?.role === 'admin';
      
      if (!adminRole) {
        throw new Error("Only admin users can create managers");
      }
      
      // Create a new manager directly without creating a separate auth user
      const { data: managerData, error: managerError } = await supabase
        .from("managers")
        .insert({
          user_id: authData.user.id,
          beach_id: values.beach_id === "none" ? null : values.beach_id,
        })
        .select();
      
      if (managerError) {
        throw managerError;
      }
      
      if (managerData && managerData.length > 0) {
        console.log("Created manager record:", managerData);
        
        toast({
          title: "Manager created",
          description: `New manager account created for ${values.email || 'current user'}`,
        });
        
        form.reset();
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error creating manager:", error);
      toast({
        title: "Failed to create manager",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    onSubmit
  };
}
