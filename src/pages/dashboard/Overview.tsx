
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, Users, Umbrella } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function DashboardOverview() {
  // Fetch beaches count
  const { data: beachesData, isLoading: isLoadingBeaches } = useQuery({
    queryKey: ['beaches-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('beaches')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch total managers
  const { data: managersData, isLoading: isLoadingManagers } = useQuery({
    queryKey: ['managers-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('managers')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch total reservations
  const { data: reservationsData, isLoading: isLoadingReservations } = useQuery({
    queryKey: ['reservations-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          payment_amount,
          created_at
        `);
      
      if (error) throw error;

      const totalRevenue = data.reduce((acc, curr) => acc + (Number(curr.payment_amount) || 0), 0);
      const totalCount = data.length;
      const lastMonthCount = data.filter(r => {
        const date = new Date(r.created_at);
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return date > lastMonth;
      }).length;

      return {
        total: totalCount,
        lastMonth: lastMonthCount,
        revenue: totalRevenue
      };
    },
  });

  const isLoading = isLoadingBeaches || isLoadingManagers || isLoadingReservations;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const revenueChange = reservationsData?.lastMonth ? 
    ((reservationsData.lastMonth / (reservationsData.total - reservationsData.lastMonth)) * 100).toFixed(1) : 
    0;

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
              ${reservationsData?.revenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {revenueChange}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Beaches</CardTitle>
            <Umbrella className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{beachesData}</div>
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
            <div className="text-2xl font-bold">{reservationsData?.total}</div>
            <p className="text-xs text-muted-foreground">
              {reservationsData?.lastMonth} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Managers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{managersData}</div>
            <p className="text-xs text-muted-foreground">
              Total registered managers
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Reservations</CardTitle>
            <CardDescription>
              Overview of today's reservations and check-ins
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* We'll implement ReservationList in a future update if needed */}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Popular Beaches</CardTitle>
            <CardDescription>
              Most booked beaches this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* We'll implement BeachStats in a future update if needed */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
