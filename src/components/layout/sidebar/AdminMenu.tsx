
import { UserRound, Users, Palmtree, FileText, CalendarCheck, Plus } from "lucide-react";
import { MenuItem } from "./MenuItem";
import { useAuth } from "@/contexts/auth";

export function AdminMenu() {
  const { userSession } = useAuth();
  const { role } = userSession;

  const isEmployee = role === 'employee';
  const isAdmin = role === 'admin';

  return (
    <div className="space-y-1">
      {isAdmin && (
        <>
          <MenuItem to="/admin/users" icon={Users}>
            Users Management
          </MenuItem>
          <MenuItem to="/admin/beaches" icon={Palmtree}>
            Beaches Management
          </MenuItem>
          <MenuItem to="/admin/content" icon={FileText}>
            Content Management
          </MenuItem>
        </>
      )}
      
      {(isAdmin || isEmployee) && (
        <>
          <MenuItem to="/admin/reservations" icon={CalendarCheck}>
            Reservations
          </MenuItem>
          <MenuItem to="/admin/create-reservation" icon={Plus}>
            Create On-Site Reservation
          </MenuItem>
        </>
      )}
      
      <MenuItem to="/user/profile" icon={UserRound}>
        My Profile
      </MenuItem>
    </div>
  );
}
