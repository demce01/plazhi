
import { lazy, Suspense } from "react";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";
import { LoadingSpinner } from "./LoadingSpinner";

// Lazy-loaded components
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const UserManagement = lazy(() => import("@/pages/admin/UserManagement"));
const ContentManagement = lazy(() => import("@/pages/admin/ContentManagement"));
const BeachesManagement = lazy(() => import("@/pages/admin/BeachesManagement"));
const CreateOnSiteReservation = lazy(() => import("@/pages/admin/CreateOnSiteReservation"));
const AdminReservationDetail = lazy(() => import("@/pages/admin/AdminReservationDetail"));
const ReservationManagementTab = lazy(() => import("@/pages/admin/ReservationManagementTab"));
const ReservationsDashboard = lazy(() => import("@/pages/admin/ReservationsDashboard"));

export const adminRoutes = {
  path: "admin",
  element: <RoleProtectedRoute allowedRoles={["admin", "employee"]} />,
  children: [
    {
      index: true,
      element: (
        <Suspense fallback={<LoadingSpinner />}>
          <AdminDashboard />
        </Suspense>
      ),
    },
    {
      path: "dashboard",
      element: (
        <Suspense fallback={<LoadingSpinner />}>
          <ReservationsDashboard />
        </Suspense>
      ),
    },
    {
      path: "users",
      element: (
        <Suspense fallback={<LoadingSpinner />}>
          <UserManagement />
        </Suspense>
      ),
    },
    {
      path: "content",
      element: (
        <Suspense fallback={<LoadingSpinner />}>
          <ContentManagement />
        </Suspense>
      ),
    },
    {
      path: "beaches",
      element: (
        <Suspense fallback={<LoadingSpinner />}>
          <BeachesManagement />
        </Suspense>
      ),
    },
    {
      path: "reservations",
      element: (
        <Suspense fallback={<LoadingSpinner />}>
          <ReservationManagementTab />
        </Suspense>
      ),
    },
    {
      path: "reservations/create",
      element: (
        <Suspense fallback={<LoadingSpinner />}>
          <CreateOnSiteReservation />
        </Suspense>
      ),
    },
    {
      path: "reservations/:id",
      element: (
        <Suspense fallback={<LoadingSpinner />}>
          <AdminReservationDetail />
        </Suspense>
      ),
    },
  ],
};
