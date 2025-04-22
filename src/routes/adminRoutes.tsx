
import { lazy, Suspense } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";
import { LoadingSpinner } from "./LoadingSpinner";

// Lazy-loaded admin pages
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const BeachesManagement = lazy(() => import("@/pages/admin/BeachesManagement"));
const ContentManagement = lazy(() => import("@/pages/admin/ContentManagement"));
const ReservationManagementTab = lazy(() => import("@/pages/admin/ReservationManagementTab"));

export const adminRoutes = {
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
};

