
import { Settings, CalendarDays, PlusCircle } from "lucide-react";
import { MenuItem } from "./MenuItem";
import { AdminMenu } from "./AdminMenu";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ConfigurationMenuProps {
  role?: string;
}

interface ConfigMenuItem {
  to: string;
  icon: React.ElementType;
  label: string;
}

// Add these to the window object for cross-menu communication
declare global {
  interface Window {
    __draggedConfigItem: any;
    __draggedConfigIndex: number | null;
    __removeFromConfigMenu?: (index: number) => void;
  }
}

export function ConfigurationMenu({ role }: ConfigurationMenuProps) {
  const { toast } = useToast();
  const initialMenuItems: ConfigMenuItem[] = [
    {
      to: "/settings",
      icon: Settings,
      label: "Settings"
    },
    {
      to: "/user/reservations",
      icon: CalendarDays,
      label: "My Reservations"
    }
  ];

  const [menuItems, setMenuItems] = useState<ConfigMenuItem[]>(initialMenuItems);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // Expose removeItem function to window for cross-menu communication
  window.__removeFromConfigMenu = (index: number) => {
    setMenuItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
    // Store the dragged item for cross-menu transfer
    window.__draggedConfigItem = menuItems[index];
    window.__draggedConfigIndex = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number, sourceMenu?: string) => {
    if (draggedItemIndex === null && !sourceMenu) return;
    
    if (sourceMenu === 'admin') {
      // Handle item coming from admin menu
      const draggedItem = window.__draggedConfigItem;
      if (draggedItem) {
        const items = [...menuItems];
        items.splice(targetIndex, 0, draggedItem);
        setMenuItems(items);
        
        toast({
          title: "Menu Item Moved",
          description: "The item has been moved to Configuration Menu.",
        });
      }
    } else {
      // Handle internal reordering
      const items = [...menuItems];
      const [draggedItem] = items.splice(draggedItemIndex!, 1);
      items.splice(targetIndex, 0, draggedItem);
      setMenuItems(items);
      
      toast({
        title: "Menu Order Updated",
        description: "The menu items have been reordered.",
      });
    }
    
    setDraggedItemIndex(null);
    window.__draggedConfigItem = null;
    window.__draggedConfigIndex = null;
  };

  return (
    <div className="mt-6 pt-6 border-t">
      <h3 className="px-3 text-sm font-medium text-gray-500 mb-2">Configuration</h3>
      
      {menuItems.map((item, index) => (
        <MenuItem 
          key={`${item.label}-${index}`}
          to={item.to} 
          icon={item.icon}
          index={index}
          menuType="config"
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {item.label}
        </MenuItem>
      ))}

      {role === 'admin' && <AdminMenu />}

      {(role === 'admin' || role === 'employee') && (
        <MenuItem to="/settings/admin/create-reservation" icon={PlusCircle}>
          Create On-Site Booking
        </MenuItem>
      )}
    </div>
  );
}
