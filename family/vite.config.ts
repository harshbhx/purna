// Builds the Purna Family web app (React + shadcn/ui + React Bits) into dist/, which the Worker serves.
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import { defineConfig } from "vite";

const web = resolve(__dirname, "web");

export default defineConfig({
  root: web,
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": resolve(web, "src") } },
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    modulePreload: { polyfill: false }, // no inline script, so the CSP can stay script-src 'self'
    rollupOptions: {
      input: {
        index: resolve(web, "index.html"),
        doctor: resolve(web, "doctor.html"),
        join: resolve(web, "join.html"),
      },
      // Named library chunks: the landing, dashboard and therapist pages share them from the browser cache.
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (/[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return "react";
          if (/[\\/](motion|motion-dom|motion-utils|framer-motion)[\\/]/.test(id)) return "motion";
          if (id.includes("@radix-ui") || id.includes("@floating-ui") || id.includes("react-remove-scroll")) return "radix";
          return "vendor";
        },
      },
    },
  },
  server: { proxy: { "/api": "http://localhost:8787" } },
});
