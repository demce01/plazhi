
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { ManagerManagement } from "@/components/managers/ManagerManagement";
import { BeachesTab } from "@/components/admin/BeachesTab";
import { ManagersTab } from "@/components/admin/ManagersTab";
import { useAdminDashboard } from "@/components/admin/useAdminDashboard";

export default function AdminDashboard() {
  const { userSession } = useAuth();
  const { role } = userSession;
  const navigate = useNavigate();
  
  const { 
    loading, 
    beaches, 
    managers, 
    activeTab, 
    setActiveTab,
    fetchAllBeaches,
    fetchAllManagers,
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

      {loading && beaches.length === 0 && managers.length === 0 ? (
        <div className="flex justify-center p-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="beaches">All Beaches</TabsTrigger>
            <TabsTrigger value="managers">Managers</TabsTrigger>
            <TabsTrigger value="manager-management">Manager Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="beaches" className="mt-6">
            <BeachesTab 
              beaches={beaches} 
              onBeachCreated={handleBeachCreated}
              onUpdate={fetchAllBeaches}
            />
          </TabsContent>
          
          <TabsContent value="managers" className="mt-6">
            <ManagersTab managers={managers} beaches={beaches} />
          </TabsContent>
          
          <TabsContent value="manager-management" className="mt-6">
            <ManagerManagement 
              managers={managers}
              beaches={beaches}
              onUpdate={() => {
                fetchAllManagers();
                fetchAllBeaches();
              }}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
