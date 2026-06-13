import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: true, // İŞTE BİZİ KURTARACAK SİHİRLİ KOD BU
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