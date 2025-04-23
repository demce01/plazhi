
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/types";
import { Loader2 } from "lucide-react";

interface RoleProtectedRouteProps {
  children: ReactNode;
  roles: UserRole[];
}

export function RoleProtectedRoute({ children, roles }: RoleProtectedRouteProps) {
  const { userSession } = useAuth();
  const { user, role, loading } = userSession;
  const location = useLocation();

  console.log("[RoleProtectedRoute] Checking role:", role, "against allowed roles:", roles);
  console.log("[RoleProtectedRoute] Loading:", loading);

  // Show loading spinner while checking authentication
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

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If authenticated but not having the required role, redirect to appropriate page
  if (role && !roles.includes(role)) {
    if (role === 'client') {
      return <Navigate to="/" replace />;
    } else if (role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (role === 'employee') {
      return <Navigate to="/admin/reservations" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // If authenticated and has the required role, render the children
  return <>{children}</>;
}
