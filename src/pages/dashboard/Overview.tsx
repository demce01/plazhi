import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Umbrella, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  BarChart3, 
  Clock,
  Check,
  X,
  Shield
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Reservation } from "@/types";
import { ReservationWithBeachAdmin } from "@/hooks/admin/useAdminReservations";
import { AdminReservationsTable } from "@/components/admin/AdminReservationsTable";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ReservationStats {
  total: number;
  lastMonth: number;
  revenue: number;
  recent: ReservationWithBeachAdmin[];
}

interface BeachStats {
  count: number;
  active: number;
  capacity: number;
}

export default function DashboardOverview() {
  const navigate = useNavigate();
  
  const { data: beachesData, isLoading: isLoadingBeaches } = useQuery<BeachStats, Error>({
    queryKey: ['beaches-stats'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('beaches')
        .select('*', { count: 'exact', head: true });
      
      const { data: beachesWithSets } = await supabase
        .from('beaches')
        .select('id');
      
      const { data: sets } = await supabase
        .from('sets')
        .select('id');
        
      if (error) throw new Error(error.message || "Failed to count beaches");
      return {
        count: count || 0,
        active: beachesWithSets?.length || 0,
        capacity: sets?.length || 0
      };
    },
  });

  const { data: adminsCount, isLoading: isLoadingAdmins } = useQuery<number, Error>({
    queryKey: ['admins-count'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('list_all_users');
      if (error) {
        console.error("Failed to list users for admin count:", error);
        return 0;
      }
      return data?.filter((u: any) => u.role === 'admin').length || 0;
    },
    staleTime: 10 * 60 * 1000,
  });

  const { data: reservationsData, isLoading: isLoadingReservations } = useQuery<ReservationStats, Error>({
    queryKey: ['reservations-stats'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          beach:beach_id (id, name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw new Error(error.message || "Failed to fetch reservation stats");
      if (!data) return { total: 0, lastMonth: 0, revenue: 0, recent: [] };

      const totalRevenue = data.reduce((acc, curr) => acc + (Number(curr.payment_amount) || 0), 0);
      const totalCount = data.length;
      const lastMonthCount = data.filter(r => new Date(r.created_at) > thirtyDaysAgo).length;
      
      const recentReservations: ReservationWithBeachAdmin[] = data.slice(0, 5).map((r: any) => ({
          ...(r as Reservation),
          beach_name: r.beach?.name || "Unknown Beach",
          checked_in: r.checked_in ?? false 
      }));

      return {
        total: totalCount,
        lastMonth: lastMonthCount,
        revenue: totalRevenue,
        recent: recentReservations
      };
    },
    staleTime: 2 * 60 * 1000,
  });

  const { data: todayReservations, isLoading: isLoadingToday } = useQuery<ReservationWithBeachAdmin[], Error>({
    queryKey: ['today-reservations'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          beach:beach_id (id, name)
        `)
        .eq('reservation_date', todayStr)
        .order('created_at', { ascending: false });
      
      if (error) throw new Error(error.message || "Failed to fetch today's reservations");
      if (!data) return [];
      
      return data.map((r: any) => ({
          ...(r as Reservation),
          beach_name: r.beach?.name || "Unknown Beach",
          checked_in: r.checked_in ?? false 
      }));
    },
    staleTime: 2 * 60 * 1000,
  });

  const isLoading = isLoadingBeaches || isLoadingAdmins || isLoadingReservations || isLoadingToday;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const revenueChange = reservationsData?.lastMonth && reservationsData.total > 0 ? 
    Math.floor((reservationsData.lastMonth / reservationsData.total) * 100) : 0;
    
  const capacityUsage = beachesData?.capacity ? 
    Math.floor((reservationsData?.total || 0) / beachesData.capacity * 100) : 0;
    
  const checkedInCount = todayReservations?.filter(r => r.checked_in).length || 0;
  const todayCount = todayReservations?.length || 0;
  const checkedInPercentage = todayCount > 0 ? Math.floor((checkedInCount / todayCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your admin dashboard overview.</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/settings/admin/beaches")}
          >
            <Umbrella className="mr-2 h-4 w-4" />
            Manage Beaches
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => navigate("/settings/admin/create-reservation")}
          >
            <Calendar className="mr-2 h-4 w-4" />
            New Reservation
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(reservationsData?.revenue || 0).toFixed(2)}</div>
            <div className="flex items-center mt-1">
              <Badge variant={revenueChange >= 0 ? "outline" : "destructive"} className="text-xs font-normal">
                {revenueChange >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {revenueChange}% from last month
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beaches</CardTitle>
            <Umbrella className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{beachesData?.count || 0}</div>
            <div className="flex flex-col space-y-1 mt-1">
              <div className="text-xs text-muted-foreground flex justify-between">
                <span>Total Capacity:</span>
                <span className="font-medium">{beachesData?.capacity || 0} sets</span>
              </div>
              <Progress value={capacityUsage} className="h-1" />
              <span className="text-xs text-muted-foreground">{capacityUsage}% utilization</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservations</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reservationsData?.total || 0}</div>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex-1">
                <div className="text-xs text-muted-foreground flex justify-between mb-1">
                  <span>Last 30 days:</span>
                  <span className="font-medium">{reservationsData?.lastMonth || 0}</span>
                </div>
                <div className="flex items-center text-xs">
                  <Badge variant="secondary" className="mr-1">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {reservationsData?.lastMonth || 0} new
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Check-ins</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checkedInCount} / {todayCount}</div>
            <div className="flex flex-col space-y-1 mt-1">
              <Progress value={checkedInPercentage} className="h-1" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{checkedInPercentage}% checked in</span>
                <span>{todayCount - checkedInCount} remaining</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="mt-6">
        <TabsList>
          <TabsTrigger value="today" className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Today's Reservations
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Recent Activity
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="today" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Today's Reservations</CardTitle>
                  <CardDescription>
                    {todayCount} reservations scheduled for today
                  </CardDescription>
                </div>
                {todayCount > 0 && (
                  <Badge variant={checkedInPercentage === 100 ? "success" : "outline"}>
                    {checkedInPercentage}% Check-in Rate
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {todayReservations?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium">No Reservations Today</h3>
                  <p className="text-muted-foreground mt-1 max-w-sm">
                    There are no reservations scheduled for today. Check back later or create a new reservation.
                  </p>
                  <Button 
                    className="mt-4" 
                    onClick={() => navigate("/settings/admin/create-reservation")}
                  >
                    Create New Reservation
                  </Button>
                </div>
              ) : (
                <AdminReservationsTable 
                  reservations={todayReservations} 
                  isLoading={false}
                  showCheckInColumn={true}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recent" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reservations</CardTitle>
              <CardDescription>
                The 5 most recently created reservations across all beaches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminReservationsTable 
                reservations={reservationsData?.recent || []} 
                isLoading={isLoadingReservations} 
              />
            </CardContent>
            <CardFooter className="flex justify-end pt-0">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/settings/admin")}
                className="text-sm"
              >
                View all reservations
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-500" />
              Admin Access
            </CardTitle>
            <CardDescription>
              {adminsCount} administrator{adminsCount !== 1 ? 's' : ''} in the system
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button variant="outline" className="justify-start" onClick={() => navigate("/settings/admin")}>
              <Shield className="h-4 w-4 mr-2" />
              Admin Dashboard
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => navigate("/settings/admin/beaches")}>
              <Umbrella className="h-4 w-4 mr-2" />
              Beach Management
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => navigate("/settings/admin/create-reservation")}>
              <Calendar className="h-4 w-4 mr-2" />
              Create On-Site Booking
            </Button>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-green-500" />
              Sales Overview
            </CardTitle>
            <CardDescription>
              Revenue and reservation performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-2">
                <div className="text-sm font-medium">Revenue</div>
                <div className="text-2xl font-bold">${(reservationsData?.revenue || 0).toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">
                  From {reservationsData?.total || 0} total reservations
                </div>
                <div className="flex items-center mt-1">
                  <Badge variant="outline" className="text-xs">
                    Avg: ${reservationsData?.total ? (reservationsData.revenue / reservationsData.total).toFixed(2) : '0.00'}/reservation
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Capacity Utilization</span>
                    <span>{capacityUsage}%</span>
                  </div>
                  <Progress value={capacityUsage} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Today's Check-ins</span>
                    <span>{checkedInPercentage}%</span>
                  </div>
                  <Progress value={checkedInPercentage} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
