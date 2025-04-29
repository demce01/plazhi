
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export function Header({ toggleSidebar, isSidebarOpen }: HeaderProps) {
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
      
      if (role === 'admin' || role === 'employee') {
        links.push(
          <Link key="dashboard" to={role === 'admin' ? "/dashboard" : "/admin/reservations"} className="text-gray-500 hover:text-gray-900 font-medium">
            {role === 'admin' ? 'Admin Dashboard' : 'Management'}
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
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              className="mr-4"
              onClick={toggleSidebar}
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )}
            </Button>
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
                <div className="text-right mr-2 hidden md:block">
                  <p className="text-sm font-medium">{user.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{role}</p>
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {user.email ? user.email.substring(0, 2).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
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
