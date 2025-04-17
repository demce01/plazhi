
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import BeachesList from "./pages/beaches/BeachesList";
import BeachDetail from "./pages/beaches/BeachDetail";
import ManagerDashboard from "./pages/manager/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import ReservationDetail from "./pages/reservations/ReservationDetail";
import MyReservations from "./pages/reservations/MyReservations";

// Layouts
import { MainLayout } from "./components/layout/MainLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/beaches" element={<BeachesList />} />
              <Route path="/beaches/:id" element={<BeachDetail />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/reservations" element={<MyReservations />} />
              <Route path="/reservations/:id" element={<ReservationDetail />} />
              <Route path="/manager" element={
                <ProtectedRoute allowedRoles={["manager", "admin"]}>
                  <ManagerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
