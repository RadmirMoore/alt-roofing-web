import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { getAttribution } from "./lib/attribution";
import "./index.css";

// Capture first-touch traffic source immediately, before any SPA navigation
// can strip the landing URL's UTM params or the referrer goes stale.
getAttribution();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
