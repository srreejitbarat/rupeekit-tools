import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
      // Unit tests render localized modules outside Next's react-server layer;
      // give them the full catalogs the server uses.
      "#i18n-catalog/hi": fileURLToPath(new URL("./lib/i18n/catalogs/hi.json", import.meta.url)),
      "#i18n-catalog/bn": fileURLToPath(new URL("./lib/i18n/catalogs/bn.json", import.meta.url)),
    },
  },
  oxc: { jsx: { runtime: "automatic" } },
});
