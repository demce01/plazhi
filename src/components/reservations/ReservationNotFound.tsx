
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function ReservationNotFound() {
  return (
    <div className="text-center py-12">
      <h1 className="text-3xl font-bold mb-4">Reservation Not Found</h1>
      <p className="mb-8">The reservation you're looking for doesn't exist or has been removed.</p>
      <Button asChild>
        <Link to="/beaches">Browse Beaches</Link>
      </Button>
    </div>
  );
}
