import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/** @type {import('tailwindcss').Config} */
export default {
  presets: [require("./blocks-plugin/tailwind-preset.cjs")],
  content: ["./index.html", "./src/**/*.{tsx,ts}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        muted: "var(--muted)",
        "beauty-taupe": "var(--primary)",
        "beauty-sand": "#C4A882",
      },
      fontFamily: {
        sans: ["quasimoda", "sans-serif"],
        serif: ["ivypresto-display", "serif"],
        code: ["source-code-pro", "monospace"],
        ivyPresto: ["ivypresto-display", "serif"],
        ivyprestoHeadline: ["ivypresto-headline", "serif"],
        quasimoda: ["Quasimoda", "sans-serif"],
      },
    },
  },
  plugins: [],
};
