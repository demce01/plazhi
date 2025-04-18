import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function FindReservation() {
  const [reservationId, setReservationId] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState(''); // Combine for simplicity
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservationId || !emailOrPhone) {
        setError("Please enter both Reservation ID and Email/Phone.");
        return;
    }
    setIsLoading(true);
    setError('');
    
    try {
      // 1. Fetch reservation by ID (RLS policy allows anon SELECT by ID)
      const { data: reservation, error: fetchError } = await supabase
        .from('reservations')
        .select('id, guest_email, guest_phone') // Select only needed fields
        .eq('id', reservationId.trim())
        .maybeSingle(); // Use maybeSingle as ID might not exist

      if (fetchError) {
        console.error("Find reservation fetch error:", fetchError);
        throw new Error("Error fetching reservation details.");
      }

      // 2. Check if reservation exists and if email/phone matches
      if (
        reservation && 
        (reservation.guest_email?.toLowerCase() === emailOrPhone.trim().toLowerCase() || 
         reservation.guest_phone === emailOrPhone.trim())
      ) {
        // 3. Found and matches, navigate
        toast({ title: "Reservation Found!", description: "Redirecting to your reservation details..." });
        navigate(`/reservations/${reservation.id}`);
      } else {
        // 4. Not found or details don't match
        setError("Reservation not found or details incorrect. Please check your input.");
      }

    } catch (err: any) {
      console.error("Find reservation error:", err);
      setError(err.message || "An unexpected error occurred.");
      toast({ title: "Search Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Find Your Reservation</CardTitle>
          <CardDescription>Enter your reservation ID and email or phone number to view your booking.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSearch}>
          <CardContent className="space-y-4">
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="space-y-1">
              <label htmlFor="reservationId" className="text-sm font-medium">Reservation ID</label>
              <Input 
                id="reservationId" 
                value={reservationId} 
                onChange={(e) => setReservationId(e.target.value)} 
                placeholder="e.g., ABCDEF12" 
                required 
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="emailOrPhone" className="text-sm font-medium">Email or Phone Number</label>
              <Input 
                id="emailOrPhone" 
                value={emailOrPhone} 
                onChange={(e) => setEmailOrPhone(e.target.value)} 
                placeholder="your@email.com or +1234567890" 
                required 
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Searching..." : "Find Reservation"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 