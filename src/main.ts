import {
  provideContext,
  effect,
  untracked,
  registerBlock,
  createThemeState,
  ThemeStateContext,
  injectContext,
  CustomerServiceContext,
  OrdersServiceContext,
  ProductServiceContext,
  SubscriptionServiceContext,
  SchedulesServiceContext,
  RouterServiceContext,
  createOverlayService,
  OverlayServiceContext,
  createTranslationService,
  TranslationContext,
  LoginServiceContext,
  type RouterService,
} from "@juo/blocks";
import { defineCustomElements as defineCustomerUiElements } from "@juo/customer-ui/web-components";
import "./style.css";

// Register the @juo/customer-ui design-system web components (juo-button,
// juo-card, juo-tag, …) so blocks can render design-system elements.
defineCustomerUiElements();

import * as customBlocks from "./blocks/index";
import {
  isEditorMode,
  currentRoute,
  navigate,
  createCustomRouterService,
  getPathFromRouteName,
} from "./lib/router";
import { createPortalLoginService } from "./lib/login";
import { createPortalServices } from "./lib/services";
import { applyGlobalStyles } from "./lib/apply-global-styles";
import { mountApp } from "./App";

// ─── Routes ───────────────────────────────────────────────────────────────

const routes = {
  "/login": { name: "Login", pageComponent: "CustomLoginPage" },
  "/": { name: "Subscription", pageComponent: "CustomSubscriptionPage" },
  "/orders": { name: "Orders", pageComponent: "CustomOrdersPage" },
} as const;

type BlockExtensionsModule = {
  registerBlocks?: () => void;
};

const DEFAULT_EXTENSIONS_VERSION = "1.12.0-alpha.3";

// ─── Block registration ───────────────────────────────────────────────────

async function registerBlocks() {
  const extensionsVersion =
    import.meta.env.VITE_BLOCKS_EXTENSIONS_VERSION ?? DEFAULT_EXTENSIONS_VERSION;
  const extensionsUrl =
    import.meta.env.VITE_BLOCKS_EXTENSIONS_URL ??
    `https://cdn.juo.io/web/blocks/juo/${extensionsVersion}/extensions.js`;
  try {
    const module = (await import(
      /* @vite-ignore */
      extensionsUrl
    )) as BlockExtensionsModule;
    if (typeof module.registerBlocks === "function") {
      module.registerBlocks();
    } else {
      console.warn(`Extensions module did not export registerBlocks(): ${extensionsUrl}`);
    }
  } catch (error) {
    console.error(`Failed to load extensions from ${extensionsUrl}`, error);
  }

  Object.values(customBlocks).forEach((block) =>
    registerBlock(block as Parameters<typeof registerBlock>[0]),
  );
}

function getPreferredLocale(): string {
  return window.navigator.language?.trim() || "en";
}

function resolveMockMode(value: string | undefined): boolean {
  if (value == null) return true;
  return value.trim().toLowerCase() === "true";
}

function renderStartupError(message: string): void {
  const appRoot = document.querySelector("#app");
  const target = appRoot instanceof HTMLElement ? appRoot : document.body;
  const panel = document.createElement("div");
  panel.setAttribute("role", "alert");
  panel.style.cssText =
    "max-width:760px;margin:40px auto;padding:16px;border:1px solid #f5c2c7;background:#f8d7da;color:#58151c;border-radius:8px;font:14px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;";
  panel.textContent = message;
  target.replaceChildren(panel);
}

function resolvePathnameForTheme(route: string): keyof typeof routes {
  const path = getPathFromRouteName(route);
  return path in routes ? (path as keyof typeof routes) : "/";
}

// ─── Editor mode setup ───────────────────────────────────────────────────

async function setupEditorMode(root: HTMLElement, routerService: RouterService, locale: string) {
  try {
    const editorModule = await import("@juo/blocks/editor");
    const editor = editorModule.createEditorBridge();
    const themeState = createThemeState({
      resolve: async (surface, path) => {
        const result = await editor.requestThemeState(surface, path);
        return result;
      },
      routerService,
      upsertState: (surface, path, blocks) => editor.upsertThemeState(surface, path, blocks),
    });
    provideContext(root, ThemeStateContext, themeState);
    void themeState.locales.setLocale(locale);
    const translationService = createTranslationService(themeState.locales);
    provideContext(root, TranslationContext, translationService);
    const overlayService = createOverlayService(themeState);
    provideContext(root, OverlayServiceContext, overlayService);

    await editorModule
      .setupEditorMode({ routerService, themeState, overlayService })
      .catch((error: unknown) => {
        console.error("Failed to setup editor mode", error);
      });

    const initialPathname = resolvePathnameForTheme(currentRoute.value);
    void themeState.resolve("page", initialPathname);
  } catch (error) {
    console.error("Failed to initialize editor", error);
  }
}

// ─── View mode setup ─────────────────────────────────────────────────────

function setupViewMode(root: HTMLElement, routerService: RouterService, locale: string) {
  const themeState = createThemeState({
    resolve: async () => null,
    routerService,
  });
  void themeState.locales.setLocale(locale);
  const translationService = createTranslationService(themeState.locales);
  provideContext(root, TranslationContext, translationService);
  provideContext(root, ThemeStateContext, themeState);
  provideContext(root, OverlayServiceContext, createOverlayService(themeState));

  // Resolve the initial page; subsequent navigations are driven by routerService.subscribe
  const initialPathname = resolvePathnameForTheme(currentRoute.value);
  void themeState.resolve("page", initialPathname);
}

