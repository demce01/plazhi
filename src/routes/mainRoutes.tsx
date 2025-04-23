
import { lazy, Suspense } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LoadingSpinner } from "./LoadingSpinner";

// Lazy-loaded pages
const Index = lazy(() => import("@/pages/Index"));
const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"));
const BeachesList = lazy(() => import("@/pages/beaches/BeachesList"));
const BeachReservation = lazy(() => import("@/pages/beaches/BeachReservation"));
const ReservationSuccess = lazy(() => import("@/pages/beaches/ReservationSuccess"));
const UserReservations = lazy(() => import("@/pages/user/UserReservations"));
const UserProfile = lazy(() => import("@/pages/user/UserProfile"));

export const mainRoutes = {
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
          <BeachesList />
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
};
