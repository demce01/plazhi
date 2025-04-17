
import type { Set, Zone } from "@/types";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Beach } from "@/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CalendarIcon, Check } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { GuestReservationForm } from "@/components/reservations/GuestReservationForm";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { BeachLayout } from "@/components/beaches/BeachLayout";

export default function BeachDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userSession } = useAuth();
  const { user, clientId } = userSession;
  
  const [loading, setLoading] = useState(true);
  const [beach, setBeach] = useState<Beach | null>(null);
  const [sets, setSets] = useState<Set[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedSets, setSelectedSets] = useState<Set[]>([]);
  const [reservedSets, setReservedSets] = useState<Set[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [currentStep, setCurrentStep] = useState<"date" | "location" | "payment">("date");
  
  useEffect(() => {
    if (!id) return;
    
    fetchBeach(id);
  }, [id]);

  useEffect(() => {
    if (beach?.id && selectedDate) {
      fetchBeachSets(beach.id, selectedDate);
      fetchBeachZones(beach.id);
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

  const fetchBeachZones = async (beachId: string) => {
    try {
      const { data, error } = await supabase
        .from("zones")
        .select("*")
        .eq("beach_id", beachId)
        .order("name");
      
      if (error) throw error;
      
      // Debug
      console.log("Fetched zones:", data);
      
      setZones(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading beach zones",
        description: error.message,
        variant: "destructive",
      });
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
      
      // Debug
      console.log("Fetched sets:", updatedSets);
      
      setSets(updatedSets);
      setReservedSets(updatedSets.filter(set => set.status === "reserved"));
      
      // Clear selected sets when changing date
      setSelectedSets([]);
      setSelectedZone(null);
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
        return prev.filter(s => s.id !== set.id);
      } else {
        return [...prev, set];
      }
    });
  };

  const handleRemoveSet = (setId: string) => {
    setSelectedSets(prev => prev.filter(s => s.id !== setId));
  };

  const handleZoneSelect = (zone: Zone) => {
    setSelectedZone(zone);
    // Clear selected sets when changing zone
    setSelectedSets([]);
    // Move to next step
    setCurrentStep("location");
  };

  const getSetsForZone = (zoneName: string) => {
    return sets.filter(set => set.name.startsWith(zoneName));
  };

  const getSetsByRow = (zoneSets: Set[]) => {
    const rows = new Map<number, Set[]>();
    
    zoneSets.forEach(set => {
      const rowNum = set.row_number || 0;
      if (!rows.has(rowNum)) {
        rows.set(rowNum, []);
      }
      rows.get(rowNum)?.push(set);
    });
    
    // Sort rows by row number and sets by position within each row
    return Array.from(rows.entries())
      .sort(([a], [b]) => a - b)
      .map(([rowNum, sets]) => ({
        rowNum,
        sets: sets.sort((a, b) => (a.position || 0) - (b.position || 0))
      }));
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
          guest_email: guestData.email,
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

  const goToStep = (step: "date" | "location" | "payment") => {
    if (step === "location" && !selectedDate) {
      toast({
        title: "Please select a date first",
        variant: "destructive",
      });
      return;
    }
    
    if (step === "payment" && selectedSets.length === 0) {
      toast({
        title: "Please select at least one set",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentStep(step);
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

  // Debug: Add this to check zones in the render
  console.log("Rendering with zones:", zones, "and selectedZone:", selectedZone);

  return (
    <div className="container max-w-5xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Reserve Your Beach Spot</h1>
      
      <div className="bg-white rounded-lg border shadow-sm p-6 mb-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold">Your Reservation</h2>
          <p className="text-gray-600">Follow the steps below to complete your reservation</p>
        </div>
        
        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          <div 
            className={cn(
              "p-4 rounded-md text-center cursor-pointer transition-colors",
              currentStep === "date" 
                ? "bg-blue-100 text-blue-800" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
            onClick={() => goToStep("date")}
          >
            <span className="font-medium">1. Select Date</span>
          </div>
          <div 
            className={cn(
              "p-4 rounded-md text-center cursor-pointer transition-colors",
              currentStep === "location" 
                ? "bg-blue-100 text-blue-800" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
            onClick={() => goToStep("location")}
          >
            <span className="font-medium">2. Choose Location</span>
          </div>
          <div 
            className={cn(
              "p-4 rounded-md text-center cursor-pointer transition-colors",
              currentStep === "payment" 
                ? "bg-blue-100 text-blue-800" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
            onClick={() => goToStep("payment")}
          >
            <span className="font-medium">3. Complete Reservation</span>
          </div>
        </div>
        
        {/* Step content */}
        <Tabs value={currentStep} className="w-full">
          <TabsContent value="date" className="m-0">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Select Date for Your Reservation</h2>
              <div className="max-w-sm mx-auto">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border shadow p-4 bg-white mx-auto"
                />
              </div>
              <div className="flex justify-center mt-6">
                <Button 
                  onClick={() => goToStep("location")}
                  disabled={!selectedDate}
                >
                  Continue to Location Selection
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="location" className="m-0 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Choose Your Beach Location</h2>
              
              {/* Zone Selection Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {zones.length === 0 ? (
                  <div className="col-span-3 p-8 text-center rounded-md border border-dashed">
                    <p>No zones available for this beach. Please try another date or beach.</p>
                  </div>
                ) : (
                  zones.map(zone => (
                    <Card 
                      key={zone.id}
                      className={cn(
                        "cursor-pointer hover:border-blue-400 transition-all",
                        selectedZone?.id === zone.id && "border-blue-500 ring-2 ring-blue-200"
                      )}
                      onClick={() => handleZoneSelect(zone)}
                    >
                      <CardContent className="pt-6 text-center">
                        <h3 className="font-semibold text-lg">{zone.name}</h3>
                        <p className="text-blue-600 text-xl font-bold my-2">${Number(zone.price).toFixed(2)}</p>
                        <p className="text-gray-500 text-sm">
                          {getSetsForZone(zone.name).filter(s => s.status !== "reserved").length} of {getSetsForZone(zone.name).length} spots available
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
              
              {/* Beach Layout */}
              {selectedZone && (
                <div className="mt-8">
                  <h3 className="font-medium mb-2">Select a specific location:</h3>
                  
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <div className="w-full p-3 mb-8 bg-blue-400 text-white text-center font-bold rounded">
                      Ocean
                    </div>
                    
                    {getSetsByRow(getSetsForZone(selectedZone.name)).map(({ rowNum, sets: rowSets }) => (
                      <div key={rowNum} className="mb-4 flex items-center">
                        <div className="w-16 text-right pr-4 font-medium">
                          Row {rowNum}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {rowSets.map(set => (
                            <button
                              key={set.id}
                              disabled={set.status === "reserved"}
                              onClick={() => handleSelectSet(set)}
                              className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all",
                                set.status === "reserved" && "bg-gray-200 border-gray-300 cursor-not-allowed",
                                selectedSets.some(s => s.id === set.id) && "bg-blue-500 text-white border-blue-600",
                                set.status !== "reserved" && !selectedSets.some(s => s.id === set.id) && "bg-green-100 border-green-300 hover:bg-green-200"
                              )}
                            >
                              {set.position}
                              {selectedSets.some(s => s.id === set.id) && (
                                <Check className="h-3 w-3 absolute top-0 right-0 text-white bg-blue-600 rounded-full p-0.5" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    <div className="w-full p-3 mt-8 bg-yellow-100 text-yellow-800 text-center font-medium rounded">
                      Beach Entrance
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4 justify-end">
                    <div className="flex items-center gap-1 text-xs">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span>Selected</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <div className="h-3 w-3 rounded-full bg-gray-300"></div>
                      <span>Reserved</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6 space-x-4">
                    <Button variant="outline" onClick={() => goToStep("date")}>
                      Back
                    </Button>
                    <Button 
                      onClick={() => goToStep("payment")}
                      disabled={selectedSets.length === 0}
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="payment" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border rounded-lg p-6 bg-gray-50">
                <h3 className="font-semibold text-lg mb-4">Reservation Summary</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Beach:</span>
                      <span className="font-medium">{beach.name}</span>
                    </div>
                    {beach.location && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{beach.location}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Zone:</span>
                      <span className="font-medium">{selectedZone?.name || "Not selected"}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-gray-600 mb-2">Selected Sets:</p>
                    <div className="space-y-2">
                      {selectedSets.map(set => (
                        <div key={set.id} className="flex justify-between items-center p-2 bg-white rounded border">
                          <span>{set.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">${Number(set.price).toFixed(2)}</span>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRemoveSet(set.id)}
                              className="h-6 w-6 p-0"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>${selectedSets.reduce((sum, set) => sum + Number(set.price || 0), 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                {user ? (
                  <div className="space-y-6">
                    <h3 className="font-semibold text-lg">Payment Information</h3>
                    <p className="text-gray-600">
                      Your reservation will be processed immediately. You will receive a confirmation email shortly.
                    </p>
                    
                    <div className="flex items-center space-x-2 my-4">
                      <Checkbox id="terms" />
                      <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I agree to the terms and conditions
                      </label>
                    </div>
                    
                    <div className="flex justify-end space-x-4">
                      <Button variant="outline" onClick={() => goToStep("location")}>
                        Back
                      </Button>
                      <Button 
                        onClick={handleReservation}
                        disabled={isProcessing || selectedSets.length === 0}
                      >
                        {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Complete Reservation
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <h3 className="font-semibold text-lg">Continue as Guest</h3>
                    <p className="text-gray-600 mb-4">
                      Please provide your contact information to continue with the reservation.
                    </p>
                    
                    <GuestReservationForm 
                      onSubmit={handleGuestReservation}
                      onCancel={() => goToStep("location")}
                      isSubmitting={isProcessing}
                    />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
