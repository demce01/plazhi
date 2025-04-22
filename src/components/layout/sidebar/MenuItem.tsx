
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MenuItemProps {
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}

export function MenuItem({ to, icon: Icon, children, className }: MenuItemProps) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900",
        "hover:bg-gray-100",
        className
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </Link>
  );
}
