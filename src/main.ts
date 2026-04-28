import {
  provideContext,
  effect,
  untracked,
  registerBlock,
  createThemeState,
  ThemeStateContext,
  injectContext,
  createCustomerService,
  CustomerServiceContext,
  createOrderService,
  OrderServiceContext,
  createSubscriptionService,
  SubscriptionServiceContext,
  createSchedulesService,
  SchedulesServiceContext,
  RouterServiceContext,
  createTranslationService,
  TranslationContext,
  LoginServiceContext,
  type RouterService,
  createLoginService,
  createApiLoginAdapter,
  createMockLoginAdapter,
  createMockCustomerAdapter,
  createApiCustomerAdapter,
  createMockOrderAdapter,
  createApiOrderAdapter,
  createMockSubscriptionAdapter,
  createApiSubscriptionAdapter,
  createMockSchedulesAdapter,
  createApiSchedulesAdapter,
  type ApiFetcher,
} from "@juo/blocks";
import "./style.css";

import * as beautyBlocks from "./blocks/index";
import {
  isEditorMode,
  currentRoute,
  navigate,
  createBeautyRouterService,
  getPathFromRouteName,
} from "./lib/router";
import { applyGlobalStyles } from "./lib/apply-global-styles";
import { mountApp } from "./App";

// ─── Routes ───────────────────────────────────────────────────────────────

const routes = {
  "/login": { name: "Login", pageComponent: "BeautyLoginPage" },
  "/": { name: "Subscription", pageComponent: "BeautySubscriptionPage" },
  "/orders": { name: "Orders", pageComponent: "BeautyOrdersPage" },
} as const;

type BlockExtensionsModule = {
  registerBlocks?: () => void;
};

const DEFAULT_EXTENSIONS_VERSION = "1.2.0";

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

  Object.values(beautyBlocks).forEach((block) =>
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

    await editorModule.setupEditorMode({ routerService, themeState }).catch((error: unknown) => {
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

  const shopDomain = import.meta.env.VITE_SHOP_DOMAIN ?? "beauty-box.myshopify.com";
  const useMock = resolveMockMode(import.meta.env.VITE_MOCK_MODE);

  // 2. Create login service
  const loginAdapter = useMock
    ? createMockLoginAdapter()
    : createApiLoginAdapter((path, init) => fetch("/api" + path, init), {
        shopDomain,
        appUrl: window.location.origin,
      });
  const loginServiceInstance = createLoginService({
    adapter: loginAdapter,
    shop: {
      domain: shopDomain,
      locale: preferredLocale,
    },
    router: {
      push({ path }: { path: string }) {
        const routeName = path.replace(/^\//, "") || "subscription";
        navigate(routeName);
      },
      replace(path: string) {
        const routeName = path.replace(/^\//, "") || "subscription";
        navigate(routeName);
      },
    },
    formatError: (error: unknown) => ({
      title: "Error",
      message: error instanceof Error ? error.message : String(error),
    }),
    onLoginSuccess: async () => {
      navigate("subscription");
    },
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

  // 3. Create fetcher (used in non-mock mode; adds auth headers and shop domain)
  const fetcher: ApiFetcher = async (path, init) => {
    const authHeaders = await loginServiceInstance.getAuthHeaders();
    return fetch("/api" + path, {
      ...init,
      headers: {
        "X-Shopify-Shop-Domain": shopDomain,
        ...authHeaders,
        ...(init?.headers ?? {}),
      },
    });
  };

  // 4. Select adapters based on VITE_MOCK_MODE
  const customerAdapter = useMock ? createMockCustomerAdapter() : createApiCustomerAdapter(fetcher);
  const orderAdapter = useMock ? createMockOrderAdapter() : createApiOrderAdapter(fetcher);
  const subscriptionAdapter = useMock
    ? createMockSubscriptionAdapter()
    : createApiSubscriptionAdapter(fetcher);
  const schedulesAdapter = useMock
    ? createMockSchedulesAdapter()
    : createApiSchedulesAdapter(fetcher);

  // 5. Create services
  const customerService = createCustomerService(customerAdapter);
  const orderService = createOrderService(orderAdapter);
  const subscriptionService = createSubscriptionService(subscriptionAdapter);
  const schedulesService = createSchedulesService(schedulesAdapter, {
    hasPendingBilling: subscriptionService.hasPendingBilling,
  });
  const routerService = createBeautyRouterService();

  // 6. Provide contexts
  provideContext(root, LoginServiceContext, loginServiceInstance);
  provideContext(root, CustomerServiceContext, customerService);
  provideContext(root, OrderServiceContext, orderService);
  provideContext(root, SubscriptionServiceContext, subscriptionService);
  provideContext(root, SchedulesServiceContext, schedulesService);
  provideContext(root, RouterServiceContext, routerService);

  await registerBlocksPromise;

  // 7. Setup editor or view mode (sets ThemeStateContext)
  if (isEditorMode()) {
    await setupEditorMode(root, routerService, preferredLocale);
  } else {
    setupViewMode(root, routerService, preferredLocale);
  }

  // 8. Bridge globalStyles → CSS custom properties on :root
  const currentThemeState = injectContext(root, ThemeStateContext);
  if (currentThemeState) {
    effect(() => {
      applyGlobalStyles(document.documentElement, currentThemeState.globalStyles.value);
    });
  }

  // 9. Auth guard — redirect to login when unauthenticated
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

  // 10. Load initial data after auth
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

  // 11. Mount React app (view mode) or render page blocks (editor mode)
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
