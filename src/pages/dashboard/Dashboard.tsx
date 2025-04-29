
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import DashboardOverview from "./Overview";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { userSession } = useAuth();
  const { user, role, loading } = userSession;
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth/login");
    } else if (!loading && role === "admin") {
      // Admin users should go to the simplified dashboard
      navigate("/admin/dashboard");
    } else if (!loading && role === "employee") {
      // Employee users should go to the simplified dashboard
      navigate("/admin/dashboard");
    } else if (!loading && role === "client") {
      // Regular users should see their reservations
      navigate("/user/reservations");
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
  
  // Since we're redirecting, this should rarely render
  return (
    <div className="flex items-center justify-center h-screen w-full bg-background">
      <div className="flex flex-col items-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h2 className="mt-4 text-xl font-semibold">Loading...</h2>
      </div>
    </div>
  );
}
