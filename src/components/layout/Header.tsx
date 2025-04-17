
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function Header() {
  const { userSession, signOut } = useAuth();
  const { user, role } = userSession;

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
            <Link to="/beaches" className="text-gray-500 hover:text-gray-900 font-medium">
              Beaches
            </Link>
            {user && (
              <Link to="/reservations" className="text-gray-500 hover:text-gray-900 font-medium">
                My Reservations
              </Link>
            )}
            {role === 'manager' && (
              <Link to="/manager" className="text-gray-500 hover:text-gray-900 font-medium">
                Manager Dashboard
              </Link>
            )}
            {role === 'admin' && (
              <Link to="/admin" className="text-gray-500 hover:text-gray-900 font-medium">
                Admin Dashboard
              </Link>
            )}
          </nav>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {user.email}
                </span>
                <Button variant="outline" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-x-4">
                <Button variant="outline" asChild>
                  <Link to="/auth/login">Sign In</Link>
                </Button>
                <Button asChild>
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
