
import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    case "confirmed":
      return <Badge variant="outline" className="bg-green-100 text-green-800">Confirmed</Badge>;
    case "cancelled":
      return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function PaymentStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    case "processing":
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">Processing</Badge>;
    case "completed":
      return <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>;
    case "failed":
      return <Badge variant="outline" className="bg-red-100 text-red-800">Failed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function CheckinBadge({ checkedIn }: { checkedIn: boolean | undefined }) {
  return checkedIn ? 
    <Badge variant="outline" className="bg-green-100 text-green-800">Checked In</Badge> : 
    <Badge variant="outline" className="bg-gray-100 text-gray-800">Not Checked In</Badge>;
}
