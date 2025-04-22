
import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Loader2 } from "lucide-react";

// Create a simple loading component to replace LoadingScreen
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen w-full bg-background">
    <div className="flex flex-col items-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <h2 className="mt-4 text-xl font-semibold">Loading...</h2>
    </div>
  </div>
);

// Lazy-loaded pages
const Index = lazy(() => import("@/pages/Index"));
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"));
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const BeachesManagement = lazy(() => import("@/pages/admin/BeachesManagement"));
const ContentManagement = lazy(() => import("@/pages/admin/ContentManagement"));
const BeachList = lazy(() => import("@/pages/beaches/BeachList"));
const BeachReservation = lazy(() => import("@/pages/beaches/BeachReservation"));
const ReservationSuccess = lazy(() => import("@/pages/beaches/ReservationSuccess"));
const UserReservations = lazy(() => import("@/pages/user/UserReservations"));
const UserProfile = lazy(() => import("@/pages/user/UserProfile"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const ReservationManagementTab = lazy(() => import("@/pages/admin/ReservationManagementTab"));

// Create a client
const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Index />
          </Suspense>
        ),
      },
      {
        path: "dashboard",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "beaches",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <BeachList />
          </Suspense>
        ),
      },
      {
        path: "beaches/:beachId/reserve",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <BeachReservation />
          </Suspense>
        ),
      },
      {
        path: "reservation-success",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ReservationSuccess />
          </Suspense>
        ),
      },
      {
        path: "user",
        element: <ProtectedRoute />,
        children: [
          {
            path: "reservations",
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <UserReservations />
              </Suspense>
            ),
          },
          {
            path: "profile",
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <UserProfile />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: "register",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Register />
          </Suspense>
        ),
      },
      {
        path: "forgot-password",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ForgotPassword />
          </Suspense>
        ),
      },
      {
        path: "reset-password",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ResetPassword />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "admin",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <RoleProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </RoleProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "beaches",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <RoleProtectedRoute roles={["admin"]}>
              <BeachesManagement />
            </RoleProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "content",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <RoleProtectedRoute roles={["admin"]}>
              <ContentManagement />
            </RoleProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "reservations",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <RoleProtectedRoute roles={["admin"]}>
              <ReservationManagementTab />
            </RoleProtectedRoute>
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <NotFound />
      </Suspense>
    ),
  },
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
