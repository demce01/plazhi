
import { Reservation, Set } from "@/types";

interface PaymentSummaryProps {
  reservation: Reservation;
  sets: Set[];
}

export function PaymentSummary({ reservation, sets }: PaymentSummaryProps) {
  return (
    <div className="bg-card p-6 rounded-lg border shadow-sm mb-8">
      <h2 className="text-lg font-semibold mb-4">Payment Summary</h2>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <p className="text-sm text-muted-foreground">Reserved Sets</p>
          <p>{sets.length} sets</p>
        </div>
        
        {sets.map((set) => (
          <div key={set.id} className="flex justify-between">
            <p>{set.name}</p>
            <p>{Number(set.price).toFixed(2)}</p>
          </div>
        ))}
        
        <div className="pt-2 border-t flex justify-between font-bold">
          <p>Total Amount</p>
          <p>{Number(reservation.payment_amount).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
