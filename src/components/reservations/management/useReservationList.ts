
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Reservation } from "@/types";

interface ReservationWithBeach extends Reservation {
  beach_name?: string;
}

export function useReservationList() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<ReservationWithBeach[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<ReservationWithBeach[]>([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState("all");
  const [beachFilter, setBeachFilter] = useState("all");
  const [checkinFilter, setCheckinFilter] = useState("all");

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reservations, searchQuery, dateFilter, statusFilter, beachFilter, checkinFilter]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("reservations")
        .select(`
          *,
          beaches:beach_id (
            id,
            name
          )
        `)
        .order('reservation_date', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to include beach_name for easier access
      const reservationsWithBeach = data?.map(reservation => {
        return {
          ...reservation,
          beach_name: (reservation.beaches as any)?.name || "Unknown Beach"
        };
      }) || [];
      
      setReservations(reservationsWithBeach);
      setFilteredReservations(reservationsWithBeach);
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

  const applyFilters = () => {
    let filtered = [...reservations];
    
    // Search filter (guest name, email, phone)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(res => 
        (res.guest_name?.toLowerCase().includes(query)) || 
        (res.guest_email?.toLowerCase().includes(query)) || 
        (res.guest_phone?.toLowerCase().includes(query))
      );
    }
    
    // Date filter
    if (dateFilter) {
      const filterDate = formatDate(dateFilter);
      filtered = filtered.filter(res => res.reservation_date === filterDate);
    }
    
    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(res => res.status === statusFilter);
    }
    
    // Beach filter
    if (beachFilter !== "all") {
      filtered = filtered.filter(res => res.beach_id === beachFilter);
    }

    // Check-in filter
    if (checkinFilter !== "all") {
      filtered = filtered.filter(res => 
        checkinFilter === "checked_in" ? res.checked_in : !res.checked_in
      );
    }
    
    setFilteredReservations(filtered);
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDateFilter(undefined);
    setStatusFilter("all");
    setBeachFilter("all");
    setCheckinFilter("all");
  };

  return {
    loading,
    reservations: filteredReservations,
    fetchReservations,
    filters: {
      searchQuery,
      dateFilter,
      statusFilter,
      beachFilter,
      checkinFilter,
      setSearchQuery,
      setDateFilter,
      setStatusFilter,
      setBeachFilter,
      setCheckinFilter,
      clearFilters
    }
  };
}