// ─── Page rendering (editor mode only) ───────────────────────────────────

function setupPageRendering(root: HTMLElement, appEl: HTMLElement) {
  const themeState = injectContext(root, ThemeStateContext);
  if (!themeState) return;

  let currentPageBlockId: string | null = null;

  effect(() => {
    const block = themeState.page.blocks.value.at(0);
    untracked(() => {
      if (block == null) {
        currentPageBlockId = null;
        appEl.replaceChildren();
      } else if (block.id !== currentPageBlockId) {
        currentPageBlockId = block.id;
        appEl.replaceChildren(block.definition.render(block));
      }
    });
  });
}

// ─── Main initialization ──────────────────────────────────────────────────

async function initializeTheme() {
  const root = document.querySelector("juo-context-root");
  const appEl = document.querySelector("#app");
  if (!(root instanceof HTMLElement) || !(appEl instanceof HTMLElement)) {
    console.error("Required mount elements were not found.");
    renderStartupError(
      "Failed to initialize the sample portal because required mount elements are missing.",
    );
    return;
  }

  // Load web-components via a variable specifier so Vite/Rollup don't
  // statically resolve it — the injected import map picks the `runtime`
  // or `editor` variant at runtime based on `?editor=true`.
  const webComponentsSpecifier = "@juo/blocks/web-components";
  try {
    await import(/* @vite-ignore */ webComponentsSpecifier);
  } catch (error) {
    console.error("Failed to load @juo/blocks/web-components", error);
    renderStartupError(
      "Failed to load required Juo web components. Check your network and dependency setup.",
    );
    return;
  }

  // 1. Register all blocks
  const registerBlocksPromise = registerBlocks();
  const preferredLocale = getPreferredLocale();

  const shopDomain = import.meta.env.VITE_SHOP_DOMAIN ?? "custom-box.myshopify.com";
  const useMock = resolveMockMode(import.meta.env.VITE_MOCK_MODE);

  // 2. Create login service (mock or real adapter chosen by VITE_MOCK_MODE)
  const loginServiceInstance = createPortalLoginService({
    useMock,
    shopDomain,
    locale: preferredLocale,
  });

  // In mock mode, auto-authenticate with a fake delegated token.
  // Skip on the login page so it can be previewed unauthenticated.
  // Pass redirect-to so onSuccess navigates back to the current page
  // instead of always landing on subscription.
  if (useMock && window.location.pathname !== "/login") {
    await loginServiceInstance.handleQueryParams(
      new URLSearchParams(
        `delegated-token=mock&redirect-to=${encodeURIComponent(window.location.pathname)}`,
      ),
    );
  } else if (isEditorMode()) {
    // In editor mode, seed the delegated token from query params
    await loginServiceInstance.handleQueryParams(new URLSearchParams(window.location.search));
  } else {
    // In view mode, process URL query params (handles ?delegated-token=... from CLI)
    await loginServiceInstance.handleQueryParams(new URLSearchParams(window.location.search));
  }

  // 3. Create domain services (mock or real adapters chosen by VITE_MOCK_MODE)
  const { customerService, productService, ordersService, subscriptionService, schedulesService } =
    createPortalServices({
      useMock,
      shopDomain,
      loginService: loginServiceInstance,
    });
  const routerService = createCustomRouterService();

  // 4. Provide contexts
  provideContext(root, LoginServiceContext, loginServiceInstance);
  provideContext(root, CustomerServiceContext, customerService);
  provideContext(root, ProductServiceContext, productService);
  provideContext(root, OrdersServiceContext, ordersService);
  provideContext(root, SubscriptionServiceContext, subscriptionService);
  provideContext(root, SchedulesServiceContext, schedulesService);
  provideContext(root, RouterServiceContext, routerService);

  await registerBlocksPromise;

  // 5. Setup editor or view mode (sets ThemeStateContext)
  if (isEditorMode()) {
    await setupEditorMode(root, routerService, preferredLocale);
  } else {
    setupViewMode(root, routerService, preferredLocale);
  }

  // 6. Bridge globalStyles → CSS custom properties on :root
  const currentThemeState = injectContext(root, ThemeStateContext);
  if (currentThemeState) {
    effect(() => {
      applyGlobalStyles(document.documentElement, currentThemeState.globalStyles.value);
    });
  }

  // 7. Auth guard — redirect to login when unauthenticated
  if (!isEditorMode()) {
    effect(() => {
      const isAuth = loginServiceInstance.isAuthenticated.value;
      const route = currentRoute.value;
      untracked(() => {
        if (!isAuth && route !== "login") {
          navigate("login");
        } else if (isAuth && route === "login") {
          navigate("subscription");
        }
      });
    });
  }

  // 8. Load initial data after auth
  if (!isEditorMode()) {
    let dataLoaded = false;
    effect(() => {
      const isAuth = loginServiceInstance.isAuthenticated.value;
      untracked(() => {
        if (isAuth && !dataLoaded) {
          dataLoaded = true;
          void subscriptionService.search();
          void schedulesService.getUpcomingOrders(2);
        }
      });
    });
  }

  // 9. Mount React app (view mode) or render page blocks (editor mode)
  if (isEditorMode()) {
    setupPageRendering(root, appEl);
  } else {
    mountApp(appEl);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    void initializeTheme();
  });
} else {
  void initializeTheme();
}
