import { Settings, CalendarDays, PlusCircle } from "lucide-react";
import { MenuItem } from "./MenuItem";
import { AdminMenu } from "./AdminMenu";

interface ConfigurationMenuProps {
  role?: string;
}

export function ConfigurationMenu({ role }: ConfigurationMenuProps) {
  return (
    <div className="mt-6 pt-6 border-t">
      <h3 className="px-3 text-sm font-medium text-gray-500 mb-2">Configuration</h3>
      
      <MenuItem to="/settings" icon={Settings}>
        Settings
      </MenuItem>

      <MenuItem to="/user/reservations" icon={CalendarDays}>
        My Reservations
      </MenuItem>

      {role === 'admin' && <AdminMenu />}

      {(role === 'admin' || role === 'employee') && (
        <MenuItem to="/settings/admin/create-reservation" icon={PlusCircle}>
          Create On-Site Booking
        </MenuItem>
      )}
    </div>
  );
}
