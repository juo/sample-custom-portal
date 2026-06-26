import {
  createCustomerService,
  createApiCustomerAdapter,
  createMockCustomerAdapter,
  createProductService,
  createApiProductAdapter,
  createMockProductAdapter,
  createOrdersService,
  createMockOrdersAdapter,
  createSubscriptionService,
  createApiSubscriptionAdapter,
  createMockSubscriptionAdapter,
  createSchedulesService,
  createApiSchedulesAdapter,
  createMockSchedulesAdapter,
  type ApiFetcher,
} from "@juo/blocks";
import type { PortalLoginService } from "./login";

interface CreatePortalServicesOptions {
  // Use mock adapters (no backend) instead of the real API adapters.
  useMock: boolean;
  // Shopify domain used for auth + request headers.
  shopDomain: string;
  // Login service used to attach auth headers to real API requests.
  loginService: PortalLoginService;
}

// Creates every domain service the portal provides via context, selecting the
// mock or real adapter for each based on `useMock`. In real-API mode all
// adapters share one `fetcher` that injects the shop domain + auth headers.
export function createPortalServices({
  useMock,
  shopDomain,
  loginService,
}: CreatePortalServicesOptions) {
  // Used in non-mock mode; adds auth headers and shop domain to every request.
  const fetcher: ApiFetcher = async (path, init) => {
    const authHeaders = await loginService.getAuthHeaders();
    return fetch("/api" + path, {
      ...init,
      headers: {
        "X-Shopify-Shop-Domain": shopDomain,
        ...authHeaders,
        ...(init?.headers ?? {}),
      },
    });
  };

  const customerAdapter = useMock ? createMockCustomerAdapter() : createApiCustomerAdapter(fetcher);
  // Shared with the subscription mock so items added via the upsell block resolve
  // a real title/price from the same catalog the product picker reads from.
  const productAdapter = useMock ? createMockProductAdapter() : createApiProductAdapter(fetcher);
  const subscriptionAdapter = useMock
    ? createMockSubscriptionAdapter({ productAdapter })
    : createApiSubscriptionAdapter(fetcher);
  // The mock schedules adapter projects upcoming orders from the subscription
  // source, so pass the same subscription adapter instance.
  const schedulesAdapter = useMock
    ? createMockSchedulesAdapter(subscriptionAdapter)
    : createApiSchedulesAdapter(fetcher);

  const customerService = createCustomerService({
    adapter: customerAdapter,
    getAccountOrdersUrl: () => `https://${shopDomain}/account`,
  });
  const productService = createProductService(productAdapter);
  // The public @juo/blocks alpha ships only a mock orders adapter; a real-API
  // order-history adapter is not yet exported, so orders run mock-only.
  const ordersService = createOrdersService(createMockOrdersAdapter());
  const subscriptionService = createSubscriptionService(subscriptionAdapter);
  const schedulesService = createSchedulesService(schedulesAdapter, {
    hasPendingBilling: subscriptionService.hasPendingBilling,
  });

  return {
    customerService,
    productService,
    ordersService,
    subscriptionService,
    schedulesService,
  };
}
