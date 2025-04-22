
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

  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedItemIndex === null) return;
    
    // Make a copy of the current menu items
    const items = [...menuItems];
    
    // Remove the dragged item from its original position
    const [draggedItem] = items.splice(draggedItemIndex, 1);
    
    // Insert the dragged item at the new position
    items.splice(targetIndex, 0, draggedItem);
    
    // Update the state with the new order
    setMenuItems(items);
    setDraggedItemIndex(null);
    
    toast({
      title: "Menu Order Updated",
      description: "The menu items have been reordered.",
    });
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
