
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { userSession } = useAuth();
  const { user, role, loading } = userSession;
  const location = useLocation();
  const justReserved = location.state?.justReserved;

  console.log('[ProtectedRoute] Location:', location.pathname, 'State:', location.state);
  console.log('[ProtectedRoute] Auth State: loading=', loading, 'user=', !!user, 'role=', role, 'justReserved=', justReserved);

  // Removed the loading state check and loading screen
  if (!user && !loading) {
    console.log('[ProtectedRoute] Redirecting to /auth/login (user is null and not loading)');
    const { justReserved: _, ...stateWithoutFlag } = location.state || {};
    return <Navigate to="/auth/login" state={{ ...stateWithoutFlag, from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    console.log('[ProtectedRoute] Redirecting due to role mismatch');
    const { justReserved: _, ...stateWithoutFlag } = location.state || {};
    if (role === 'client') {
      return <Navigate to="/reservations" state={stateWithoutFlag} replace />;
    } else if (role === 'admin') {
      return <Navigate to="/admin" state={stateWithoutFlag} replace />;
    } else if (role === 'employee') {
      return <Navigate to="/admin/reservations" state={stateWithoutFlag} replace />;
    }
    return <Navigate to="/" state={stateWithoutFlag} replace />;
  }

  console.log('[ProtectedRoute] Rendering children');
  return <>{children}</>;
}
