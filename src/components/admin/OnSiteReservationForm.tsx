import React, { useState } from 'react';
import { useOnSiteReservation } from '@/hooks/admin/useOnSiteReservation';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Loader2, User, Phone, Mail } from "lucide-react";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { Beach, Set, Zone } from '@/types';
import { VisualSetSelectionGrid } from './VisualSetSelectionGrid';

// TODO: Import and use the SetSelection component (needs creation or adaptation)
// Assuming a SetSelection component exists similar to the user flow
// import { SetSelection } from '@/components/reservations/SetSelection';

interface GuestDataForm {
  name: string;
  phone: string;
  email?: string;
}

export function OnSiteReservationForm() {
  const {
    isLoading,
    isSubmitting,
    beaches,
    selectedBeach,
    setSelectedBeach,
    selectedDate,
    setSelectedDate,
    zones,       // Assuming SetSelection uses zones
    sets,        // Pass sets to SetSelection
    selectedZone, // Assuming SetSelection uses selectedZone
    handleZoneSelect, // Pass to SetSelection
    selectedSets,
    handleSelectSet, // Pass to SetSelection
    handleRemoveSet,
    setGuestData,
    submitOnSiteReservation,
  } = useOnSiteReservation();

  const [localGuestData, setLocalGuestData] = useState<GuestDataForm>({ name: '', phone: '', email: '' });

  const handleBeachChange = (beachId: string) => {
    const beach = beaches.find(b => b.id === beachId) || null;
    setSelectedBeach(beach);
  };

  const handleGuestDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalGuestData(prev => ({ ...prev, [name]: value }));
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!localGuestData.name || !localGuestData.phone) {
        alert("Please enter guest name and phone number."); // Replace with proper toast/validation message
        return;
    }
    setGuestData(localGuestData);
    // Trigger final submission if guest data is now set
    submitOnSiteReservation(); 
  };

  // Calculate total price for summary
  const totalPrice = selectedSets.reduce((sum, set) => sum + Number(set.price || 0), 0);

  return (
    <form onSubmit={handleGuestSubmit} className="space-y-8">
      {/* Step 1: Beach Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Select Beach</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="beach-select">Beach</Label>
          <Select 
            value={selectedBeach?.id || ''} 
            onValueChange={handleBeachChange}
            disabled={isLoading || beaches.length === 0}
          >
            <SelectTrigger id="beach-select">
              <SelectValue placeholder="Select a beach..." />
            </SelectTrigger>
            <SelectContent>
              {beaches.map((beach) => (
                <SelectItem key={beach.id} value={beach.id}>
                  {beach.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isLoading && <p className="text-sm text-muted-foreground mt-2">Loading beaches...</p>}
        </CardContent>
      </Card>

      {/* Step 2: Date Selection */}
      {selectedBeach && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Select Date</CardTitle>
          </CardHeader>
          <CardContent>
             <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-[280px] justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                        // Optional: Add disabled dates logic if needed
                    />
                </PopoverContent>
            </Popover>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Set Selection (Placeholder) */}
      {selectedBeach && selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Select Sets</CardTitle>
             <CardDescription>Select available zones and sets for {format(selectedDate, "PPP")}.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && <p>Loading sets...</p>}
            {/* Replace list selection with visual grid */}
            {!isLoading && sets.length > 0 && (
              <VisualSetSelectionGrid 
                zones={zones} 
                sets={sets} 
                selectedSets={selectedSets} 
                onSelectSet={handleSelectSet} 
              />
            )}
            {!isLoading && sets.length === 0 && <p className="text-center text-muted-foreground p-4">No sets found for this beach/date.</p>}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Guest Details & Summary */}
      {selectedSets.length > 0 && (
         <Card>
          <CardHeader>
            <CardTitle>Step 4: Guest Information & Confirm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              {/* Summary */}
               <div className="border rounded-lg p-4 bg-muted/50 space-y-2">
                 <h4 className="font-semibold mb-2">Summary</h4>
                 <div className="flex justify-between text-sm"><span className="text-muted-foreground">Beach:</span><span>{selectedBeach?.name}</span></div>
                 <div className="flex justify-between text-sm"><span className="text-muted-foreground">Date:</span><span>{format(selectedDate, "PPP")}</span></div>
                 <div className="flex justify-between text-sm"><span className="text-muted-foreground">Sets:</span><span>{selectedSets.length}</span></div>
                 <div className="flex justify-between font-bold pt-2 border-t"><span >Total Price:</span><span>${totalPrice.toFixed(2)}</span></div>
               </div>

               {/* Guest Inputs */}
               <div className="space-y-2">
                 <Label htmlFor="name"><User className="inline h-4 w-4 mr-1"/>Guest Name</Label>
                 <Input id="name" name="name" value={localGuestData.name} onChange={handleGuestDataChange} required placeholder="Full Name" />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="phone"><Phone className="inline h-4 w-4 mr-1"/>Guest Phone</Label>
                 <Input id="phone" name="phone" type="tel" value={localGuestData.phone} onChange={handleGuestDataChange} required placeholder="+1234567890" />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="email"><Mail className="inline h-4 w-4 mr-1"/>Guest Email (Optional)</Label>
                 <Input id="email" name="email" type="email" value={localGuestData.email || ''} onChange={handleGuestDataChange} placeholder="guest@example.com" />
               </div>
          </CardContent>
          <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting || selectedSets.length === 0}>
                 {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                 {isSubmitting ? "Creating Reservation..." : "Create On-Site Reservation"}
              </Button>
          </CardFooter>
        </Card>
      )}
    </form>
  );
} 