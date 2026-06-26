import type { Plugin } from "vite";

// Versions are pinned to the alpha packages this theme is built against.
// Bump these together with @juo/blocks (see package.json) when upgrading.
const EDITOR_VERSION = "0.25.0-alpha.4";
const DEVTOOLS_VERSION = "0.1.0-alpha.3";

const EDITOR_EMBED_URL = `https://cdn.juo.io/web/blocks/juo/editor/${EDITOR_VERSION}/juo-editor.embed.js`;

const DEVTOOLS_EMBED_URL = `https://cdn.juo.io/web/blocks/juo/devtools/${DEVTOOLS_VERSION}/blocks-devtools.embed.js`;

// Dev-only harness aligned with the `juo create` scaffolding: serves an embedded
// Juo editor at `/editor` and injects the devtools overlay into the local
// preview. `apply: "serve"` keeps it out of the production `vite build` — this
// repo ships a full theme (index.html is a real build artifact), so the editor
// and devtools embeds must never leak into the published bundle.
export default function juoEditor(): Plugin {
  return {
    name: "juo-editor",
    apply: "serve",

    transformIndexHtml(html, ctx) {
      // Skip the editor page itself — devtools aren't needed there.
      if (ctx.path === "/editor" || ctx.path.startsWith("/editor?")) return;
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: { type: "module", src: DEVTOOLS_EMBED_URL },
            injectTo: "head-prepend",
          },
        ],
      };
    },

    configureServer(server) {
      server.middlewares.use("/editor", (_req, res) => {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Juo Blocks Editor</title>
    <link rel="preconnect" href="https://rsms.me/" />
    <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
    <style>
      html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; font-family: InterVariable, Inter, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
      juo-editor { display: block; height: 100vh; }
    </style>
  </head>
  <body>
    <script type="module" src="${EDITOR_EMBED_URL}"></script>
    <juo-editor url="/?editor=true"></juo-editor>
  </body>
</html>`);
      });

      server.httpServer?.once("listening", () => {
        const address = server.httpServer?.address();
        const port = address && typeof address === "object" ? address.port : 5180;
        const base = `http://localhost:${port}`;
        server.config.logger.info(
          `\n  juo editor        ${base}/editor` +
            `\n  editor view mode  ${base}/?editor=true` +
            `\n  theme preview     ${base}/\n`,
        );
      });
    },
  };
}
