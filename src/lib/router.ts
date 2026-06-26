import { signal, effect } from "@juo/blocks";
import type { RouterService } from "@juo/blocks";

// `RouterNavigationEvent` is no longer part of the public @juo/blocks barrel;
// the subscribe callback receives a plain `{ path }` payload.
type RouterNavigationEvent = { path: string };

export function isEditorMode(): boolean {
  return window.location.search.includes("editor=true");
}

const routeNameToPath: Record<string, string> = {
  subscription: "/",
  login: "/login",
  orders: "/orders",
};

export function getRouteNameFromPathname(pathname: string): string {
  if (pathname === "/login") return "login";
  if (pathname === "/orders") return "orders";
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

export function createCustomRouterService(): RouterService {
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
      return [
        { title: "Login", path: "/login", block: "CustomLoginPage", routeNames: ["login"] },
        {
          title: "Subscription",
          path: "/",
          block: "CustomSubscriptionPage",
          routeNames: ["subscription"],
        },
        { title: "Orders", path: "/orders", block: "CustomOrdersPage", routeNames: ["orders"] },
      ];
    },
  };
}
