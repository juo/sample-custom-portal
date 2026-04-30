import { useState, useEffect, type CSSProperties } from "react";
import { useContext } from "@juo/blocks/react";
import { OrderServiceContext, TranslationContext } from "@juo/blocks";
import type { Order } from "@juo/blocks";

type StatusKey = "delivered" | "skipped" | "scheduled" | "processing";

interface Props {
  title: string;
  emptyMessage: string;
  showItemCount: boolean;
  itemLabelSingular: string;
  itemLabelPlural: string;
  statusDeliveredLabel: string;
  statusSkippedLabel: string;
  statusScheduledLabel: string;
  statusProcessingLabel: string;
  visibleStatuses: StatusKey[];
}

function formatDate(dateStr: string | null, locale: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(locale || "pl", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function statusStyle(status: string): CSSProperties {
  switch (status) {
    case "delivered":
      return { background: "var(--success-100)", color: "var(--success-700)" };
    case "scheduled":
      return { background: "var(--info-100)", color: "var(--info-700)" };
    case "processing":
      return { background: "var(--warning-100)", color: "var(--warning-700)" };
    case "skipped":
    default:
      return { background: "var(--accent-100)", color: "var(--accent-600)" };
  }
}

export function BeautyOrderHistory({
  title,
  emptyMessage,
  showItemCount,
  itemLabelSingular,
  itemLabelPlural,
  statusDeliveredLabel,
  statusSkippedLabel,
  statusScheduledLabel,
  statusProcessingLabel,
  visibleStatuses,
}: Props) {
  const orderService = useContext(OrderServiceContext);
  const translationService = useContext(TranslationContext);
  const [locale] = translationService.locale;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const statusLabels: Record<StatusKey, string> = {
    delivered: statusDeliveredLabel,
    skipped: statusSkippedLabel,
    scheduled: statusScheduledLabel,
    processing: statusProcessingLabel,
  };

  useEffect(() => {
    void orderService.getHistory().then((result) => {
      if (result._tag === "Success") {
        setOrders(result.data);
      }
      setLoading(false);
    });
  }, []);

  const visibleSet = new Set(visibleStatuses);
  const filtered = orders.filter((o) => visibleSet.has(o.status as StatusKey));

  return (
    <div
      className="rounded-card-1 p-xl"
      style={{
        background: "var(--white)",
        border: "1px solid var(--accent-100)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
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
            const count = order.items.length;
            const itemWord = count === 1 ? itemLabelSingular : itemLabelPlural;
            const label = statusLabels[order.status as StatusKey] ?? order.status;
            return (
              <div
                key={order.id}
                className="rounded-card-2 px-lg py-md flex items-center justify-between gap-md"
                style={{ background: "var(--tint-50)", border: "1px solid var(--tint-100)" }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--accent-900)" }}>
                    {formatDate(order.deliveryDate, locale)}
                  </p>
                  {showItemCount && (
                    <p className="text-xs mt-0.5" style={{ color: "var(--accent-400)" }}>
                      {count} {itemWord}
                    </p>
                  )}
                </div>
                <span
                  className="text-xs font-semibold px-sm py-xs rounded-full flex-shrink-0"
                  style={statusStyle(order.status)}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
