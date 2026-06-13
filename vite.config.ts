import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  // Lovable'ın kendi dokümantasyonunda belirttiği "additional config" alanı:
  vite: {
    server: {
      allowedHosts: true, 
    },
  },
});