
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
import { Zone } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

// Form validation schema
const zoneSchema = z.object({
  name: z.string().min(2, {
    message: "Zone name must be at least 2 characters.",
  }),
  rows: z.coerce.number().int().min(1, {
    message: "Number of rows must be a positive integer.",
  }),
  spots_per_row: z.coerce.number().int().min(1, {
    message: "Spots per row must be a positive integer.",
  }),
  price: z.coerce.number().min(0, {
    message: "Price must be a positive number.",
  }),
});

interface ZoneFormProps {
  beachId: string;
  zone?: Zone;
  onSuccess: (zone: Zone) => void;
}

export function ZoneForm({ beachId, zone, onSuccess }: ZoneFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Initialize form with existing zone data or empty values
  const form = useForm<z.infer<typeof zoneSchema>>({
    resolver: zodResolver(zoneSchema),
    defaultValues: {
      name: zone?.name || "",
      rows: zone?.rows || 3,
      spots_per_row: zone?.spots_per_row || 6,
      price: zone?.price ? Number(zone.price) : 20,
    },
  });

  const onSubmit = async (values: z.infer<typeof zoneSchema>) => {
    try {
      setLoading(true);

      if (zone) {
        // Update existing zone
        const { data, error } = await supabase
          .from("zones")
          .update({
            name: values.name,
            rows: values.rows,
            spots_per_row: values.spots_per_row,
            price: values.price,
          })
          .eq("id", zone.id)
          .select()
          .single();

        if (error) throw error;
        onSuccess(data as Zone);
      } else {
        // Create new zone
        const { data, error } = await supabase
          .from("zones")
          .insert({
            beach_id: beachId,
            name: values.name,
            rows: values.rows,
            spots_per_row: values.spots_per_row,
            price: values.price,
          })
          .select()
          .single();

        if (error) throw error;
        onSuccess(data as Zone);
      }
    } catch (error: any) {
      toast({
        title: zone ? "Error updating zone" : "Error creating zone",
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
              <FormLabel>Zone Name</FormLabel>
              <FormControl>
                <Input placeholder="VIP Zone" {...field} />
              </FormControl>
              <FormDescription>
                Enter a descriptive name for this zone
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="rows"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Rows</FormLabel>
                <FormControl>
                  <Input type="number" {...field} min={1} />
                </FormControl>
                <FormDescription>
                  How many rows in this zone
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="spots_per_row"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Spots Per Row</FormLabel>
                <FormControl>
                  <Input type="number" {...field} min={1} />
                </FormControl>
                <FormDescription>
                  Umbrella sets per row
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
                Daily rental price for all sets in this zone
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {zone ? "Update Zone" : "Create Zone"}
        </Button>
      </form>
    </Form>
  );
}
