import { useState, useEffect } from "react";
import { useContext } from "@juo/blocks/react";
import { OrdersServiceContext, TranslationContext } from "@juo/blocks";
import type { Order } from "@juo/blocks";

// Buckets derived from the raw Shopify `fulfillmentStatus` token on each Order.
// The old singular OrderService exposed schedule-style statuses
// (delivered/skipped/scheduled/processing); the public OrdersService now
// returns real placed orders, so we humanize their fulfillment status instead.
type StatusKey = "fulfilled" | "partially_fulfilled" | "unfulfilled" | "pending";

interface Props {
  title: string;
  emptyMessage: string;
  showItemCount: boolean;
  itemLabelSingular: string;
  itemLabelPlural: string;
  visibleStatuses: StatusKey[];
}

const STATUS_LABEL: Record<StatusKey, string> = {
  fulfilled: "Fulfilled",
  partially_fulfilled: "Partially fulfilled",
  unfulfilled: "Unfulfilled",
  pending: "Pending",
};

function normalizeFulfillment(status: string | null): StatusKey {
  switch ((status ?? "").toUpperCase()) {
    case "FULFILLED":
      return "fulfilled";
    case "PARTIALLY_FULFILLED":
      return "partially_fulfilled";
    case "UNFULFILLED":
      return "unfulfilled";
    default:
      return "pending";
  }
}

function formatDate(dateStr: string | null, locale: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(locale || "en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Map each status bucket to a juo-tag semantic colour variant.
const STATUS_VARIANT: Record<StatusKey, "info" | "success" | "warning" | "neutral"> = {
  fulfilled: "success",
  partially_fulfilled: "warning",
  unfulfilled: "info",
  pending: "neutral",
};

export function CustomOrderHistory({
  title,
  emptyMessage,
  showItemCount,
  itemLabelSingular,
  itemLabelPlural,
  visibleStatuses,
}: Props) {
  const ordersService = useContext(OrdersServiceContext);
  const translationService = useContext(TranslationContext);
  const [locale] = translationService.locale;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void ordersService.getOrders().then((result) => {
      if (result._tag === "Success") {
        setOrders(result.data.items);
      }
      setLoading(false);
    });
  }, []);

  const visibleSet = new Set(visibleStatuses);
  const filtered = orders.filter((o) => visibleSet.has(normalizeFulfillment(o.fulfillmentStatus)));

  return (
    <juo-card level={2} class="block">
      <div className="p-xl">
        <h3 className="text-md font-bold mb-lg" style={{ color: "var(--accent-900)" }}>
          <juo-text prop="title">{title}</juo-text>
        </h3>

        {loading ? (
          <div className="flex flex-col gap-md">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse h-16 rounded-card-2"
                style={{ background: "var(--accent-100)" }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-center py-xl" style={{ color: "var(--accent-400)" }}>
            <juo-text prop="emptyMessage">{emptyMessage}</juo-text>
          </div>
        ) : (
          <div className="flex flex-col gap-md">
            {filtered.map((order) => {
              const count = order.lines.length;
              const itemWord = count === 1 ? itemLabelSingular : itemLabelPlural;
              const status = normalizeFulfillment(order.fulfillmentStatus);
              const label = STATUS_LABEL[status];
              return (
                <div
                  key={order.id}
                  className="rounded-card-2 px-lg py-md flex items-center justify-between gap-md"
                  style={{ background: "var(--tint-50)", border: "1px solid var(--tint-100)" }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: "var(--accent-900)" }}>
                      {formatDate(order.placedAt ?? order.createdAt, locale)}
                    </p>
                    {showItemCount && (
                      <p className="text-xs mt-0.5" style={{ color: "var(--accent-400)" }}>
                        {count} {itemWord}
                      </p>
                    )}
                  </div>
                  <juo-tag variant={STATUS_VARIANT[status]}>{label}</juo-tag>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </juo-card>
  );
}
