
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Reservation, Beach, Set } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar, MapPin, CheckCircle2, Mail, Phone, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function ReservationDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [beach, setBeach] = useState<Beach | null>(null);
  const [sets, setSets] = useState<Set[]>([]);

  useEffect(() => {
    if (!id) return;
    fetchReservation(id);
  }, [id]);

  const fetchReservation = async (reservationId: string) => {
    try {
      setLoading(true);
      
      // Fetch reservation details
      const { data, error } = await supabase
        .from("reservations")
        .select(`
          *,
          beach:beach_id (*),
          reservation_sets (
            *,
            set:set_id (*)
          )
        `)
        .eq("id", reservationId)
        .single();
      
      if (error) throw error;
      
      // Extract data
      setReservation(data);
      setBeach(data.beach);
      
      // Extract sets from reservation_sets
      const reservedSets = data.reservation_sets.map((rs: any) => rs.set);
      setSets(reservedSets);
      
    } catch (error: any) {
      toast({
        title: "Error loading reservation",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatReservationId = (id: string) => {
    return id.substring(0, 8).toUpperCase();
  };

  const handleCheckIn = async () => {
    if (!reservation || !id) return;
    
    try {
      const { error } = await supabase
        .from("reservations")
        .update({ checked_in: true })
        .eq("id", id);
      
      if (error) throw error;
      
      setReservation({ ...reservation, checked_in: true });
      
      toast({
        title: "Guest checked in",
        description: "Guest has been successfully checked in",
      });
    } catch (error: any) {
      toast({
        title: "Error checking in guest",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-12 w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
        <Skeleton className="h-[100px]" />
      </div>
    );
  }

  if (!reservation || !beach) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Reservation Not Found</h1>
        <p className="mb-8">The reservation you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/beaches">Browse Beaches</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-500" />
          <h1 className="text-3xl font-bold">Reservation Confirmed</h1>
        </div>
        <p className="mt-2 text-muted-foreground">
          Thank you for your reservation. Please show this confirmation to the beach staff.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Reservation Details</h2>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Reservation ID</p>
              <p className="font-mono font-bold">{formatReservationId(reservation.id)}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Reservation Date</p>
              <p className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {format(new Date(reservation.reservation_date), "EEEE, MMMM d, yyyy")}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="capitalize">{reservation.status}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Payment Status</p>
              <p className="capitalize">{reservation.payment_status}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Check-in Status</p>
              {reservation.checked_in ? (
                <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center w-fit">
                  <UserCheck className="h-4 w-4 mr-1" /> Checked In
                </Badge>
              ) : (
                reservation.status === 'confirmed' ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Not Checked In</Badge>
                    <Button size="sm" variant="outline" onClick={handleCheckIn} className="h-7">
                      <UserCheck className="h-3 w-3 mr-1" /> Check-in
                    </Button>
                  </div>
                ) : (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Not Checked In</Badge>
                )
              )}
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Reservation For</p>
              <p>{reservation.guest_name || "Logged-in User"}</p>
            </div>
            
            {reservation.guest_phone && (
              <div>
                <p className="text-sm text-muted-foreground">Contact Phone</p>
                <p className="flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  {reservation.guest_phone}
                </p>
              </div>
            )}
            
            {reservation.guest_email && (
              <div>
                <p className="text-sm text-muted-foreground">Contact Email</p>
                <p className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  {reservation.guest_email}
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Beach Information</h2>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Beach</p>
              <p className="font-medium">{beach.name}</p>
            </div>
            
            {beach.location && (
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {beach.location}
                </p>
              </div>
            )}
            
            <div>
              <p className="text-sm text-muted-foreground">Reserved Sets</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {sets.map((set) => (
                  <div key={set.id} className="px-2 py-1 bg-primary/10 rounded text-sm">
                    {set.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-card p-6 rounded-lg border shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4">Payment Summary</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground">Reserved Sets</p>
            <p>{sets.length} sets</p>
          </div>
          
          {sets.map((set) => (
            <div key={set.id} className="flex justify-between">
              <p>{set.name}</p>
              <p>{Number(set.price).toFixed(2)}</p>
            </div>
          ))}
          
          <div className="pt-2 border-t flex justify-between font-bold">
            <p>Total Amount</p>
            <p>{Number(reservation.payment_amount).toFixed(2)}</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" asChild>
          <Link to="/beaches">Browse More Beaches</Link>
        </Button>
        
        <Button onClick={() => window.print()}>
          Print Confirmation
        </Button>
      </div>
    </div>
  );
}
