
import { Shield, Umbrella, FileText, CalendarDays } from "lucide-react";
import { MenuItem } from "./MenuItem";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Define the menu item structure
interface AdminMenuItem {
  to: string;
  icon: React.ElementType;
  label: string;
  className?: string;
}

export function AdminMenu() {
  const { toast } = useToast();
  // Initial menu items
  const initialMenuItems: AdminMenuItem[] = [
    {
      to: "/admin/beaches",
      icon: Umbrella,
      label: "Beach Management",
      className: "ml-6 text-sm"
    },
    {
      to: "/admin",
      icon: Shield,
      label: "Admin Dashboard",
      className: "ml-6 text-sm"
    },
    {
      to: "/admin/content",
      icon: FileText,
      label: "Content Management",
      className: "ml-6 text-sm"
    },
    {
      to: "/admin/reservations",
      icon: CalendarDays,
      label: "Reservation Management",
      className: "ml-6 text-sm"
    }
  ];

  const [menuItems, setMenuItems] = useState<AdminMenuItem[]>(initialMenuItems);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number, sourceMenu?: string) => {
    if (draggedItemIndex === null && !sourceMenu) return;
    
    if (sourceMenu === 'config') {
      // Handle item coming from config menu
      const draggedItem = window.__draggedConfigItem;
      if (draggedItem) {
        const items = [...menuItems];
        items.splice(targetIndex, 0, draggedItem);
        setMenuItems(items);
        
        // Notify config menu to remove the item
        window.__removeFromConfigMenu?.(window.__draggedConfigIndex);
        
        toast({
          title: "Menu Item Moved",
          description: "The item has been moved to Admin Menu.",
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
    <>
      {menuItems.map((item, index) => (
        <MenuItem 
          key={`${item.label}-${index}`}
          to={item.to} 
          icon={item.icon}
          className={item.className}
          index={index}
          menuType="admin"
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {item.label}
        </MenuItem>
      ))}
    </>
  );
}
