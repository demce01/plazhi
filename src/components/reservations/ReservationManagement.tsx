import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Beach, Reservation } from "@/types";
import { Button } from "@/components/ui/button";
import { Calendar, Filter, Loader2, Search, UserCheck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Link } from "react-router-dom";

interface ReservationManagementProps {
  beaches: Beach[];
  activateReservationsTab?: () => void;
}

// Define interface for joined reservation data with beach
interface ReservationWithBeach extends Reservation {
  beach_name?: string;
}

export function ReservationManagement({ 
  beaches,
  activateReservationsTab
}: ReservationManagementProps) {
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
      const filterDate = format(dateFilter, 'yyyy-MM-dd');
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "confirmed":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "processing":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Processing</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>;
      case "failed":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCheckinBadge = (checkedIn: boolean | undefined) => {
    return checkedIn ? 
      <Badge variant="outline" className="bg-green-100 text-green-800">Checked In</Badge> : 
      <Badge variant="outline" className="bg-gray-100 text-gray-800">Not Checked In</Badge>;
  };

  const handleUpdateStatus = async (reservationId: string, newStatus: string) => {
    try {
      console.log(`Updating reservation ${reservationId} status to ${newStatus}`);
      
      // Update the reservation status in the database
      const { data, error } = await supabase
        .from("reservations")
        .update({ status: newStatus })
        .eq("id", reservationId)
        .select();
      
      if (error) {
        console.error("Update error:", error);
        throw error;
      }
      
      console.log("Database update successful", data);
      
      // Update local state to reflect the change
      setReservations(prev => 
        prev.map(res => 
          res.id === reservationId ? { ...res, status: newStatus } : res
        )
      );
      
      // Also update filtered reservations to immediately reflect the change in UI
      setFilteredReservations(prev => 
        prev.map(res => 
          res.id === reservationId ? { ...res, status: newStatus } : res
        )
      );
      
      toast({
        title: "Reservation updated",
        description: `Reservation status changed to ${newStatus}`,
      });
      
    } catch (error: any) {
      console.error("Failed to update reservation:", error);
      toast({
        title: "Error updating reservation",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCheckIn = async (reservationId: string) => {
    try {
      console.log(`Checking in reservation ${reservationId}`);
      
      // Update the reservation check-in status in the database
      const { data, error } = await supabase
        .from("reservations")
        .update({ checked_in: true })
        .eq("id", reservationId)
        .select();
      
      if (error) {
        console.error("Check-in error:", error);
        throw error;
      }
      
      console.log("Check-in successful", data);
      
      // Update local state to reflect the change
      setReservations(prev => 
        prev.map(res => 
          res.id === reservationId ? { ...res, checked_in: true } : res
        )
      );
      
      // Also update filtered reservations to immediately reflect the change in UI
      setFilteredReservations(prev => 
        prev.map(res => 
          res.id === reservationId ? { ...res, checked_in: true } : res
        )
      );
      
      toast({
        title: "Guest checked in",
        description: "Guest has been successfully checked in",
      });
      
    } catch (error: any) {
      console.error("Failed to check in guest:", error);
      toast({
        title: "Error checking in guest",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDateFilter(undefined);
    setStatusFilter("all");
    setBeachFilter("all");
    setCheckinFilter("all");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reservations Management</CardTitle>
        <CardDescription>
          View and manage all beach reservations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="w-[180px]">
                <DatePicker
                  date={dateFilter}
                  setDate={setDateFilter}
                  placeholder="Filter by date"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={beachFilter} onValueChange={setBeachFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by beach" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Beaches</SelectItem>
                  {beaches.map((beach) => (
                    <SelectItem key={beach.id} value={beach.id}>
                      {beach.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={checkinFilter} onValueChange={setCheckinFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by check-in" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Check-ins</SelectItem>
                  <SelectItem value="checked_in">Checked In</SelectItem>
                  <SelectItem value="not_checked_in">Not Checked In</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="flex gap-2"
              >
                <Filter className="h-4 w-4" /> Clear
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No reservations found that match your filters.
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Beach</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {format(new Date(reservation.reservation_date), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{reservation.guest_name || "Anonymous"}</div>
                          {reservation.guest_email && (
                            <div className="text-xs text-muted-foreground">{reservation.guest_email}</div>
                          )}
                          {reservation.guest_phone && (
                            <div className="text-xs text-muted-foreground">{reservation.guest_phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {reservation.beach_name || "Unknown Beach"}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(reservation.status || 'pending')}
                      </TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(reservation.payment_status || 'pending')}
                      </TableCell>
                      <TableCell>
                        {getCheckinBadge(reservation.checked_in)}
                      </TableCell>
                      <TableCell>
                        ${Number(reservation.payment_amount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            asChild
                          >
                            <Link to={`/reservations/${reservation.id}`}>
                              View
                            </Link>
                          </Button>
                          
                          {reservation.status === 'confirmed' && !reservation.checked_in && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border-blue-200"
                              onClick={() => handleCheckIn(reservation.id)}
                            >
                              <UserCheck className="h-4 w-4 mr-1" /> Check-in
                            </Button>
                          )}
                          
                          {reservation.status !== 'confirmed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(reservation.id, 'confirmed')}
                            >
                              Confirm
                            </Button>
                          )}
                          
                          {reservation.status !== 'cancelled' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleUpdateStatus(reservation.id, 'cancelled')}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
