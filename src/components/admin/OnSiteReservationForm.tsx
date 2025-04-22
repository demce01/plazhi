
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

import { useAdminBeachList } from '@/hooks/admin/useAdminBeachList';
import { useVisualSetSelection } from '@/hooks/admin/useVisualSetSelection';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

import { VisualSetSelectionGrid } from './VisualSetSelectionGrid';

// Form schema
const formSchema = z.object({
  beachId: z.string({ required_error: "Please select a beach" }),
  guestName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  guestPhone: z.string().min(5, { message: "Phone number is required" }),
  guestEmail: z.string().email({ message: "Invalid email address" }).optional().or(z.literal('')),
  date: z.date({ required_error: "Please select a date" }),
});

type FormValues = z.infer<typeof formSchema>;

export function OnSiteReservationForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { beaches, isLoading: beachesLoading } = useAdminBeachList();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const {
    selectedBeachId,
    selectedZone,
    selectedSets,
    availableZones,
    availableSets,
    isLoading: setsLoading,
    setSelectedBeachId,
    setSelectedZone,
    handleSelectSet,
    handleRemoveSet,
    fetchZonesAndSets,
  } = useVisualSetSelection();

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      beachId: '',
      guestName: '',
      guestPhone: '',
      guestEmail: '',
      date: new Date(),
    },
  });

  // Watch the beachId field for changes
  const watchBeachId = form.watch('beachId');
  const watchDate = form.watch('date');

  // Update the selected beach ID when the form beach field changes
  React.useEffect(() => {
    if (watchBeachId && watchBeachId !== selectedBeachId) {
      setSelectedBeachId(watchBeachId);
      // Reset selected zone and sets when beach changes
      setSelectedZone(null);
    }
  }, [watchBeachId, selectedBeachId, setSelectedBeachId, setSelectedZone]);

  // Update sets when date changes
  React.useEffect(() => {
    if (watchDate && selectedBeachId) {
      fetchZonesAndSets(selectedBeachId, watchDate);
    }
  }, [watchDate, selectedBeachId, fetchZonesAndSets]);

  // Update selected date when the form date field changes
  React.useEffect(() => {
    if (watchDate) {
      setSelectedDate(watchDate);
    }
  }, [watchDate]);

  // Set form date value when selected date changes
  React.useEffect(() => {
    if (selectedDate) {
      form.setValue('date', selectedDate);
    }
  }, [selectedDate, form]);

  const onSubmit = async (values: FormValues) => {
    if (selectedSets.length === 0) {
      toast({
        title: "No sets selected",
        description: "Please select at least one beach set to reserve",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate total amount
      const totalAmount = selectedSets.reduce(
        (sum, set) => sum + Number(set.price || 0), 
        0
      );

      // Create the reservation
      const { data: reservation, error: reservationError } = await supabase
        .from("reservations")
        .insert({
          beach_id: values.beachId,
          guest_name: values.guestName,
          guest_phone: values.guestPhone,
          guest_email: values.guestEmail || null,
          reservation_date: format(values.date, "yyyy-MM-dd"),
          payment_amount: totalAmount,
          status: "confirmed",
          payment_status: "completed",
        })
        .select()
        .single();

      if (reservationError) {
        throw reservationError;
      }

      // Create reservation_sets entries
      const reservationSets = selectedSets.map(set => ({
        reservation_id: reservation.id,
        set_id: set.id,
        price: set.price,
      }));

      const { error: setsError } = await supabase
        .from("reservation_sets")
        .insert(reservationSets);

      if (setsError) {
        throw setsError;
      }

      toast({
        title: "Reservation created",
        description: `Reservation for ${values.guestName} has been created successfully.`,
      });

      // Redirect to the reservation details page
      navigate(`/admin/reservations/${reservation.id}`);
    } catch (error: any) {
      console.error("Error creating reservation:", error);
      toast({
        title: "Error creating reservation",
        description: error.message || "An error occurred while creating the reservation.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Beach selection */}
        <FormField
          control={form.control}
          name="beachId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beach</FormLabel>
              <Select
                disabled={beachesLoading || isSubmitting}
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a beach" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {beaches?.map((beach) => (
                    <SelectItem key={beach.id} value={beach.id}>
                      {beach.name} {beach.location ? `(${beach.location})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the beach for this reservation.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date selection */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={`w-full pl-3 text-left font-normal ${
                        !field.value && "text-muted-foreground"
                      }`}
                      disabled={isSubmitting}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Select the reservation date.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Guest information */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="guestName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Guest Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="guestPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+1234567890" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="guestEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="guest@example.com"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sets selection */}
        {watchBeachId && (
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium">Select Beach Sets</h3>
                <p className="text-sm text-muted-foreground">
                  Choose the umbrella and chair sets for this reservation.
                </p>
              </div>

              {setsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : availableZones.length > 0 ? (
                <VisualSetSelectionGrid
                  zones={availableZones}
                  selectedZone={selectedZone}
                  selectedSets={selectedSets}
                  onZoneSelect={setSelectedZone}
                  onSetToggle={handleSelectSet}
                  sets={availableSets}
                />
              ) : (
                <div className="text-center py-6">
                  <p>No zones or sets available for this beach.</p>
                </div>
              )}

              {selectedSets.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-medium mb-2">Selected Sets ({selectedSets.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSets.map((set) => (
                      <div
                        key={set.id}
                        className="bg-primary/10 text-primary rounded-md px-3 py-1 text-sm flex items-center gap-1"
                      >
                        <span>{set.name}</span>
                        <button
                          type="button"
                          className="text-primary hover:text-primary/80"
                          onClick={() => handleRemoveSet(set.id)}
                          disabled={isSubmitting}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-right font-medium">
                    Total: $
                    {selectedSets
                      .reduce((sum, set) => sum + Number(set.price || 0), 0)
                      .toFixed(2)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || selectedSets.length === 0}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Reservation
          </Button>
        </div>
      </form>
    </Form>
  );
}
