
import { format } from "date-fns";
import { Calendar, Loader2 } from "lucide-react";
import { Reservation } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge, PaymentStatusBadge, CheckinBadge } from "./StatusBadges";
import { ReservationActions } from "./ReservationActions";

interface ReservationWithBeach extends Reservation {
  beach_name?: string;
}

interface ReservationTableProps {
  loading: boolean;
  reservations: ReservationWithBeach[];
  onCheckIn: (reservationId: string) => void;
  onUpdateStatus: (reservationId: string, status: string) => void;
  onCancelClick: (reservation: Reservation) => void;
}

export function ReservationTable({
  loading,
  reservations,
  onCheckIn,
  onUpdateStatus,
  onCancelClick
}: ReservationTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (reservations.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No reservations found that match your filters.
      </div>
    );
  }
  
  return (
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
          {reservations.map((reservation) => (
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
                <StatusBadge status={reservation.status || 'pending'} />
              </TableCell>
              <TableCell>
                <PaymentStatusBadge status={reservation.payment_status || 'pending'} />
              </TableCell>
              <TableCell>
                <CheckinBadge checkedIn={reservation.checked_in} />
              </TableCell>
              <TableCell>
                ${Number(reservation.payment_amount).toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                <ReservationActions 
                  reservation={reservation}
                  onCheckIn={onCheckIn}
                  onUpdateStatus={onUpdateStatus}
                  onCancelClick={onCancelClick}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
