import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    server: {
      host: "0.0.0.0",
      port: 3000,
      allowedHosts: true,
    },
    preview: {
      host: "0.0.0.0",
      port: 3000,
    },
    plugins: [
      nitro({
        preset: "vercel",
      }),
    ],
  },
});
