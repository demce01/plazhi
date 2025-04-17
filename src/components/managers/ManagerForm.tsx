import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Beach } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  fullName: z.string().min(2, { message: "Full name is required" }),
  beach_id: z.string().optional(),
});

interface ManagerFormProps {
  beaches: Beach[];
  onSuccess: () => void;
}

export function ManagerForm({ beaches, onSuccess }: ManagerFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      beach_id: undefined,
    },
  });

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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
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

  return (
    <div className="space-y-6">
      {/* Quick test manager creator for development */}
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={() => setIsTestMode(!isTestMode)}
          className="text-xs"
          type="button"
        >
          {isTestMode ? "Hide Test Options" : "Show Test Options"}
        </Button>
      </div>
      
      {isTestMode && (
        <div className="p-4 border rounded-lg bg-muted/30 mb-4">
          <h3 className="text-sm font-medium mb-2">Development Options</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Create a test manager using the current admin account for development purposes.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={createTestManager}
            disabled={isLoading}
            className="w-full"
            type="button"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Creating Test Manager...
              </>
            ) : (
              "Create Test Manager"
            )}
          </Button>
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="manager@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="beach_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign to Beach (Optional)</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a beach" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {beaches.map((beach) => (
                      <SelectItem key={beach.id} value={beach.id}>
                        {beach.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Manager"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
