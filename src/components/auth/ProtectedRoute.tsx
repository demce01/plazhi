
import { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

interface ProtectedRouteProps {
  children?: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { userSession } = useAuth();
  const { user, loading } = userSession;
  const location = useLocation();

  console.log('[ProtectedRoute] Location:', location.pathname, 'State:', location.state);
  console.log('[ProtectedRoute] Auth State: loading=', loading, 'user=', !!user);

  if (!user && !loading) {
    console.log('[ProtectedRoute] Redirecting to /auth/login (user is null and not loading)');
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  console.log('[ProtectedRoute] Rendering children');
  return children ? <>{children}</> : <Outlet />;
}
