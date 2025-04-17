
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Loader2 } from "lucide-react";
import { useAdminDashboard } from "@/components/admin/useAdminDashboard";
import { BeachesTab } from "@/components/admin/BeachesTab";
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
        <TabsList>
          <TabsTrigger value="beaches">Beaches</TabsTrigger>
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
      </Tabs>
    </div>
  );
}
