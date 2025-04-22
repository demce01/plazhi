
import { Shield, Umbrella, FileText, CalendarDays } from "lucide-react";
import { MenuItem } from "./MenuItem";

export function AdminMenu() {
  return (
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
      
      <MenuItem 
        to="/admin/reservations" 
        icon={CalendarDays}
        className="ml-6 text-sm"
      >
        Reservation Management
      </MenuItem>
    </>
  );
}
