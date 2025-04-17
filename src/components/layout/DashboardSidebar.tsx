
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Umbrella,
  CalendarDays,
  Settings,
  LogOut,
  CalendarCheck,
  CalendarX,
  Clock,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const MenuItem = ({ 
  to, 
  icon: Icon, 
  children 
}: { 
  to: string; 
  icon: React.ElementType; 
  children: React.ReactNode; 
}) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
      "hover:bg-gray-100 dark:hover:bg-gray-800"
    )}
  >
    <Icon className="h-4 w-4" />
    <span>{children}</span>
  </Link>
);

const SubMenuItem = ({ 
  to, 
  icon: Icon, 
  children 
}: { 
  to: string; 
  icon: React.ElementType; 
  children: React.ReactNode; 
}) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 ml-6 text-sm text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
      "hover:bg-gray-100 dark:hover:bg-gray-800"
    )}
  >
    <Icon className="h-3.5 w-3.5" />
    <span>{children}</span>
  </Link>
);

export function DashboardSidebar() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth/login");
  };

  return (
    <div className="flex h-full flex-col border-r bg-background">
      <div className="p-6">
        <h2 className="text-2xl font-bold tracking-tight">BeachEase</h2>
      </div>

      <div className="flex-1 space-y-1 p-4">
        <MenuItem to="/dashboard" icon={LayoutDashboard}>
          Dashboard
        </MenuItem>
        
        <MenuItem to="/beaches" icon={Umbrella}>
          Beaches
        </MenuItem>
        
        {/* Expanded Reservations Section */}
        <div className="py-2">
          <MenuItem to="/reservations" icon={CalendarDays}>
            Reservations
          </MenuItem>
          <SubMenuItem to="/reservations?status=confirmed" icon={CalendarCheck}>
            Confirmed
          </SubMenuItem>
          <SubMenuItem to="/reservations?status=pending" icon={Clock}>
            Pending
          </SubMenuItem>
          <SubMenuItem to="/reservations?status=cancelled" icon={CalendarX}>
            Cancelled
          </SubMenuItem>
          <SubMenuItem to="/reservations?checkin=pending" icon={UserCheck}>
            Check-ins
          </SubMenuItem>
        </div>

        <MenuItem to="/settings" icon={Settings}>
          Settings
        </MenuItem>
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
