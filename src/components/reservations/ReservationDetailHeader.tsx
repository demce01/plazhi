
import { CheckCircle2 } from "lucide-react";

export function ReservationDetailHeader() {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-6 w-6 text-green-500" />
        <h1 className="text-3xl font-bold">Reservation Confirmed</h1>
      </div>
      <p className="mt-2 text-muted-foreground">
        Thank you for your reservation. Please show this confirmation to the beach staff.
      </p>
    </div>
  );
}
