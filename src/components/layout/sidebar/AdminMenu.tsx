
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Umbrella, 
  Calendar,
  BookOpen
} from "lucide-react";
import { MenuItem } from "./MenuItem";

export function AdminMenu() {
  return (
    <>
      <div className="mb-2 px-2 text-xs text-muted-foreground">
        Admin
      </div>

      <MenuItem to="/admin/dashboard" icon={LayoutDashboard}>
        Reservations Dashboard
      </MenuItem>
      
      <MenuItem to="/admin/users" icon={Users}>
        User Management
      </MenuItem>

      <MenuItem to="/admin/beaches" icon={Umbrella}>
        Beaches Management
      </MenuItem>

      <MenuItem to="/admin/reservations" icon={Calendar}>
        Reservations
      </MenuItem>

      <MenuItem to="/admin/content" icon={FileText}>
        Content Management
      </MenuItem>
    </>
  );
}
