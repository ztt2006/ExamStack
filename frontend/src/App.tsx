import "@mantine/core/styles.css";

import { MantineProvider, createTheme } from "@mantine/core";
import { useMount, useRequest } from "ahooks";
import { RouterProvider } from "react-router/dom";

import { getCurrentUser } from "@/api/auth";
import { router } from "@/router";
import { useAuthStore } from "@/store/auth-store";

const theme = createTheme({
  primaryColor: "orange",
  fontFamily: "Geist Variable, sans-serif",
  headings: {
    fontFamily: '"Bricolage Grotesque", "Geist Variable", sans-serif',
  },
  radius: {
    md: "18px",
    xl: "26px",
  },
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
    <MantineProvider theme={theme}>
      <AppBootstrap />
    </MantineProvider>
  );
}
