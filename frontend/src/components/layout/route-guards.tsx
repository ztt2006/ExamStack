import { Loader } from "@mantine/core";
import { Navigate, Outlet, useLocation } from "react-router";

import { useAuthStore } from "@/store/auth-store";

function GuardLoader() {
  return (
    <div className="flex min-h-[40dvh] items-center justify-center">
      <Loader color="orange" />
    </div>
  );
}

export function ProtectedRoute() {
  const location = useLocation();
  const { token, bootstrapped } = useAuthStore();

  if (!bootstrapped) {
    return <GuardLoader />;
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  const { token, bootstrapped } = useAuthStore();

  if (!bootstrapped) {
    return <GuardLoader />;
  }

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
