import { App as CapacitorApp } from "@capacitor/app";
import { useEffect } from "react";
import { useRoute } from "./router";

/**
 * The Android back button steps back through the screen stack and only leaves
 * the app from Home. Without this the button would close the app from anywhere,
 * which is the single most jarring thing a wrapped web app can do.
 */
export function useHardwareBack() {
  const { canGoBack, back } = useRoute();

  useEffect(() => {
    const handle = CapacitorApp.addListener("backButton", () => {
      if (canGoBack) back();
      else void CapacitorApp.exitApp();
    });
    return () => {
      void handle.then((listener) => listener.remove());
    };
  }, [canGoBack, back]);
}
