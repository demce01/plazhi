
import { useNavigate } from "react-router-dom";
import { Loader2, Plus } from "lucide-react";
import { useMyReservations } from "@/hooks/useMyReservations";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ReservationCard } from "@/components/reservations/ReservationCard";
import { Separator } from "@/components/ui/separator";

export default function MyReservations() {
  const { loading, reservations } = useMyReservations();
  const { userSession } = useAuth();
  const navigate = useNavigate();

  const upcomingReservations = reservations.filter(
    res => new Date(res.reservation_date) >= new Date() && res.status !== 'cancelled'
  );
  
  const pastReservations = reservations.filter(
    res => new Date(res.reservation_date) < new Date() || res.status === 'cancelled'
  );

  return (
    <div className="container max-w-6xl py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Reservations</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your beach reservations
          </p>
        </div>
        <Button onClick={() => navigate("/beaches")}>
          <Plus className="h-4 w-4 mr-2" />
          New Reservation
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : reservations.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-muted/30">
          <h3 className="text-xl font-medium">No reservations found</h3>
          <p className="text-muted-foreground mt-2">
            {userSession.user
              ? "You haven't made any reservations yet. Browse our beaches to make your first reservation."
              : "Please sign in to view your reservations."}
          </p>
          <Button
            variant="default"
            className="mt-4"
            onClick={() => navigate(userSession.user ? "/beaches" : "/auth/login")}
          >
            {userSession.user ? "Browse Beaches" : "Sign In"}
          </Button>
        </div>
      ) : (
        <div className="space-y-10">
          {upcomingReservations.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Upcoming Reservations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingReservations.map((reservation) => (
                  <ReservationCard key={reservation.id} reservation={reservation} />
                ))}
              </div>
            </div>
          )}

          {pastReservations.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Past Reservations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastReservations.map((reservation) => (
                  <ReservationCard key={reservation.id} reservation={reservation} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
