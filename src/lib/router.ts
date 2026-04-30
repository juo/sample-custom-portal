import { signal, effect } from "@juo/blocks";
import type { RouterService, RouterNavigationEvent } from "@juo/blocks";
import { getAppCopy } from "../app-locale";

export function isEditorMode(): boolean {
  return window.location.search.includes("editor=true");
}

const routeNameToPath: Record<string, string> = {
  subscription: "/",
  login: "/login",
  orders: "/orders",
  history: "/history",
  aktualnosci: "/aktualnosci",
  adresy: "/adresy",
};

export function getRouteNameFromPathname(pathname: string): string {
  if (pathname === "/login") return "login";
  if (pathname === "/orders") return "orders";
  if (pathname === "/history") return "history";
  if (pathname === "/aktualnosci") return "aktualnosci";
  if (pathname === "/adresy") return "adresy";
  return "subscription";
}

export function getPathFromRouteName(routeName: string): string {
  return routeNameToPath[routeName] ?? `/${routeName}`;
}

export const currentRoute = signal(getRouteNameFromPathname(window.location.pathname));

window.addEventListener("popstate", () => {
  currentRoute.value = getRouteNameFromPathname(window.location.pathname);
});

type NavigateFn = (to: string) => void;
let _navigateFn: NavigateFn | null = null;

export function setNavigateCallback(fn: NavigateFn | null): void {
  _navigateFn = fn;
}

export function navigate(path: string): void {
  const routePath = getPathFromRouteName(path);
  if (_navigateFn) {
    _navigateFn(`${routePath}${window.location.search}`);
    currentRoute.value = path;
  } else {
    const search = window.location.search;
    window.history.pushState({}, "", `${routePath}${search}`);
    currentRoute.value = path;
  }
}

export function createBeautyRouterService(): RouterService {
  const subscribers = new Set<(event: RouterNavigationEvent) => void>();

  effect(() => {
    const route = currentRoute.value;
    const path = getPathFromRouteName(route);
    subscribers.forEach((cb) => cb({ path }));
  });

  return {
    push(to) {
      if (typeof to === "string") {
        navigate(to);
      } else if ("name" in to) {
        navigate(to.name);
      } else {
        navigate(to.path.replace(/^\//, "") || "subscription");
      }
    },
    subscribe(callback) {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    },
    getPages() {
      const { routes } = getAppCopy();
      return [
        { title: routes.login, path: "/login", block: "BeautyLoginPage" },
        { title: routes.subscription, path: "/", block: "BeautySubscriptionPage" },
        { title: routes.orders, path: "/orders", block: "BeautyOrdersPage" },
        { title: routes.history, path: "/history", block: "BeautyOrdersPage" },
        { title: routes.aktualnosci, path: "/aktualnosci", block: "BeautyAktualnosciPage" },
        { title: routes.adresy, path: "/adresy", block: "BeautyAdresyPage" },
      ];
    },
  };
}
