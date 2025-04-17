
import { useNavigate } from "react-router-dom";
import { Loader2, Plus, CalendarRange, Clock } from "lucide-react";
import { useMyReservations } from "@/hooks/useMyReservations";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { ReservationCard } from "@/components/reservations/ReservationCard";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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
    <div className="container max-w-6xl py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Reservations</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your beach reservations
          </p>
        </div>
        <Button onClick={() => navigate("/beaches")} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          New Reservation
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : reservations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 border rounded-lg bg-muted/30 text-center">
          <CalendarRange className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium">No reservations found</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">
            {userSession.user
              ? "You haven't made any reservations yet. Browse our beaches to make your first reservation."
              : "Please sign in to view your reservations."}
          </p>
          <Button
            variant="default"
            size="lg"
            className="mt-6"
            onClick={() => navigate(userSession.user ? "/beaches" : "/auth/login")}
          >
            {userSession.user ? "Browse Beaches" : "Sign In"}
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Upcoming ({upcomingReservations.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4" />
              Past ({pastReservations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            {upcomingReservations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No upcoming reservations
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingReservations.map((reservation) => (
                  <ReservationCard key={reservation.id} reservation={reservation} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
            {pastReservations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No past reservations
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastReservations.map((reservation) => (
                  <ReservationCard key={reservation.id} reservation={reservation} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
