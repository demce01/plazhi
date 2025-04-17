
import { Reservation } from "@/types";
import { Calendar, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone } from "lucide-react";

interface ReservationInfoProps {
  reservation: Reservation;
  formatReservationId: (id: string) => string;
  onCheckIn: () => void;
}

export function ReservationInfo({ reservation, formatReservationId, onCheckIn }: ReservationInfoProps) {
  return (
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
                <Button size="sm" variant="outline" onClick={onCheckIn} className="h-7">
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
  );
}
