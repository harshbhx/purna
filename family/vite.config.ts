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
    },
  },
  server: { proxy: { "/api": "http://localhost:8787" } },
});
