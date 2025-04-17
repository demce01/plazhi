
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Beach } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

// Form validation schema
const beachSchema = z.object({
  name: z.string().min(2, {
    message: "Beach name must be at least 2 characters.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  description: z.string().optional(),
});

interface BeachFormProps {
  beach?: Beach;
  onSuccess: (beach: Beach) => void;
}

export function BeachForm({ beach, onSuccess }: BeachFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Initialize form with existing beach data or empty values
  const form = useForm<z.infer<typeof beachSchema>>({
    resolver: zodResolver(beachSchema),
    defaultValues: {
      name: beach?.name || "",
      location: beach?.location || "",
      description: beach?.description || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof beachSchema>) => {
    try {
      setLoading(true);

      if (beach) {
        // Update existing beach
        const { data, error } = await supabase
          .from("beaches")
          .update({
            name: values.name,
            location: values.location,
            description: values.description,
          })
          .eq("id", beach.id)
          .select()
          .single();

        if (error) throw error;
        onSuccess(data as Beach);
      } else {
        // Create new beach
        const { data, error } = await supabase
          .from("beaches")
          .insert({
            name: values.name,
            location: values.location,
            description: values.description,
          })
          .select()
          .single();

        if (error) throw error;
        onSuccess(data as Beach);
      }
    } catch (error: any) {
      toast({
        title: beach ? "Error updating beach" : "Error creating beach",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beach Name</FormLabel>
              <FormControl>
                <Input placeholder="Paradise Beach" {...field} />
              </FormControl>
              <FormDescription>
                Enter the name of your beach
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Sarande, Albania" {...field} />
              </FormControl>
              <FormDescription>
                Enter the location of the beach
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A beautiful sandy beach with crystal clear water..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide a brief description of the beach
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {beach ? "Update Beach" : "Create Beach"}
        </Button>
      </form>
    </Form>
  );
}
