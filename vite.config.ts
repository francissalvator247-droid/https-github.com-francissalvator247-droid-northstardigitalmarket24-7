import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    define: {
      "import.meta.env.VITE_BTC_DEPOSIT_ADDRESS": JSON.stringify("1QEmV7Uh23XyNdLM1oqo6wqZVKoAbR5MQ1"),
      "process.env.VITE_BTC_DEPOSIT_ADDRESS": JSON.stringify("1QEmV7Uh23XyNdLM1oqo6wqZVKoAbR5MQ1"),
    },
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
