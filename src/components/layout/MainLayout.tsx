
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { DashboardSidebar } from "./DashboardSidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { userSession } = useAuth();
  const { user } = userSession;
  const location = useLocation();
  
  // Check if we're on the homepage
  const isHomePage = location.pathname === "/";
  
  // Only show sidebar if user is logged in AND we're not on the homepage
  const showSidebar = user && !isHomePage;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar - only show if user is logged in and not on homepage */}
      {showSidebar && (
        <div
          className={cn(
            "fixed left-0 top-0 z-20 h-full w-64 transform transition-transform duration-200 ease-in-out bg-white border-r",
            !isSidebarOpen && "-translate-x-full"
          )}
        >
          <DashboardSidebar />
        </div>
      )}

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-200 ease-in-out",
          showSidebar && isSidebarOpen ? "ml-64" : "ml-0"
        )}
      >
        <Header 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          isSidebarOpen={isSidebarOpen}
          showSidebarToggle={showSidebar}
        />
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
