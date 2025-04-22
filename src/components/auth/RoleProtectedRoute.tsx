
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/types";
import { LoadingScreen } from "@/components/LoadingScreen";

interface RoleProtectedRouteProps {
  children: ReactNode;
  roles: UserRole[];
}

export function RoleProtectedRoute({ children, roles }: RoleProtectedRouteProps) {
  const { userSession } = useAuth();
  const { user, role, loading } = userSession;
  const location = useLocation();

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
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
    }
    return <Navigate to="/" replace />;
  }

  // If authenticated and has the required role, render the children
  return <>{children}</>;
}
