import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { enableReactComponents } from "@legendapp/state/config/enableReactComponents";

import "./index.css";

enableReactComponents();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
