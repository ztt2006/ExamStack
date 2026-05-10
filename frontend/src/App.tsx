import "@mantine/core/styles.css";

import { MantineProvider, createTheme } from "@mantine/core";
import { useMount, useRequest } from "ahooks";
import { RouterProvider } from "react-router/dom";

import { getCurrentUser } from "@/api/auth";
import { router } from "@/router";
import { useAuthStore } from "@/store/auth-store";

const theme = createTheme({
  primaryColor: "blue",
  colors: {
    blue: [
      "#eff6ff",
      "#dbeafe",
      "#bfdbfe",
      "#93c5fd",
      "#60a5fa",
      "#3b82f6",
      "#2563eb",
      "#1d4ed8",
      "#1e40af",
      "#1e3a8a",
    ],
  },
  fontFamily: 'Inter, "Segoe UI", "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
  headings: {
    fontFamily: 'Inter, "Segoe UI", "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
  },
  radius: {
    sm: "6px",
    md: "8px",
    xl: "8px",
  },
  defaultRadius: "md",
});

function AppBootstrap() {
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const setBootstrapped = useAuthStore((state) => state.setBootstrapped);

  const meRequest = useRequest(getCurrentUser, {
    manual: true,
    onSuccess: (user) => {
      setUser(user);
      setBootstrapped(true);
    },
    onError: () => {
      logout();
    },
  });

  useMount(() => {
    if (token) {
      void meRequest.run();
    } else {
      setBootstrapped(true);
    }
  });

  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <AppBootstrap />
    </MantineProvider>
  );
}
