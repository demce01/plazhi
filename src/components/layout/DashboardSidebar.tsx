
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Umbrella,
  CalendarDays,
  Settings,
  LogOut,
  PlusCircle,
  Shield,
  Users,
  DollarSign,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";

const MenuItem = ({ 
  to, 
  icon: Icon, 
  children,
  className 
}: { 
  to: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
  className?: string;
}) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900",
      "hover:bg-gray-100",
      className
    )}
  >
    <Icon className="h-4 w-4" />
    <span>{children}</span>
  </Link>
);

export function DashboardSidebar() {
  const navigate = useNavigate();
  const { userSession, signOut } = useAuth();
  const role = userSession?.role;

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth/login");
  };

  console.log("Current user role:", role);

  return (
    <div className="flex h-full flex-col border-r bg-background">
      <div className="p-6">
        <h2 className="text-2xl font-bold tracking-tight">BeachEase</h2>
      </div>

      <div className="flex-1 space-y-1 p-4">
        <MenuItem to="/dashboard" icon={LayoutDashboard}>
          Dashboard
        </MenuItem>
        
        <MenuItem to="/user/reservations" icon={CalendarDays}>
          Reservations
        </MenuItem>

        {/* Settings section with configuration options */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="px-3 text-sm font-medium text-gray-500 mb-2">Configuration</h3>
          
          <MenuItem to="/settings" icon={Settings}>
            Settings
          </MenuItem>

          {role === 'admin' && (
            <>
              <MenuItem 
                to="/admin/beaches" 
                icon={Umbrella}
                className="ml-6 text-sm"
              >
                Beach Management
              </MenuItem>
              
              <MenuItem 
                to="/admin" 
                icon={Shield}
                className="ml-6 text-sm"
              >
                Admin Dashboard
              </MenuItem>

              <MenuItem 
                to="/admin/content" 
                icon={FileText}
                className="ml-6 text-sm"
              >
                Content Management
              </MenuItem>
            </>
          )}

          {(role === 'admin' || role === 'employee') && (
            <MenuItem to="/settings/admin/create-reservation" icon={PlusCircle}>
              Create On-Site Booking
            </MenuItem>
          )}
        </div>
      </div>

      <div className="border-t p-4">
        <Button
          variant="outline"
          className="w-full justify-start gap-3"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
