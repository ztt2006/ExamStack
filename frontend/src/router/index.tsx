import { createBrowserRouter } from "react-router";

import { AppLayout } from "@/components/layout/app-layout";
import { GuestRoute, ProtectedRoute } from "@/components/layout/route-guards";
import { HomePage } from "@/pages/home-page";
import { LoginPage } from "@/pages/login-page";
import { NotFoundPage } from "@/pages/not-found-page";
import { ProfilePage } from "@/pages/profile-page";
import { RegisterPage } from "@/pages/register-page";
import { ResourceDetailPage } from "@/pages/resource-detail-page";
import { UploadPage } from "@/pages/upload-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "resources/:id",
        element: <ResourceDetailPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "upload",
            element: <UploadPage />,
          },
          {
            path: "profile",
            element: <ProfilePage />,
          },
        ],
      },
      {
        element: <GuestRoute />,
        children: [
          {
            path: "login",
            element: <LoginPage />,
          },
          {
            path: "register",
            element: <RegisterPage />,
          },
        ],
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
