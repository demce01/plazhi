
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
import { useToast } from "@/hooks/use-toast";
import { Set } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

// Form validation schema
const setSchema = z.object({
  name: z.string().min(2, {
    message: "Set name must be at least 2 characters.",
  }),
  row_number: z.coerce.number().int().min(1, {
    message: "Row number must be a positive integer.",
  }),
  position: z.coerce.number().int().min(1, {
    message: "Position must be a positive integer.",
  }),
  price: z.coerce.number().min(0, {
    message: "Price must be a positive number.",
  }),
});

interface BeachSetFormProps {
  beachId: string;
  set?: Set;
  onSuccess: (set: Set) => void;
}

export function BeachSetForm({ beachId, set, onSuccess }: BeachSetFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Initialize form with existing set data or empty values
  const form = useForm<z.infer<typeof setSchema>>({
    resolver: zodResolver(setSchema),
    defaultValues: {
      name: set?.name || "",
      row_number: set?.row_number || 1,
      position: set?.position || 1,
      price: set?.price ? Number(set.price) : 20,
    },
  });

  const onSubmit = async (values: z.infer<typeof setSchema>) => {
    try {
      setLoading(true);

      if (set) {
        // Update existing set
        const { data, error } = await supabase
          .from("sets")
          .update({
            name: values.name,
            row_number: values.row_number,
            position: values.position,
            price: values.price,
          })
          .eq("id", set.id)
          .select()
          .single();

        if (error) throw error;
        onSuccess(data as Set);
      } else {
        // Create new set
        const { data, error } = await supabase
          .from("sets")
          .insert({
            beach_id: beachId,
            name: values.name,
            row_number: values.row_number,
            position: values.position,
            price: values.price,
            status: "available",
          })
          .select()
          .single();

        if (error) throw error;
        onSuccess(data as Set);
      }
    } catch (error: any) {
      toast({
        title: set ? "Error updating set" : "Error creating set",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Set Name</FormLabel>
              <FormControl>
                <Input placeholder="Set A1" {...field} />
              </FormControl>
              <FormDescription>
                Enter a unique identifier for this set
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="row_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Row</FormLabel>
                <FormControl>
                  <Input type="number" {...field} min={1} />
                </FormControl>
                <FormDescription>
                  Row number from the sea
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <FormControl>
                  <Input type="number" {...field} min={1} />
                </FormControl>
                <FormDescription>
                  Position in the row
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input type="number" {...field} min={0} step={0.01} />
              </FormControl>
              <FormDescription>
                Daily rental price
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {set ? "Update Set" : "Create Set"}
        </Button>
      </form>
    </Form>
  );
}
