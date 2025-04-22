
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Loader2, BarChart3, Settings, Users, Umbrella } from "lucide-react";
import { useAdminDashboard } from "@/components/admin/useAdminDashboard";
import { BeachesTab } from "@/components/admin/BeachesTab";
import { UserManagementTab } from "@/components/admin/UserManagementTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";

export default function AdminDashboard() {
  const { userSession } = useAuth();
  const { role } = userSession;
  const navigate = useNavigate();
  
  const { 
    loading, 
    beaches,
    activeTab,
    setActiveTab,
    fetchAllBeaches,
    handleBeachCreated
  } = useAdminDashboard();
  
  // Redirect non-admin users
  if (role !== 'admin') {
    navigate('/');
    return null;
  }

  // Quick stats for dashboard
  const stats = [
    { title: "Total Beaches", value: beaches.length, icon: <Umbrella className="h-4 w-4 text-primary" /> },
    { title: "Active Sets", value: beaches.reduce((acc, beach) => acc + (beach.sets_count || 0), 0), icon: <Umbrella className="h-4 w-4 text-green-500" /> },
    { title: "Users", value: "View", link: () => setActiveTab("users"), icon: <Users className="h-4 w-4 text-blue-500" /> },
    { title: "Settings", value: "System", link: () => navigate("/settings"), icon: <Settings className="h-4 w-4 text-orange-500" /> },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage beaches, users, and system settings</p>
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
            </CardContent>
          </Card>
        ))}
      </div>

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

      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#" isActive>Current Actions</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="/settings/admin/create-reservation">Create On-Site Booking</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="/settings">System Settings</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
