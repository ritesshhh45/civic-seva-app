import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  resolve: { tsconfigPaths: true },
  server: { host: "0.0.0.0", port: 8080 },
  esbuild: { drop: ["console", "debugger"] },
  build: { target: "es2022", sourcemap: false, cssMinify: true },
});
