
import { useState, ReactNode } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";
import { UserManagementTab } from "@/components/admin/UserManagementTab";

interface DashboardLayoutProps {
  children?: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  
  // Determine if we're on the admin users page
  const isAdminUsers = location.pathname === "/admin/users" || location.pathname === "/admin";

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-20 h-full w-64 transform transition-transform duration-200 ease-in-out bg-white border-r",
          !isSidebarOpen && "-translate-x-full"
        )}
      >
        <DashboardSidebar />
      </div>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 transition-all duration-200 ease-in-out",
          isSidebarOpen ? "ml-64" : "ml-0"
        )}
      >
        <div className="sticky top-0 z-10 bg-white border-b p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )}
            </Button>
            <h1 className="text-xl font-semibold text-center">BeachEase CMS</h1>
            <div className="w-10"></div> {/* Spacer for alignment */}
          </div>
        </div>
        <div className="p-6 max-w-7xl mx-auto">
          {isAdminUsers ? (
            <UserManagementTab />
          ) : (
            children || <Outlet />
          )}
        </div>
      </div>
    </div>
  );
}
