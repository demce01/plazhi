
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function ReservationActions() {
  return (
    <div className="flex justify-between">
      <Button variant="outline" asChild>
        <Link to="/beaches">Browse More Beaches</Link>
      </Button>
      
      <Button onClick={() => window.print()}>
        Print Confirmation
      </Button>
    </div>
  );
}
