import type { Set } from "@/types";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Beach } from "@/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { BeachLayout } from "@/components/beaches/BeachLayout";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { GuestReservationForm } from "@/components/reservations/GuestReservationForm";

export default function BeachDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userSession } = useAuth();
  const { user, clientId } = userSession;
  
  const [loading, setLoading] = useState(true);
  const [beach, setBeach] = useState<Beach | null>(null);
  const [sets, setSets] = useState<Set[]>([]);
  const [selectedSets, setSelectedSets] = useState<Set[]>([]);
  const [reservedSets, setReservedSets] = useState<Set[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  
  useEffect(() => {
    if (!id) return;
    
    fetchBeach(id);
  }, [id]);

  useEffect(() => {
    if (beach?.id && selectedDate) {
      fetchBeachSets(beach.id, selectedDate);
    }
  }, [beach, selectedDate]);

  const fetchBeach = async (beachId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("beaches")
        .select("*")
        .eq("id", beachId)
        .single();
      
      if (error) throw error;
      setBeach(data);
    } catch (error: any) {
      toast({
        title: "Error loading beach",
        description: error.message,
        variant: "destructive",
      });
      navigate("/beaches");
    } finally {
      setLoading(false);
    }
  };

  const fetchBeachSets = async (beachId: string, date: Date) => {
    try {
      // Fetch all sets for this beach
      const { data: allSets, error: setsError } = await supabase
        .from("sets")
        .select("*")
        .eq("beach_id", beachId)
        .order("row_number")
        .order("position");
      
      if (setsError) throw setsError;
      
      // Fetch reserved sets for this date
      const formattedDate = format(date, "yyyy-MM-dd");
      const { data: reservations, error: reservationsError } = await supabase
        .from("reservations")
        .select(`
          id,
          reservation_sets (
            set_id
          )
        `)
        .eq("beach_id", beachId)
        .eq("reservation_date", formattedDate)
        .not("status", "eq", "cancelled");
      
      if (reservationsError) throw reservationsError;
      
      // Mark sets as reserved if they're in a reservation
      const reservedSetIds = new Set<string>();
      reservations?.forEach(reservation => {
        reservation.reservation_sets?.forEach((rs: any) => {
          reservedSetIds.add(rs.set_id);
        });
      });
      
      const updatedSets = allSets?.map(set => ({
        ...set,
        status: reservedSetIds.has(set.id) ? "reserved" : "available"
      })) || [];
      
      setSets(updatedSets);
      setReservedSets(updatedSets.filter(set => set.status === "reserved"));
      
      // Clear selected sets when changing date
      setSelectedSets([]);
    } catch (error: any) {
      toast({
        title: "Error loading beach sets",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSelectSet = (set: Set) => {
    if (set.status === "reserved") return;
    
    setSelectedSets(prev => {
      const isSelected = prev.some(s => s.id === set.id);
      if (isSelected) {
        return prev.filter(s => s.id === set.id);
      } else {
        return [...prev, set];
      }
    });
  };

  const handleRemoveSet = (setId: string) => {
    setSelectedSets(prev => prev.filter(s => s.id !== setId));
  };

  const handleReservation = async () => {
    if (!user || !clientId) {
      setShowGuestForm(true);
      return;
    }
    
    if (selectedSets.length === 0) {
      toast({
        title: "No sets selected",
        description: "Please select at least one beach set to reserve.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Create the reservation
      const totalAmount = selectedSets.reduce(
        (sum, set) => sum + Number(set.price || 0), 
        0
      );
      
      const { data: reservation, error: reservationError } = await supabase
        .from("reservations")
        .insert({
          client_id: clientId,
          beach_id: beach?.id,
          reservation_date: format(selectedDate, "yyyy-MM-dd"),
          payment_amount: totalAmount,
        })
        .select()
        .single();
      
      if (reservationError) throw reservationError;
      
      // Create reservation_sets entries
      const reservationSets = selectedSets.map(set => ({
        reservation_id: reservation.id,
        set_id: set.id,
        price: set.price,
      }));
      
      const { error: setsError } = await supabase
        .from("reservation_sets")
        .insert(reservationSets);
      
      if (setsError) throw setsError;
      
      toast({
        title: "Reservation successful",
        description: `Your reservation has been created with ID: ${reservation.id.substring(0, 8)}`,
      });
      
      // Redirect to reservation confirmation page
      navigate(`/reservations/${reservation.id}`);
      
    } catch (error: any) {
      toast({
        title: "Reservation failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGuestReservation = async (guestData: {
    name: string;
    phone: string;
    email?: string;
  }) => {
    if (selectedSets.length === 0) {
      toast({
        title: "No sets selected",
        description: "Please select at least one beach set to reserve.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Create the reservation
      const totalAmount = selectedSets.reduce(
        (sum, set) => sum + Number(set.price || 0), 
        0
      );
      
      const { data: reservation, error: reservationError } = await supabase
        .from("reservations")
        .insert({
          beach_id: beach?.id,
          guest_name: guestData.name,
          guest_phone: guestData.phone,
          reservation_date: format(selectedDate, "yyyy-MM-dd"),
          payment_amount: totalAmount,
        })
        .select()
        .single();
      
      if (reservationError) throw reservationError;
      
      // Create reservation_sets entries
      const reservationSets = selectedSets.map(set => ({
        reservation_id: reservation.id,
        set_id: set.id,
        price: set.price,
      }));
      
      const { error: setsError } = await supabase
        .from("reservation_sets")
        .insert(reservationSets);
      
      if (setsError) throw setsError;
      
      toast({
        title: "Reservation successful",
        description: `Your reservation has been created with ID: ${reservation.id.substring(0, 8)}`,
      });
      
      // Redirect to reservation confirmation page
      navigate(`/reservations/${reservation.id}`);
      
    } catch (error: any) {
      toast({
        title: "Reservation failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setShowGuestForm(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!beach) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Beach Not Found</h1>
        <p className="mb-8">The beach you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/beaches")}>Back to Beaches</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{beach.name}</h1>
        {beach.location && (
          <p className="text-muted-foreground flex items-center mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            {beach.location}
          </p>
        )}
        {beach.description && (
          <p className="mt-3 text-gray-600">{beach.description}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Select Date</h2>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-3">Beach Layout</h2>
            <BeachLayout 
              sets={sets}
              beachName={beach.name}
              onSelectSet={handleSelectSet}
              selectedSets={selectedSets}
              disabledSets={reservedSets}
            />
          </div>
        </div>
        
        <div>
          <div className="border rounded-lg p-6 bg-card shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Your Reservation</h2>
            
            <div className="mb-4">
              <p className="font-medium">Selected Date:</p>
              <p>{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
            </div>
            
            <div className="mb-6">
              <p className="font-medium mb-2">Selected Sets ({selectedSets.length}):</p>
              {selectedSets.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No sets selected. Click on an available set in the beach layout.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedSets.map(set => (
                    <div key={set.id} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span>{set.name}</span>
                      <div className="flex items-center gap-2">
                        <span>{Number(set.price).toFixed(2)}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRemoveSet(set.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-between font-medium pt-2">
                    <span>Total:</span>
                    <span>
                      {selectedSets.reduce((sum, set) => sum + Number(set.price || 0), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <Button 
              className="w-full"
              disabled={selectedSets.length === 0 || isProcessing}
              onClick={handleReservation}
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {user ? "Complete Reservation" : "Continue as Guest"}
            </Button>
          </div>
        </div>
      </div>
      
      {showGuestForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Guest Reservation</h2>
            <GuestReservationForm 
              onSubmit={handleGuestReservation}
              onCancel={() => setShowGuestForm(false)}
              isSubmitting={isProcessing}
            />
          </div>
        </div>
      )}
    </div>
  );
}
