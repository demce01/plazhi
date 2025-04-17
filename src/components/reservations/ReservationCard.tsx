
import { format } from "date-fns";
import { Calendar, MapPin, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { Reservation } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, PaymentStatusBadge, CheckinBadge } from "@/components/reservations/management/StatusBadges";

interface ReservationCardProps {
  reservation: Reservation & { beach_name?: string };
}

export function ReservationCard({ reservation }: ReservationCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{format(new Date(reservation.reservation_date), 'MMM dd, yyyy')}</CardTitle>
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
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link to={`/reservations/${reservation.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
