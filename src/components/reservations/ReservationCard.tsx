import { format } from "date-fns";
import { Calendar, MapPin, DollarSign, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Reservation } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, PaymentStatusBadge, CheckinBadge } from "@/components/reservations/management/StatusBadges";
import { useReservationActions } from "@/hooks/reservations/useReservationActions";

interface ReservationCardProps {
  reservation: Reservation & { beach_name?: string };
  onCancel?: () => void;
}

export function ReservationCard({ reservation, onCancel }: ReservationCardProps) {
  const { isCancellable, isProcessing: isCancelling } = useReservationActions(reservation);
  
  // Format date for better display
  const formattedDate = format(new Date(reservation.reservation_date), 'MMM dd, yyyy');
  const isPast = new Date(reservation.reservation_date) < new Date();
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{formattedDate}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              {reservation.id.substring(0, 8).toUpperCase()}
            </CardDescription>
          </div>
          <StatusBadge status={reservation.status || 'pending'} />
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-3">
          <div className="flex items-start">
            <MapPin className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
            <div>
              <div className="font-medium">{reservation.beach_name || "Unknown Beach"}</div>
              {reservation.guest_name && <div className="text-sm text-muted-foreground">Guest: {reservation.guest_name}</div>}
            </div>
          </div>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
            <div className="font-medium">${Number(reservation.payment_amount).toFixed(2)}</div>
            <div className="ml-3">
              <PaymentStatusBadge status={reservation.payment_status || 'pending'} />
            </div>
          </div>
          {reservation.checked_in !== undefined && (
            <div className="flex items-center">
              <CheckinBadge checkedIn={reservation.checked_in} />
            </div>
          )}
          {isPast && !reservation.checked_in && reservation.status !== 'cancelled' && (
            <div className="text-sm text-amber-600">
              Note: This reservation was not checked in
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-2 pt-4">
        <Button variant="outline" className="w-full" asChild>
          <Link to={`/reservations/${reservation.id}`}>View Details</Link>
        </Button>
        {onCancel && isCancellable && (
          <Button 
            variant="destructive" 
            className="w-full" 
            onClick={onCancel}
            disabled={isCancelling}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            {isCancelling ? "Cancelling..." : "Cancel Reservation"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
