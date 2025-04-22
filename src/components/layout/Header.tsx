
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function Header() {
  const { userSession, signOut } = useAuth();
  const { user, role } = userSession;

  // Determine navigation links based on user role
  const getNavLinks = () => {
    const links = [];
    
    // Non-admin users see beaches
    if (role !== 'admin') {
      links.push(
        <Link key="beaches" to="/beaches" className="text-gray-500 hover:text-gray-900 font-medium">
          Beaches
        </Link>
      );
    }
    
    // All authenticated users can see their reservations
    if (user) {
      if (role === 'client') {
        links.push(
          <Link key="reservations" to="/reservations" className="text-gray-500 hover:text-gray-900 font-medium">
            My Reservations
          </Link>
        );
      }
      
      if (role === 'admin') {
        links.push(
          <Link key="dashboard" to="/dashboard" className="text-gray-500 hover:text-gray-900 font-medium">
            Admin Dashboard
          </Link>
        );
      }
    }
    
    return links;
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary">
              BeachEase
            </Link>
          </div>
          <nav className="hidden md:flex space-x-10">
            {getNavLinks()}
          </nav>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {user.email} {role && `(${role})`}
                </span>
                <Button variant="outline" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-x-2 md:space-x-4 flex items-center">
                <Link 
                  to="/find-reservation" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Find Reservation
                </Link>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/auth/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/auth/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
