import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import juoEditor from "./vite/juo-editor-plugin";
import { blocksThemePlugin } from "./blocks-plugin/index";

export default defineConfig({
  // `juoEditor` is the dev-only editor/devtools harness from the `juo create`
  // scaffolding; `blocksThemePlugin` keeps the full-theme plumbing (import map,
  // @juo/blocks externalization, `/api` proxy) this repo needs to ship a theme
  // rather than a blocks-only bundle.
  plugins: [react(), juoEditor(), blocksThemePlugin()],
});
