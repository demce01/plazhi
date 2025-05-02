import { Button } from "@/components/ui/button";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  showSidebarToggle?: boolean;
}

export function Header({ toggleSidebar, isSidebarOpen, showSidebarToggle = true }: HeaderProps) {
  return (
    <header className="bg-white shadow py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          {showSidebarToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="mr-4"
            >
              {isSidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
            </Button>
          )}
          <h1 className="text-xl font-semibold">BeachEase</h1>
        </div>
        <nav>
          <ul className="flex space-x-4">
            {/* Navigation links can go here */}
          </ul>
        </nav>
      </div>
    </header>
  );
}
