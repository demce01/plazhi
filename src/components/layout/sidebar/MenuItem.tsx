
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MoveVertical } from "lucide-react";
import { useState } from "react";

interface MenuItemProps {
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
  index?: number;
  onDragStart?: (index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDrop?: (index: number) => void;
}

export function MenuItem({ 
  to, 
  icon: Icon, 
  children, 
  className,
  index,
  onDragStart,
  onDragOver,
  onDrop
}: MenuItemProps) {
  const [isDraggable, setIsDraggable] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", index?.toString() || "");
    onDragStart?.(index || 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (index !== undefined) {
      onDragOver?.(e, index);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (index !== undefined) {
      onDrop?.(index);
    }
  };

  return (
    <div className="relative flex items-center">
      {isDraggable && (
        <button 
          className="absolute -left-6 p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          onMouseDown={(e) => e.preventDefault()}
        >
          <MoveVertical className="h-4 w-4" />
        </button>
      )}
      <Link
        to={to}
        draggable={isDraggable}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900",
          "hover:bg-gray-100",
          isDragging && "opacity-50",
          className
        )}
      >
        <Icon className="h-4 w-4" />
        <span>{children}</span>
      </Link>
      {isDraggable && (
        <button 
          className="absolute right-2"
          onClick={() => setIsDraggable(false)}
        >
          <span className="sr-only">Disable drag</span>
        </button>
      )}
      {!isDraggable && (
        <button 
          className="absolute right-2 text-gray-400 hover:text-gray-600"
          onClick={() => setIsDraggable(true)}
        >
          <MoveVertical className="h-4 w-4" />
          <span className="sr-only">Enable drag</span>
        </button>
      )}
    </div>
  );
}
