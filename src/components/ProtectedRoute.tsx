
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/types";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { userSession, loading } = useAuth();
  const { user, role } = userSession;
  const location = useLocation();

  // Show loading state while authentication is being checked
  if (loading || userSession.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading authentication...</span>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check for role-based access if allowedRoles is provided
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    console.log(`User has role ${role}, but needs one of: ${allowedRoles.join(', ')}`);
    
    // Redirect unauthorized users to appropriate pages based on their role
    if (role === 'client') {
      return <Navigate to="/reservations" replace />;
    } else if (role === 'manager') {
      return <Navigate to="/manager" replace />;
    } else if (role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    
    // Fallback to home page if role doesn't match any specific redirect
    return <Navigate to="/" replace />;
  }

  // User is authenticated and authorized
  return <>{children}</>;
}
