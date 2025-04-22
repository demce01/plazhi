
import { lazy, Suspense } from "react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { LoadingSpinner } from "./LoadingSpinner";

// Lazy-loaded auth pages
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));

export const authRoutes = {
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
};

