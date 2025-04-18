import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, Users, Umbrella } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
// Import types if needed
import { Reservation } from "@/types";
import { ReservationWithBeachAdmin } from "@/hooks/admin/useAdminReservations"; // Use the specific type
import { AdminReservationsTable } from "@/components/admin/AdminReservationsTable"; // Use the admin table

// Helper type for reservation counts
interface ReservationStats {
  total: number;
  lastMonth: number;
  revenue: number;
  recent: ReservationWithBeachAdmin[]; // Expect the admin-specific type
}

export default function DashboardOverview() {
  // Fetch beaches count
  const { data: beachesData, isLoading: isLoadingBeaches } = useQuery<number, Error>({
    queryKey: ['beaches-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('beaches')
        .select('*', { count: 'exact', head: true });
      if (error) throw new Error(error.message || "Failed to count beaches");
      return count || 0;
    },
  });

  // Fetch ADMIN users count (more reliable than checking current user)
  const { data: adminsCount, isLoading: isLoadingAdmins } = useQuery<number, Error>({
    queryKey: ['admins-count'],
    queryFn: async () => {
      // Requires the list_all_users function created earlier
      const { data, error } = await (supabase as any).rpc('list_all_users');
      if (error) {
        console.error("Failed to list users for admin count:", error);
        return 0; // Return 0 on error
      }
      // Count users with admin role
      return data?.filter((u: any) => u.role === 'admin').length || 0;
    },
    staleTime: 10 * 60 * 1000, // Cache admin count for 10 mins
  });

  // Fetch reservation stats (including recent)
  const { data: reservationsData, isLoading: isLoadingReservations } = useQuery<ReservationStats, Error>({
    queryKey: ['reservations-stats'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Fetch all relevant reservation data in one go
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          beach:beach_id (id, name)
        `)
        .order('created_at', { ascending: false }); // Order by creation for recent
      
      if (error) throw new Error(error.message || "Failed to fetch reservation stats");
      if (!data) return { total: 0, lastMonth: 0, revenue: 0, recent: [] };

      const totalRevenue = data.reduce((acc, curr) => acc + (Number(curr.payment_amount) || 0), 0);
      const totalCount = data.length;
      const lastMonthCount = data.filter(r => new Date(r.created_at) > thirtyDaysAgo).length;
      
      // Get top 5 recent reservations, mapping to the expected type
      const recentReservations: ReservationWithBeachAdmin[] = data.slice(0, 5).map((r: any) => ({
          ...(r as Reservation), // Spread all base reservation fields
          beach_name: r.beach?.name || "Unknown Beach",
          // Ensure checked_in exists, defaulting if null/undefined from DB
          checked_in: r.checked_in ?? false 
      }));

      return {
        total: totalCount,
        lastMonth: lastMonthCount,
        revenue: totalRevenue,
        recent: recentReservations
      };
    },
    staleTime: 2 * 60 * 1000, // Cache stats for 2 minutes
  });

  const isLoading = isLoadingBeaches || isLoadingAdmins || isLoadingReservations;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const revenueChange = reservationsData?.lastMonth && reservationsData.total > reservationsData.lastMonth ? 
    (((reservationsData.lastMonth * 100) / (reservationsData.total - reservationsData.lastMonth)) || 0).toFixed(1) : 
    (reservationsData?.lastMonth ? '100.0' : '0.0'); // Handle case where all reservations are recent

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your dashboard overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingReservations ? <Loader2 className="h-6 w-6 animate-spin" /> : `$${(reservationsData?.revenue || 0).toFixed(2)}`}
            </div>
            <p className="text-xs text-muted-foreground">
              {!isLoadingReservations && `${revenueChange}% from last month`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Beaches</CardTitle>
            <Umbrella className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingBeaches ? <Loader2 className="h-6 w-6 animate-spin" /> : beachesData ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Total registered beaches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingReservations ? <Loader2 className="h-6 w-6 animate-spin" /> : reservationsData?.total ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {!isLoadingReservations && `${reservationsData?.lastMonth ?? 0} new in last 30 days`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingAdmins ? <Loader2 className="h-6 w-6 animate-spin" /> : adminsCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Total administrators
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reservations</CardTitle>
          <CardDescription>
            The 5 most recently created reservations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminReservationsTable 
            reservations={reservationsData?.recent || []} 
            isLoading={isLoadingReservations} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
