import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../app/globals.css";
import AboutPage from "../app/about/page";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AboutPage />
  </StrictMode>,
);
