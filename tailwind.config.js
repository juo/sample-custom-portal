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
        "custom-taupe": "var(--primary)",
        "custom-sand": "#C4A882",
      },
    },
  },
  plugins: [],
};
