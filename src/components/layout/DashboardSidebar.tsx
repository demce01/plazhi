
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { LayoutDashboard, CalendarDays, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenuItem } from "./sidebar/MenuItem";
import { ConfigurationMenu } from "./sidebar/ConfigurationMenu";
import { AdminMenu } from "./sidebar/AdminMenu";

export function DashboardSidebar() {
  const navigate = useNavigate();
  const { userSession, signOut } = useAuth();
  const role = userSession?.role;
  const isAdmin = role === 'admin';
  const isEmployee = role === 'employee';

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

        {(isAdmin || isEmployee) && (
          <>
            <MenuItem to="/admin/reservations" icon={CalendarDays}>
              Reservation Management
            </MenuItem>
            <AdminMenu />
          </>
        )}

        {!isAdmin && !isEmployee && (
          <ConfigurationMenu role={role} />
        )}
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
