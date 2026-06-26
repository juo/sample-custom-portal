import { createLoginService, createApiLoginAdapter, createMockLoginAdapter } from "@juo/blocks";
import { navigate } from "./router";

interface CreatePortalLoginServiceOptions {
  // Use the mock login adapter (no backend) instead of the real API adapter.
  useMock: boolean;
  // Shopify domain used for auth + request headers.
  shopDomain: string;
  // Preferred UI locale (e.g. derived from the browser).
  locale: string;
}

// Creates the login service, picking the mock or real adapter based on
// `useMock`. The router shim translates the service's path-based navigation
// into the sample's route-name navigation (empty path → "subscription").
export function createPortalLoginService({
  useMock,
  shopDomain,
  locale,
}: CreatePortalLoginServiceOptions) {
  const adapter = useMock
    ? createMockLoginAdapter()
    : createApiLoginAdapter((path, init) => fetch("/api" + path, init), {
        shopDomain,
        appUrl: window.location.origin,
      });

  return createLoginService({
    adapter,
    shop: {
      domain: shopDomain,
      locale,
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
}

export type PortalLoginService = ReturnType<typeof createPortalLoginService>;
