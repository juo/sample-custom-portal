import { useState, useEffect } from "react";
import { useContext } from "@juo/blocks/react";
import { SchedulesServiceContext, TranslationContext } from "@juo/blocks";
import type { ScheduleOrder } from "@juo/blocks";

type DateFormat = "long" | "short" | "numeric";

// Map the schedule order status to a juo-tag semantic colour variant.
const STATUS_VARIANT: Record<string, "info" | "success" | "warning" | "neutral"> = {
  scheduled: "info",
  processing: "warning",
  delivered: "success",
  skipped: "neutral",
};

interface Props {
  title: string;
  deliveryDateLabel: string;
  skipLabel: string;
  skippedMessage: string;
  emptyMessage: string;
  fetchLimit: number;
  dateFormat: DateFormat;
}

function formatDate(dateStr: string, format: DateFormat, locale: string): string {
  const date = new Date(dateStr);
  const resolvedLocale = locale || "en";
  switch (format) {
    case "short":
      return date.toLocaleDateString(resolvedLocale, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    case "numeric":
      return date.toLocaleDateString(resolvedLocale);
    case "long":
    default:
      return date.toLocaleDateString(resolvedLocale, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
  }
}

export function CustomUpcomingOrder({
  title,
  deliveryDateLabel,
  skipLabel,
  skippedMessage,
  emptyMessage,
  fetchLimit,
  dateFormat,
}: Props) {
  const schedulesService = useContext(SchedulesServiceContext);
  const translationService = useContext(TranslationContext);
  const [locale] = translationService.locale;
  // `getUpcomingOrders` is a read-only projection (the old `.upcoming` signal is
  // now `.current`, populated only by `reloadCurrent`), so keep the fetched
  // orders in local state.
  const [orders, setOrders] = useState<ScheduleOrder[]>([]);
  const upcomingOrder: ScheduleOrder | null = orders[0] ?? null;

  const [loading, setLoading] = useState(true);
  const [skipping, setSkipping] = useState(false);
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    void schedulesService.getUpcomingOrders(fetchLimit).then((result) => {
      if (result._tag === "Success") setOrders(result.data);
      setLoading(false);
    });
  }, [fetchLimit]);

  async function handleSkip() {
    if (!upcomingOrder) return;
    setSkipping(true);
    const result = await schedulesService.skipOrder({
      subscriptionId: upcomingOrder.subscriptionId,
    });
    if (result._tag === "Success") {
      setSkipped(true);
    }
    setSkipping(false);
  }

  return (
    <juo-card level={2} class="block">
      <div className="p-xl">
        <h3 className="text-md font-bold mb-lg" style={{ color: "var(--accent-900)" }}>
          <juo-text prop="title">{title}</juo-text>
        </h3>

        {loading ? (
          <div className="animate-pulse flex flex-col gap-md">
            <div
              className="h-4 rounded-card-3"
              style={{ background: "var(--tint-100)", width: "50%" }}
            />
            <div className="h-12 rounded-card-2" style={{ background: "var(--tint-100)" }} />
          </div>
        ) : !upcomingOrder ? (
          <div className="text-sm text-center py-lg" style={{ color: "var(--accent-400)" }}>
            <juo-text prop="emptyMessage">{emptyMessage}</juo-text>
          </div>
        ) : (
          <div className="flex flex-col gap-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: "var(--accent-400)" }}>
                  <juo-text prop="deliveryDateLabel">{deliveryDateLabel}</juo-text>
                </p>
                <p className="text-sm font-semibold" style={{ color: "var(--accent-900)" }}>
                  {formatDate(upcomingOrder.deliveryDate, dateFormat, locale)}
                </p>
              </div>
              <juo-tag variant={STATUS_VARIANT[upcomingOrder.status] ?? "neutral"}>
                {upcomingOrder.status}
              </juo-tag>
            </div>

            <div className="flex flex-col gap-sm">
              {upcomingOrder.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-md rounded-card-2 px-md py-sm"
                  style={{ background: "var(--tint-50)" }}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title ?? "Product"}
                      className="w-10 h-10 rounded-card-3 object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-card-3 flex-shrink-0 flex items-center justify-center"
                      style={{ background: "var(--tint-100)" }}
                    >
                      <span style={{ fontSize: "18px" }}>🛍️</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--accent-900)" }}
                    >
                      {item.title ?? "Product"}
                    </p>
                    <p className="text-xs" style={{ color: "var(--accent-400)" }}>
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {skipped ? (
              <div
                className="w-full py-sm rounded-card-2 text-sm font-medium text-center"
                style={{
                  background: "var(--accent-100)",
                  color: "var(--accent-700)",
                  border: "1px solid var(--accent-200)",
                }}
              >
                <juo-text prop="skippedMessage">{skippedMessage}</juo-text>
              </div>
            ) : (
              <juo-button
                variant="outline"
                class="w-full"
                disabled={skipping}
                onClick={() => void handleSkip()}
              >
                <juo-text prop="skipLabel">{skipLabel}</juo-text>
              </juo-button>
            )}
          </div>
        )}
      </div>
    </juo-card>
  );
}
