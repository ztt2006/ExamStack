import { createBrowserRouter } from "react-router";

import { AppLayout } from "@/components/layout/app-layout";
import { GuestRoute, ProtectedRoute } from "@/components/layout/route-guards";
import { AccountPage } from "@/pages/account-page";
import { DocumentsPage } from "@/pages/documents-page";
import { HomePage } from "@/pages/home-page";
import { KnowledgeBasePage } from "@/pages/knowledge-base-page";
import { LoginPage } from "@/pages/login-page";
import { NotFoundPage } from "@/pages/not-found-page";
import { ProfilePage } from "@/pages/profile-page";
import { RegisterPage } from "@/pages/register-page";
import { ResourceDetailPage } from "@/pages/resource-detail-page";

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
        path: "resources",
        element: <DocumentsPage />,
      },
      {
        path: "knowledge-base",
        element: <KnowledgeBasePage />,
      },
      {
        path: "resources/:id",
        element: <ResourceDetailPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "account",
            element: <AccountPage />,
          },
          {
            path: "my-uploads",
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
