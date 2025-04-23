
import { lazy, Suspense } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";
import { LoadingSpinner } from "./LoadingSpinner";
import { useAdminBeachList } from "@/hooks/admin/useAdminBeachList";

// Lazy-loaded admin pages
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const BeachesManagement = lazy(() => import("@/pages/admin/BeachesManagement"));
const ContentManagement = lazy(() => import("@/pages/admin/ContentManagement"));
const ReservationManagementTab = lazy(() => import("@/pages/admin/ReservationManagementTab"));
const AdminReservationDetail = lazy(() => import("@/pages/admin/AdminReservationDetail"));
const CreateOnSiteReservation = lazy(() => import("@/pages/admin/CreateOnSiteReservation"));

// Create a wrapper component to pass beaches to ReservationManagementTab
const ReservationsPage = () => {
  const { beaches } = useAdminBeachList();
  return <ReservationManagementTab beaches={beaches} />;
};

export const adminRoutes = {
  path: "admin",
  element: <DashboardLayout />,
  children: [
    {
      path: "users",
      element: (
        <Suspense fallback={<LoadingSpinner />}>
          <RoleProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </RoleProtectedRoute>
        </Suspense>
      ),
    },
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
            <ReservationsPage />
          </RoleProtectedRoute>
        </Suspense>
      ),
    },
    {
      path: "reservations/:id",
      element: (
        <Suspense fallback={<LoadingSpinner />}>
          <RoleProtectedRoute roles={["admin"]}>
            <AdminReservationDetail />
          </RoleProtectedRoute>
        </Suspense>
      ),
    },
    {
      path: "create-reservation",
      element: (
        <Suspense fallback={<LoadingSpinner />}>
          <RoleProtectedRoute roles={["admin", "employee"]}>
            <CreateOnSiteReservation />
          </RoleProtectedRoute>
        </Suspense>
      ),
    },
  ],
};
