
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Reservation } from "@/types";
import { UserCheck, X } from "lucide-react";

interface ReservationActionsProps {
  reservation: Reservation;
  onCheckIn: (reservationId: string) => void;
  onUpdateStatus: (reservationId: string, status: string) => void;
  onCancelClick: (reservation: Reservation) => void;
}

export function ReservationActions({
  reservation,
  onCheckIn,
  onUpdateStatus,
  onCancelClick
}: ReservationActionsProps) {
  return (
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
          onClick={() => onCheckIn(reservation.id)}
        >
          <UserCheck className="h-4 w-4 mr-1" /> Check-in
        </Button>
      )}
      
      {reservation.status !== 'confirmed' && reservation.status !== 'cancelled' && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onUpdateStatus(reservation.id, 'confirmed')}
        >
          Confirm
        </Button>
      )}
      
      {reservation.status !== 'cancelled' && (
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onCancelClick(reservation)}
        >
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
      )}
    </div>
  );
}
