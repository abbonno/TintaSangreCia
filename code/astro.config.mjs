// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
// https://astro.build/config
export default defineConfig({
  vite: {
    // @ts-expect-error tipos incompatibles pero funciona
    plugins: [tailwindcss()],
  },
});