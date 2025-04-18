import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Loader2 } from "lucide-react";
import { useAdminDashboard } from "@/components/admin/useAdminDashboard";
import { BeachesTab } from "@/components/admin/BeachesTab";
import { UserManagementTab } from "@/components/admin/UserManagementTab";
import { ReservationManagementTab } from "@/components/admin/ReservationManagementTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="beaches">Beaches</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="beaches">
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
        </TabsContent>

        <TabsContent value="users">
          <UserManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
