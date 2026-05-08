import { StrictMode, startTransition } from "react";
import { createRoot } from "react-dom/client";

import App from "@/App";
import "@/style/index.css";

const root = createRoot(document.getElementById("root")!);

startTransition(() => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
