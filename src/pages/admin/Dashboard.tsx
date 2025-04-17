
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Loader2 } from "lucide-react";
import { useAdminDashboard } from "@/components/admin/useAdminDashboard";

export default function AdminDashboard() {
  const { userSession } = useAuth();
  const { role } = userSession;
  const navigate = useNavigate();
  
  const { 
    loading, 
    beaches,
    fetchAllBeaches,
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

      {loading && beaches.length === 0 ? (
        <div className="flex justify-center p-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4">
          {/* Beach management content will be added here */}
        </div>
      )}
    </div>
  );
}
