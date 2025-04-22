
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { LoadingScreen } from "@/components/LoadingScreen";
import DashboardOverview from "./Overview";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function Dashboard() {
  const { userSession } = useAuth();
  const { user, role, loading } = userSession;
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth/login");
    } else if (!loading && role === "admin") {
      // Admin users already see the dashboard here
      console.log("Admin user on dashboard");
    } else if (!loading && role === "client") {
      // Regular users should see their reservations
      navigate("/user/reservations");
    }
  }, [user, role, loading, navigate]);

  if (loading) {
    return <LoadingScreen />;
  }
  
  // This is for admin users
  if (role === "admin") {
    return (
      <DashboardLayout>
        <DashboardOverview />
      </DashboardLayout>
    );
  }
  
  return <LoadingScreen />;
}
