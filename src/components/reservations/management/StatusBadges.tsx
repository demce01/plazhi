
import { CheckCircle2, Clock, XCircle, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

interface CheckinBadgeProps {
  checkedIn?: boolean;
}

interface PaymentStatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Confirmed
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" /> Cancelled
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" /> Pending
        </Badge>
      );
  }
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  switch (status.toLowerCase()) {
    case 'paid':
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Paid
        </Badge>
      );
    case 'refunded':
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Refunded
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" /> Pending
        </Badge>
      );
  }
}

export function CheckinBadge({ checkedIn }: CheckinBadgeProps) {
  if (checkedIn) {
    return (
      <Badge variant="outline" className="bg-green-100 text-green-800">
        <UserCheck className="h-3 w-3 mr-1" /> Checked In
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
      <Clock className="h-3 w-3 mr-1" /> Not Checked In
    </Badge>
  );
}
