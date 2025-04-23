
import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { mainRoutes } from "./mainRoutes";
import { authRoutes } from "./authRoutes";
import { adminRoutes } from "./adminRoutes";
import { LoadingSpinner } from "./LoadingSpinner";

const NotFound = lazy(() => import("@/pages/NotFound"));

export const router = createBrowserRouter([
  mainRoutes,
  authRoutes,
  adminRoutes,
  {
    path: "*",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <NotFound />
      </Suspense>
    ),
  },
]);
