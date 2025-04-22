
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
    <>
      {menuItems.map((item, index) => (
        <MenuItem 
          key={`${item.label}-${index}`}
          to={item.to} 
          icon={item.icon}
          className={item.className}
          index={index}
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
