
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Reservation } from "@/types";
import { useReservationActions } from "@/hooks/reservations/useReservationActions";

type ReservationActionsProps = {
  reservation: Reservation | null;
};

export function ReservationActions({ reservation }: ReservationActionsProps) {
  const { handleCancelReservation, isCancellable, isProcessing } = useReservationActions(reservation);
  
  return (
    <div className="flex justify-between">
      <Button variant="outline" asChild>
        <Link to="/beaches">Browse More Beaches</Link>
      </Button>
      
      <div className="flex gap-2">
        <Button onClick={() => window.print()}>
          Print Confirmation
        </Button>
      </div>
    </div>
  );
}
