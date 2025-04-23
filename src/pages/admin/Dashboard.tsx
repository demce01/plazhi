
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

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
    return null; // Admin check is already handled by route protection
  }

  // The UserManagementTab will be rendered by the DashboardLayout
  return <DashboardLayout />;
}
