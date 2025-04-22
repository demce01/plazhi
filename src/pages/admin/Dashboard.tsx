
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { 
  Loader2, 
  BarChart3, 
  Settings, 
  Users, 
  Umbrella, 
  CalendarDays, 
  DollarSign,
  ArrowRight,
  ArrowUpRight
} from "lucide-react";
import { useAdminDashboard } from "@/components/admin/useAdminDashboard";
import { BeachesTab } from "@/components/admin/BeachesTab";
import { UserManagementTab } from "@/components/admin/UserManagementTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminReservationsTable } from "@/components/admin/AdminReservationsTable";

export default function AdminDashboard() {
  const { userSession } = useAuth();
  const { role } = userSession;
  const navigate = useNavigate();
  const [setsCounts, setSetsCounts] = useState<{[key: string]: number}>({});
  const [revenueData, setRevenueData] = useState<{total: number, monthly: number}>({ total: 0, monthly: 0 });
  const [reservationCounts, setReservationCounts] = useState<{total: number, active: number}>({ total: 0, active: 0 });
  
  const { 
    loading, 
    beaches,
    activeTab,
    setActiveTab,
    fetchAllBeaches,
    handleBeachCreated
  } = useAdminDashboard();
  
  // Fetch recent reservations for the dashboard
  const { data: recentReservations = [], isLoading: loadingReservations } = useQuery({
    queryKey: ['recentReservations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          reservation_date,
          payment_amount,
          status,
          checked_in,
          created_at,
          guest_name,
          beach:beach_id (id, name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw new Error(error.message);
      
      return data.map(res => ({
        ...res,
        beach_name: res.beach?.name || 'Unknown Beach'
      }));
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  
  // Load sets counts for each beach
  useEffect(() => {
    const fetchSetsCounts = async () => {
      if (beaches.length === 0) return;
      
      const counts: {[key: string]: number} = {};
      
      for (const beach of beaches) {
        // Fetch count of sets for each beach
        const { count, error } = await supabase
          .from('sets')
          .select('*', { count: 'exact', head: true })
          .eq('beach_id', beach.id);
          
        if (!error && count !== null) {
          counts[beach.id] = count;
        }
      }
      
      setSetsCounts(counts);
    };
    
    fetchSetsCounts();
  }, [beaches]);
  
  // Fetch revenue and reservation statistics
  useEffect(() => {
    const fetchStats = async () => {
      // Get current month boundaries
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      
      // Get all reservations for revenue calculation
      const { data: allReservations, error: reservationsError } = await supabase
        .from('reservations')
        .select('payment_amount, status, reservation_date');
        
      if (reservationsError) {
        console.error('Error fetching reservations:', reservationsError);
        return;
      }
      
      if (allReservations) {
        // Calculate total revenue from all confirmed/completed reservations
        const totalRevenue = allReservations
          .filter(r => ['confirmed', 'completed'].includes(r.status || ''))
          .reduce((sum, r) => sum + (Number(r.payment_amount) || 0), 0);
          
        // Calculate monthly revenue
        const monthlyRevenue = allReservations
          .filter(r => 
            ['confirmed', 'completed'].includes(r.status || '') && 
            new Date(r.reservation_date) >= new Date(startOfMonth)
          )
          .reduce((sum, r) => sum + (Number(r.payment_amount) || 0), 0);
          
        setRevenueData({ 
          total: totalRevenue,
          monthly: monthlyRevenue
        });
        
        // Get reservation counts
        const totalCount = allReservations.length;
        const activeCount = allReservations.filter(r => 
          ['confirmed', 'pending'].includes(r.status || '') && 
          new Date(r.reservation_date) >= new Date()
        ).length;
        
        setReservationCounts({
          total: totalCount,
          active: activeCount
        });
      }
    };
    
    fetchStats();
  }, []);
  
  // Redirect non-admin users
  if (role !== 'admin') {
    navigate('/');
    return null;
  }

  // Get total sets count from our loaded counts
  const totalSets = Object.values(setsCounts).reduce((sum, count) => sum + count, 0);

  // Quick stats for dashboard
  const stats = [
    { 
      title: "Total Revenue", 
      value: `$${revenueData.total.toFixed(2)}`, 
      icon: <DollarSign className="h-4 w-4 text-green-500" />,
      description: `$${revenueData.monthly.toFixed(2)} this month`
    },
    { 
      title: "Total Beaches", 
      value: beaches.length, 
      icon: <Umbrella className="h-4 w-4 text-blue-500" />,
      description: `${totalSets} total sets`
    },
    { 
      title: "Reservations", 
      value: reservationCounts.total, 
      icon: <CalendarDays className="h-4 w-4 text-orange-500" />,
      description: `${reservationCounts.active} active reservations`
    },
    { 
      title: "Settings", 
      value: "Configure", 
      link: () => navigate("/settings"), 
      icon: <Settings className="h-4 w-4 text-violet-500" />,
      description: "Beach & user settings"
    },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of system performance and metrics</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              {stat.link ? (
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-2xl font-bold"
                  onClick={stat.link}
                >
                  {stat.value}
                </Button>
              ) : (
                <p className="text-2xl font-bold">{stat.value}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Recent Reservations Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Reservations</CardTitle>
            <CardDescription>Latest activity across all beaches</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setActiveTab("users")}>
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {loadingReservations ? (
            <div className="flex justify-center p-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <AdminReservationsTable reservations={recentReservations} isLoading={false} />
          )}
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => navigate("/settings/admin/create-reservation")}>
            Create On-Site Booking <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="beaches" className="flex gap-2 items-center">
            <Umbrella className="h-4 w-4" />
            <span>Beaches</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex gap-2 items-center">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="beaches">
          <Card>
            <CardContent className="p-6">
              {loading && beaches.length === 0 ? (
                <div className="flex justify-center p-10">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : (
                <BeachesTab 
                  beaches={beaches} 
                  onBeachCreated={handleBeachCreated} 
                  onUpdate={fetchAllBeaches} 
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardContent className="p-6">
              <UserManagementTab />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
