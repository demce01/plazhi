
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { UserManagementTab } from "@/components/admin/UserManagementTab";

export default function AdminDashboard() {
  const { userSession } = useAuth();
  const { role, loading, user } = userSession;
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || role !== "admin")) {
      navigate("/auth/login");
    }
  }, [user, role, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-background">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h2 className="mt-4 text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-background">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h2 className="mt-4 text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">View, create and manage user accounts and roles. "Employee" is for users that manage on-site bookings and payments.</p>
        </div>
        <UserManagementTab />
      </div>
    </DashboardLayout>
  );
}
