import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth"; // Updated import path
import { Reservation } from "@/types";

interface ReservationWithBeach extends Reservation {
  beach_name?: string;
}

export function useMyReservations() {
  const { toast } = useToast();
  const { userSession } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<ReservationWithBeach[]>([]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      
      // If user is logged in, fetch both authenticated and guest reservations that match user's phone
      if (userSession.user) {
        // Fetch client info to get the phone number
        const { data: clientData, error: clientError } = await supabase
          .from("clients")
          .select("phone")
          .eq("user_id", userSession.user.id)
          .single();
          
        if (clientError) {
          console.error("Error fetching client data:", clientError);
        }
        
        const userPhone = clientData?.phone;
        
        let query = supabase
          .from("reservations")
          .select(`
            *,
            beaches:beach_id (
              id,
              name
            )
          `)
          .order('reservation_date', { ascending: false });
        
        // Combine authenticated and guest reservations by phone
        if (userSession.clientId) {
          // Get authenticated reservations
          query = query.or(`client_id.eq.${userSession.clientId}${userPhone ? `,guest_phone.eq.${userPhone}` : ''}`);
        } else if (userPhone) {
          // Only get by phone if no client ID
          query = query.eq('guest_phone', userPhone);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Transform data to include beach_name for easier access
        const reservationsWithBeach = data?.map(reservation => {
          return {
            ...reservation,
            beach_name: (reservation.beaches as any)?.name || "Unknown Beach"
          };
        }) || [];
        
        setReservations(reservationsWithBeach);
      } else {
        // No user session, show empty reservations
        setReservations([]);
      }
    } catch (error: any) {
      toast({
        title: "Error loading reservations",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [userSession]);

  return {
    loading,
    reservations,
    fetchReservations,
  };
}
