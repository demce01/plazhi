
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
      
      console.log("Creating new manager with values:", values);
      
      // First create the auth user using regular signup flow instead of admin API
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            fullName: values.fullName,
            role: 'manager'
          },
          emailRedirectTo: window.location.origin
        }
      });
      
      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error("Failed to create user account");
      }

      console.log("Created auth user:", authData.user);

      // Create a new manager record linked to the auth user
      const { data: managerData, error: managerError } = await supabase
        .from("managers")
        .insert({
          user_id: authData.user.id,
          beach_id: values.beach_id === "none" ? null : values.beach_id,
        })
        .select();
      
      if (managerError) {
        // If manager creation fails, we should clean up the auth user
        // Note: We can't delete users from the client, so we'll just log this 
        // and admin would need to clean up manually if needed
        console.error("Failed to create manager record. User was created but manager record failed:", managerError);
        throw managerError;
      }
      
      if (managerData && managerData.length > 0) {
        console.log("Created manager record:", managerData);
        
        toast({
          title: "Manager account created",
          description: `New manager account created for ${values.email}. An email confirmation was sent.`,
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
