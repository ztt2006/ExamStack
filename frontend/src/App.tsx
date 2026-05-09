import "@mantine/core/styles.css";

import { MantineProvider, createTheme } from "@mantine/core";
import { useMount, useRequest } from "ahooks";
import { RouterProvider } from "react-router/dom";

import { getCurrentUser } from "@/api/auth";
import { router } from "@/router";
import { useAuthStore } from "@/store/auth-store";

const theme = createTheme({
  primaryColor: "sky",
  colors: {
    sky: [
      "#eef8ff",
      "#dff1ff",
      "#c3e6ff",
      "#9ad5ff",
      "#73c3ff",
      "#4db0f7",
      "#3399de",
      "#2679af",
      "#215f89",
      "#1f526f",
    ],
  },
  fontFamily: "Geist Variable, sans-serif",
  headings: {
    fontFamily: '"Manrope", "Geist Variable", sans-serif',
  },
  radius: {
    sm: "14px",
    md: "20px",
    xl: "30px",
  },
  defaultRadius: "xl",
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
