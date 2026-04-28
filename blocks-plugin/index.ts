import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import type { Plugin, HtmlTagDescriptor } from "vite";

const pluginDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(pluginDir, "..");

// These specifiers must resolve to a single runtime instance shared with
// dynamically-loaded code (e.g. @juo/blocks-extensions from CDN). We keep
// them external in the production build and rely on an injected import
// map so every consumer — local app code and CDN-loaded modules alike —
// resolves the same URL and the browser dedupes the ESM instance.
const blocksExternals = ["@juo/blocks", "@juo/blocks/web-components"];

// Read the @juo/blocks version from package.json so dev, build and the CDN
// always agree regardless of which package manager is in use. We require an
// exact version (no `^` / `~` / other ranges) because the CDN URL needs a
// concrete version — and because any drift between what the app is typed
// against and what the CDN serves would defeat the shared-instance goal.
function readBlocksVersion(): string {
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  const spec: string | undefined =
    pkg.dependencies?.["@juo/blocks"] ?? pkg.devDependencies?.["@juo/blocks"];
  if (!spec) {
    throw new Error("@juo/blocks is not listed in package.json dependencies");
  }
  if (!/^\d+\.\d+\.\d+(?:[-+].*)?$/.test(spec)) {
    throw new Error(
      `@juo/blocks must be pinned to an exact version in package.json (got "${spec}"). ` +
        `The CDN URL needs a concrete version so the app and dynamically-loaded extensions share one instance.`,
    );
  }
  return spec;
}

const blocksVersion = readBlocksVersion();
const blocksBase = `https://unpkg.com/@juo/blocks@${blocksVersion}`;

const importmapScript = `(function () {
  var isEditor = new URLSearchParams(window.location.search).get("editor") === "true";
  var wcVariant = isEditor ? "editor" : "runtime";
  var base = ${JSON.stringify(blocksBase)};
  var importMap = document.createElement("script");
  importMap.type = "importmap";
  importMap.textContent = JSON.stringify({
    imports: {
      "@juo/blocks": base + "/dist/core.js",
      "@juo/blocks/web-components": base + "/dist/web-components-" + wcVariant + ".js",
    },
  });
  document.currentScript.after(importMap);
})();`;

export function blocksThemePlugin(): Plugin {
  let isBuild = false;

  return {
    name: "juo-blocks-theme",
    // Run before Vite's node resolver so we can redirect the bare specifiers
    // to the same URL the import map uses.
    enforce: "pre",

    configResolved(config) {
      isBuild = config.command === "build";
    },

    config() {
      return {
        base: process.env.BASE_PATH || "/",
        optimizeDeps: {
          // Prevent Vite from prebundling these and inlining their
          // dependencies — we need them emitted as standalone imports that
          // resolve to the shared CDN URL.
          exclude: blocksExternals,
        },
        build: {
          rollupOptions: {
            external: blocksExternals,
          },
        },
        define: {
          "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        },
        server: {
          proxy: {
            "/api": {
              target: process.env.BACKEND_URL ?? "https://api.juo.io",
              changeOrigin: true,
              rewrite: (p: string) => p.replace(/^\/api/, ""),
            },
          },
        },
      };
    },

    // Dev: rewrite `@juo/blocks` to the same absolute URL the import map
    // resolves to, so it's emitted verbatim (external) and the browser
    // dedupes the ESM instance with CDN-loaded extensions.
    //
    // `@juo/blocks/web-components` is intentionally NOT handled here: its
    // variant (runtime vs editor) depends on the page's `?editor=true`,
    // which we can't know from a module-graph-time hook. Instead, main.ts
    // imports it via a `@vite-ignore` dynamic import so the browser
    // resolves the bare specifier through the injected import map.
    resolveId(source) {
      if (isBuild) return null;
      if (source === "@juo/blocks") {
        return { id: `${blocksBase}/dist/core.js`, external: true };
      }
      return null;
    },

    configureServer(server) {
      server.httpServer?.once("listening", () => {
        const localUrl =
          server.resolvedUrls?.local?.[0]?.replace(/\/$/, "") ??
          `http://localhost:${server.config.server.port ?? 5173}`;
        const shopDomain = (
          server.config.env?.VITE_SHOP_DOMAIN ??
          process.env.VITE_SHOP_DOMAIN ??
          ""
        ).trim();
        const normalizedDomain = shopDomain
          .toLowerCase()
          .replace(/^https?:\/\//, "")
          .replace(/\/.*$/, "");
        const derivedStore = (normalizedDomain.split(".")[0] ?? "").replace(/[^a-z0-9_-]/g, "");
        const editorPath = derivedStore ? `/store/${derivedStore}/editor` : "/store/<store>/editor";
        const editorUrl = `https://admin.juo.io${editorPath}?portal-url=${encodeURIComponent(localUrl)}`;
        server.config.logger.info(`\n  Blocks Editor (external): \x1b[36m${editorUrl}\x1b[0m\n`);
        if (!derivedStore) {
          server.config.logger.info(
            `  Tip: set VITE_SHOP_DOMAIN (e.g. beauty-box.myshopify.com) to print a ready-to-open store URL.\n`,
          );
        }
      });
    },

    transformIndexHtml() {
      const tags: HtmlTagDescriptor[] = [
        {
          tag: "script",
          attrs: {
            async: true,
            src: "https://ga.jspm.io/npm:es-module-shims@2.6.2/dist/es-module-shims.js",
          },
          injectTo: "head",
        },
        {
          tag: "script",
          children: importmapScript,
          injectTo: "head",
        },
      ];
      return tags;
    },
  };
}
