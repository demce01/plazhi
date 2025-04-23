
import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Loader2, Check, X, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ReservationWithBeachAdmin } from "@/hooks/admin/useAdminReservations";
import { supabase } from "@/integrations/supabase/client";

// Helper to get zone/set string
const getZoneSetString = (reservation_sets: any[] | undefined) => {
  if (!reservation_sets || reservation_sets.length === 0) return "—";
  if (reservation_sets.length === 1) {
    const rs = reservation_sets[0];
    // Prefer zone name, then set name
    if (rs.set?.zone?.name) return `${rs.set.zone.name} – ${rs.set.name}`;
    if (rs.set?.name) return rs.set.name;
    return "-";
  }
  // Multiple sets: just say "(multiple)"
  return "(multiple)";
};

interface AdminReservationsTableProps {
  reservations: ReservationWithBeachAdmin[];
  isLoading: boolean;
  onActionComplete?: () => void;
  showCheckInColumn?: boolean;
  formatReservationId?: (id: string) => string;
}

export function AdminReservationsTable({ 
  reservations, 
  isLoading, 
  onActionComplete,
  showCheckInColumn = false,
  formatReservationId = (id: string) => id.substring(0, 8).toUpperCase()
}: AdminReservationsTableProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Track reservation sets for each reservation
  const [reservationSetsMap, setReservationSetsMap] = React.useState<Record<string, any[]>>({});

  // Fetch sets for each reservation on mount
  React.useEffect(() => {
    async function fetchAllReservationSets() {
      const ids = reservations.map((r) => r.id);
      if (ids.length === 0) return;
      const { data, error } = await supabase
        .from("reservation_sets")
        .select(`
          reservation_id,
          set: set_id (
            id, name,
            zone:beach_id( name )
          )
        `)
        .in("reservation_id", ids);
      if (data) {
        // Group by reservation_id
        const byReservation: Record<string, any[]> = {};
        data.forEach((rs: any) => {
          if (!byReservation[rs.reservation_id]) byReservation[rs.reservation_id] = [];
          byReservation[rs.reservation_id].push(rs);
        });
        setReservationSetsMap(byReservation);
      }
    }
    fetchAllReservationSets();
  }, [reservations]);

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">Pending</Badge>;
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <Badge className="bg-green-500 text-white">Confirmed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500 text-white">Completed</Badge>;
      case 'pending':
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  // Action handlers
  const handleCheckIn = async (reservation: ReservationWithBeachAdmin) => {
    try {
      setUpdatingId(reservation.id);
      const { error } = await supabase
        .from("reservations")
        .update({ checked_in: true })
        .eq("id", reservation.id);
      if (error) throw error;
      toast({
        title: "Checked in successfully",
        description: `${reservation.guest_name} has been checked in.`,
      });
      onActionComplete?.();
    } catch (error) {
      toast({
        title: "Check-in error",
        description: "Could not check in reservation.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (reservation: ReservationWithBeachAdmin) => {
    try {
      setUpdatingId(reservation.id);
      const { error } = await supabase
        .from("reservations")
        .update({ status: "cancelled" })
        .eq("id", reservation.id);
      if (error) throw error;
      toast({
        title: "Reservation cancelled",
        description: `${reservation.guest_name}'s reservation cancelled.`,
        variant: "warning"
      });
      onActionComplete?.();
    } catch (error) {
      toast({
        title: "Cancellation error",
        description: "Could not cancel reservation.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">No reservations found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booking ID</TableHead>
            <TableHead>Guest</TableHead>
            <TableHead>Beach</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Zone &amp; Set</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation) => (
            <TableRow key={reservation.id}>
              <TableCell className="font-mono">
                {formatReservationId(reservation.id)}
              </TableCell>
              <TableCell className="font-medium">
                {reservation.guest_name || "N/A"}
              </TableCell>
              <TableCell>{reservation.beach_name || "Unknown"}</TableCell>
              <TableCell>
                {reservation.reservation_date ? (
                  format(new Date(reservation.reservation_date), "MMM d, yyyy")
                ) : (
                  "N/A"
                )}
              </TableCell>
              <TableCell>{getStatusBadge(reservation.status)}</TableCell>
              <TableCell>${Number(reservation.payment_amount).toFixed(2)}</TableCell>
              <TableCell>
                {getZoneSetString(reservationSetsMap[reservation.id])}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/admin/reservations/${reservation.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {reservation.status !== "cancelled" && (
                    <>
                      <Button
                        variant={reservation.checked_in ? "default" : "outline"}
                        size="sm"
                        className={`${reservation.checked_in ? "bg-green-500 hover:bg-green-600" : ""}`}
                        onClick={() => handleCheckIn(reservation)}
                        disabled={reservation.checked_in || updatingId === reservation.id}
                      >
                        {updatingId === reservation.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : reservation.checked_in ? (
                          <>
                            <Check className="h-4 w-4 mr-1" /> Checked
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" /> Check In
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancel(reservation)}
                        disabled={updatingId === reservation.id}
                      >
                        {updatingId === reservation.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
