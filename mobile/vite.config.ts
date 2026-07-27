import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    // The shared components live under ../web, which has its own node_modules.
    // Without this, `react` resolves there for them and here for main.tsx, and
    // the two copies produce a silently empty page in the production build.
    dedupe: ["react", "react-dom", "react/jsx-runtime"],

    alias: [
      // The screen components are the website's, imported unchanged. `next/*`
      // is aliased onto the app's own router so they compile outside Next.
      { find: /^next\/link$/, replacement: here("src/shims/link.tsx") },
      { find: /^next\/navigation$/, replacement: here("src/shims/navigation.ts") },
      { find: /^@\//, replacement: here("../web/") },
    ],
  },

  build: {
    outDir: "www",
    emptyOutDir: true,
    // Everything ships in the APK, so there is no cache to bust and no reason
    // to split: one file starts faster in a cold webview.
    assetsInlineLimit: 0,
    rollupOptions: { output: { manualChunks: undefined } },
  },
});
