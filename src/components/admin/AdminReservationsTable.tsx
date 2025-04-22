
import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Loader2, Check, X, Eye, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ReservationWithBeachAdmin } from "@/hooks/admin/useAdminReservations";
import { supabase } from "@/integrations/supabase/client";

interface AdminReservationsTableProps {
  reservations: ReservationWithBeachAdmin[];
  isLoading: boolean;
  onActionComplete?: () => void;
  showCheckInColumn?: boolean;
}

export function AdminReservationsTable({ 
  reservations, 
  isLoading, 
  onActionComplete,
  showCheckInColumn = false
}: AdminReservationsTableProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">Pending</Badge>;
    
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>;
      case 'pending':
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const toggleCheckIn = async (reservation: ReservationWithBeachAdmin) => {
    try {
      setUpdatingId(reservation.id);
      
      const { error } = await supabase
        .from('reservations')
        .update({ checked_in: !reservation.checked_in })
        .eq('id', reservation.id);
        
      if (error) throw error;
      
      toast({
        title: reservation.checked_in ? "Check-in reverted" : "Checked in successfully",
        description: `${reservation.guest_name} has been ${reservation.checked_in ? 'unchecked' : 'checked'} in.`,
      });
      
      if (onActionComplete) onActionComplete();
    } catch (error) {
      toast({
        title: "Error updating check-in status",
        description: "There was a problem updating the check-in status. Please try again.",
        variant: "destructive"
      });
      console.error("Check-in error:", error);
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
            <TableHead>Guest</TableHead>
            <TableHead>Beach</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount</TableHead>
            {showCheckInColumn && <TableHead>Checked In</TableHead>}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation) => (
            <TableRow key={reservation.id}>
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
              
              {showCheckInColumn && (
                <TableCell>
                  <Button
                    variant={reservation.checked_in ? "default" : "outline"}
                    size="sm"
                    className={`w-24 ${reservation.checked_in ? "bg-green-500 hover:bg-green-600" : ""}`}
                    onClick={() => toggleCheckIn(reservation)}
                    disabled={updatingId === reservation.id}
                  >
                    {updatingId === reservation.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : reservation.checked_in ? (
                      <>
                        <Check className="h-4 w-4 mr-1" /> Checked
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-1" /> Check In
                      </>
                    )}
                  </Button>
                </TableCell>
              )}
              
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/settings/admin/reservations/${reservation.id}`)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
