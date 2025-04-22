
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
import { LoadingScreen } from "@/components/LoadingScreen";

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
          <Suspense fallback={<LoadingScreen />}>
            <Index />
          </Suspense>
        ),
      },
      {
        path: "dashboard",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "beaches",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <BeachList />
          </Suspense>
        ),
      },
      {
        path: "beaches/:beachId/reserve",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <BeachReservation />
          </Suspense>
        ),
      },
      {
        path: "reservation-success",
        element: (
          <Suspense fallback={<LoadingScreen />}>
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
              <Suspense fallback={<LoadingScreen />}>
                <UserReservations />
              </Suspense>
            ),
          },
          {
            path: "profile",
            element: (
              <Suspense fallback={<LoadingScreen />}>
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
          <Suspense fallback={<LoadingScreen />}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: "register",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Register />
          </Suspense>
        ),
      },
      {
        path: "forgot-password",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <ForgotPassword />
          </Suspense>
        ),
      },
      {
        path: "reset-password",
        element: (
          <Suspense fallback={<LoadingScreen />}>
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
          <Suspense fallback={<LoadingScreen />}>
            <RoleProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </RoleProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "beaches",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <RoleProtectedRoute roles={["admin"]}>
              <BeachesManagement />
            </RoleProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "content",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <RoleProtectedRoute roles={["admin"]}>
              <ContentManagement />
            </RoleProtectedRoute>
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<LoadingScreen />}>
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
