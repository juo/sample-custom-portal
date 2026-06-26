import type { GlobalStyles } from "@juo/blocks";

// Bridges the theme's `globalStyles` onto the @juo/customer-ui design system.
//
// The design system is driven by `data-*` attributes + lightness/hue/chroma
// custom properties that `@juo/customer-ui/theme-modes.css` reads to compute the
// `--theme-*` token inputs. So instead of hand-computing palettes, we translate
// globalStyles into those attributes/inputs and let the design system do the
// rest — which is what makes volume, corners, style, tint and custom colours all
// take effect (and stay consistent with the editor and the web components).

// ─── hex → OKLCH ─────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const r = parseInt(h.length === 3 ? h[0] + h[0] : h.slice(0, 2), 16) / 255;
  const g = parseInt(h.length === 3 ? h[1] + h[1] : h.slice(2, 4), 16) / 255;
  const b = parseInt(h.length === 3 ? h[2] + h[2] : h.slice(4, 6), 16) / 255;
  return [r, g, b];
}

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function hexToOklch(hex: string): { L: number; C: number; h: number } {
  const [sr, sg, sb] = hexToRgb(hex);
  const r = srgbToLinear(sr);
  const g = srgbToLinear(sg);
  const b = srgbToLinear(sb);

  // Linear sRGB → XYZ (D65)
  const x = 0.4123907993 * r + 0.3575843394 * g + 0.1804807884 * b;
  const y = 0.2126390059 * r + 0.7151686788 * g + 0.0721923154 * b;
  const z = 0.0193308187 * r + 0.1191947798 * g + 0.9505321522 * b;

  // XYZ → LMS (cube root)
  const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
  const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
  const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.633851707 * z);

  // LMS → Oklab
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const ob = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  // Oklab → Oklch
  const C = Math.sqrt(a * a + ob * ob);
  let h = Math.atan2(ob, a) * (180 / Math.PI);
  if (h < 0) h += 360;

  return { L, C, h: Number.isNaN(h) ? 0 : h };
}

// ─── Custom-colour inputs ───────────────────────────────────────────────

// theme-modes.css derives a colour's full 25–900 scale from data-<key>="custom"
// plus --<key>-l / --<key>-hue / --<key>-chroma, where the picked colour becomes
// grade 700 (its lightness/hue) and chroma is expressed relative to the 0.045
// base step.
function setCustomColor(el: HTMLElement, key: string, hex: string): void {
  const { L, C, h } = hexToOklch(hex);
  el.setAttribute(`data-${key}`, "custom");
  el.style.setProperty(`--${key}-l`, `${(L * 100).toFixed(2)}%`);
  el.style.setProperty(`--${key}-hue`, h.toFixed(2));
  el.style.setProperty(`--${key}-chroma`, (C / 0.045).toFixed(4));
}

function clearCustomColor(el: HTMLElement, key: string): void {
  el.removeAttribute(`data-${key}`);
  el.style.removeProperty(`--${key}-l`);
  el.style.removeProperty(`--${key}-hue`);
  el.style.removeProperty(`--${key}-chroma`);
}

// Honour the theme's colour when set, otherwise fall back to the design
// system's built-in default for that role (success/error/etc.).
function applyOptionalColor(el: HTMLElement, key: string, hex: string): void {
  if (hex) setCustomColor(el, key, hex);
  else clearCustomColor(el, key);
}

// Default brand palette — used when the theme state supplies no colour (e.g.
// mock/view mode, where the page resolves to the default global styles). The
// editor/theme overrides any of these per role when it provides a colour.
const DEFAULT_BRAND_COLORS = {
  accent: "#a8896b", // warm taupe — the sample's brand colour
  secondary: "#c4a882", // sand
  tint: "#94897e", // warm neutral for surfaces
} as const;

export function applyGlobalStyles(el: HTMLElement, styles: GlobalStyles): void {
  // 1. Mode attributes consumed by @juo/customer-ui/theme-modes.css
  //    (spacing, font size, radii, surfaces).
  el.setAttribute("data-volume", styles.volume);
  el.setAttribute("data-style", styles.style);
  el.setAttribute("data-corners", styles.corners);
  el.setAttribute("data-button-corners", styles.buttonCorners);
  el.setAttribute("data-thumbnail-corners", styles.thumbnailCorners);

  // 2. Background → page surface colour.
  if (styles.colors.background) {
    el.style.setProperty("background-color", styles.colors.background);
  } else {
    el.style.removeProperty("background-color");
  }

  const isCustom = styles.theme === "custom";

  // 3. Tint (surface neutrals).
  //    - Preset theme: the neutral/warm/cold preset, driven by `themeType`.
  //    - Custom theme: the picked tint colour.
  //    `colors.tint` is only honoured in custom mode — otherwise a stale custom
  //    tint would shadow the preset and the neutral/warm/cold switch would do
  //    nothing.
  if (isCustom && styles.colors.tint) {
    setCustomColor(el, "tint", styles.colors.tint);
  } else {
    clearCustomColor(el, "tint");
    el.setAttribute("data-tint", styles.themeType || "neutral");
  }

  // 4. Accent + secondary: the theme's colour when set, else the brand default.
  //    The design system has no warm/cold preset for these roles (presets only
  //    drive the tint/surface neutrals), so the sample keeps its brand accent
  //    unless the theme explicitly overrides it.
  setCustomColor(el, "accent", styles.colors.accent || DEFAULT_BRAND_COLORS.accent);
  setCustomColor(el, "secondary", styles.colors.secondary || DEFAULT_BRAND_COLORS.secondary);

  // 5. Callout (custom theme only) + semantic roles: honour the theme,
  //    otherwise keep the design system's built-in defaults.
  if (isCustom && styles.colors.callout) setCustomColor(el, "callout", styles.colors.callout);
  else clearCustomColor(el, "callout");
  applyOptionalColor(el, "success", styles.colors.success);
  applyOptionalColor(el, "error", styles.colors.error);
  applyOptionalColor(el, "info", styles.colors.information);
  applyOptionalColor(el, "warning", styles.colors.warning);
}
