
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Loader2, User, Phone, Mail } from "lucide-react";

// Form validation schema
const guestSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  phone: z.string().min(5, {
    message: "Please enter a valid phone number.",
  }),
  email: z.string().email("Please enter a valid email").optional().or(z.literal('')),
});

interface GuestReservationFormProps {
  onSubmit: (data: z.infer<typeof guestSchema>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function GuestReservationForm({ 
  onSubmit, 
  onCancel, 
  isSubmitting 
}: GuestReservationFormProps) {
  // Initialize form
  const form = useForm<z.infer<typeof guestSchema>>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input className="pl-10" placeholder="John Doe" {...field} />
                </div>
              </FormControl>
              <FormDescription>
                Enter your full name
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input className="pl-10" placeholder="+1234567890" {...field} />
                </div>
              </FormControl>
              <FormDescription>
                Enter your phone number
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (Optional)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input className="pl-10" placeholder="email@example.com" {...field} />
                </div>
              </FormControl>
              <FormDescription>
                Provide your email for reservation updates
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Reservation
          </Button>
        </div>
      </form>
    </Form>
  );
}
