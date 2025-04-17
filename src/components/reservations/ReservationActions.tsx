
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Reservation } from "@/types";
import { useReservationActions } from "@/hooks/reservations/useReservationActions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { X } from "lucide-react";

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
        {isCancellable && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isProcessing}>
                <X className="mr-2 h-4 w-4" />
                Cancel Reservation
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel this reservation? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Reservation</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancelReservation}>
                  Yes, Cancel Reservation
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        
        <Button onClick={() => window.print()}>
          Print Confirmation
        </Button>
      </div>
    </div>
  );
}
