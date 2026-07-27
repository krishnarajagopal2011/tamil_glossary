import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app";
import "./styles.css";

/** Applies the stored theme and reading size before the first paint. */
try {
  const root = document.documentElement;
  const stored = localStorage.getItem("glossary-theme");
  root.dataset.theme =
    stored ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

  const scale = Number.parseFloat(
    localStorage.getItem("glossary-read-scale") ?? "",
  );
  if (scale >= 1 && scale <= 2) {
    root.style.setProperty("--app-read-scale", String(scale));
  }
} catch {
  /* storage disabled — the defaults in the stylesheet stand */
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
