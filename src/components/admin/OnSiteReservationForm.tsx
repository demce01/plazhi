
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Loader2, CalendarIcon, MapPin, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { VisualSetSelectionGrid } from "@/components/admin/VisualSetSelectionGrid";
import { useOnSiteReservation } from "@/hooks/admin/useOnSiteReservation";
import { useIsMobile } from "@/hooks/use-mobile";

// Simplified form validation schema
const formSchema = z.object({
  guestName: z.literal("On-Site Reservation").optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function OnSiteReservationForm() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const {
    isLoading,
    isSubmitting,
    beaches,
    selectedBeach,
    setSelectedBeach,
    selectedDate,
    setSelectedDate,
    zones,
    sets,
    selectedZone,
    handleZoneSelect,
    selectedSets,
    handleSelectSet,
    handleRemoveSet,
    setGuestData,
    submitOnSiteReservation,
  } = useOnSiteReservation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guestName: "On-Site Reservation",
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!selectedBeach) {
      toast({
        title: "Please select a beach",
        description: "A beach must be selected to create a reservation",
        variant: "destructive",
      });
      return;
    }

    if (selectedSets.length === 0) {
      toast({
        title: "Please select at least one set",
        description: "You must select at least one set for the reservation",
        variant: "destructive",
      });
      return;
    }

    setGuestData({
      name: "On-Site Reservation",
      phone: "", // Empty phone for on-site reservations
      email: undefined,
    });

    await submitOnSiteReservation();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">1. Select a Beach</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {beaches.map((beach) => (
            <div
              key={beach.id}
              className={`border rounded-md p-4 cursor-pointer transition-colors ${
                selectedBeach?.id === beach.id
                  ? "border-primary bg-primary/5"
                  : "hover:bg-accent"
              }`}
              onClick={() => setSelectedBeach(beach)}
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-medium">{beach.name}</span>
              </div>
              {beach.location && (
                <p className="text-sm text-muted-foreground mt-1">
                  {beach.location}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">2. Select Date</h3>
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-start text-left font-normal ${
                  !selectedDate && "text-muted-foreground"
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Separator />

      {selectedBeach && selectedDate && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">3. Select Sets</h3>

          <div className="flex flex-col md:flex-row gap-6">
            <div className={`${isMobile ? "w-full" : "w-2/3"}`}>
              <div className="mb-4 flex flex-wrap gap-2">
                {zones.map((zone) => (
                  <Badge
                    key={zone.id}
                    variant={selectedZone?.id === zone.id ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleZoneSelect(zone)}
                  >
                    {zone.name}
                  </Badge>
                ))}
                <Badge
                  variant={selectedZone === null ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleZoneSelect(null)}
                >
                  All Sets
                </Badge>
              </div>

              <VisualSetSelectionGrid
                sets={sets}
                zones={zones}
                selectedZone={selectedZone}
                selectedSets={selectedSets}
                onZoneSelect={handleZoneSelect}
                onSetToggle={handleSelectSet}
              />
            </div>

            <div className={`${isMobile ? "w-full" : "w-1/3"}`}>
              <div className="border rounded-lg p-4 bg-accent/5">
                <h4 className="font-medium mb-2">Selected Sets</h4>
                {selectedSets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No sets selected yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedSets.map((set) => (
                      <div
                        key={set.id}
                        className="flex items-center justify-between bg-background rounded p-2"
                      >
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-primary" />
                          <span>{set.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            ${Number(set.price).toFixed(2)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveSet(set.id)}
                            className="h-8 w-8 p-0"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="pt-2 border-t">
                      <div className="flex justify-between font-medium">
                        <span>Total:</span>
                        <span>
                          $
                          {selectedSets
                            .reduce(
                              (sum, set) => sum + Number(set.price || 0),
                              0
                            )
                            .toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="py-4">
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || isLoading}
          onClick={form.handleSubmit(onSubmit)}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Reservation...
            </>
          ) : (
            "Create On-Site Reservation"
          )}
        </Button>
      </div>
    </div>
  );
}
