import { useState, useEffect, type CSSProperties } from "react";
import { useContext } from "@juo/blocks/react";
import { SchedulesServiceContext, TranslationContext } from "@juo/blocks";
import type { ScheduleOrder } from "@juo/blocks";

type DateFormat = "long" | "short" | "numeric";

interface Props {
  title: string;
  deliveryDateLabel: string;
  skipLabel: string;
  skippedMessage: string;
  emptyMessage: string;
  fallbackProductTitle: string;
  quantityLabel: string;
  statusDeliveredLabel: string;
  statusSkippedLabel: string;
  statusScheduledLabel: string;
  statusProcessingLabel: string;
  fetchLimit: number;
  dateFormat: DateFormat;
}

function formatDate(dateStr: string | null | undefined, format: DateFormat, locale: string): string {
  if (!dateStr) return "—";

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "—";

  const resolvedLocale = locale || "pl";
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

function statusStyle(status: string): CSSProperties {
  switch (status) {
    case "scheduled":
      return { background: "var(--info-100)", color: "var(--info-700)" };
    case "processing":
      return { background: "var(--warning-100)", color: "var(--warning-700)" };
    case "delivered":
      return { background: "var(--success-100)", color: "var(--success-700)" };
    case "skipped":
      return { background: "var(--accent-100)", color: "var(--accent-600)" };
    default:
      return { background: "var(--accent-100)", color: "var(--accent-600)" };
  }
}

export function BeautyUpcomingOrder({
  title,
  deliveryDateLabel,
  skipLabel,
  skippedMessage,
  emptyMessage,
  fallbackProductTitle,
  quantityLabel,
  statusDeliveredLabel,
  statusSkippedLabel,
  statusScheduledLabel,
  statusProcessingLabel,
  fetchLimit,
  dateFormat,
}: Props) {
  const schedulesService = useContext(SchedulesServiceContext);
  const translationService = useContext(TranslationContext);
  const [locale] = translationService.locale;
  const [upcoming, setUpcoming] = schedulesService.upcoming;
  const upcomingOrder: ScheduleOrder | null = upcoming[0] ?? null;
  const statusLabels: Record<string, string> = {
    delivered: statusDeliveredLabel,
    skipped: statusSkippedLabel,
    scheduled: statusScheduledLabel,
    processing: statusProcessingLabel,
  };

  const [loading, setLoading] = useState(true);
  const [skipping, setSkipping] = useState(false);
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    void schedulesService.getUpcomingOrders(fetchLimit).then(() => setLoading(false));
  }, [fetchLimit]);

  async function handleSkip() {
    if (!upcomingOrder) return;
    setSkipping(true);
    const result = await schedulesService.skipOrder({
      subscriptionId: upcomingOrder.subscriptionId,
      date: upcomingOrder.deliveryDate,
    });
    if (result._tag === "Success") {
      setSkipped(true);
    }
    setSkipping(false);
  }

  // suppress unused warning – setUpcoming is provided by the blocks signal tuple
  void setUpcoming;

  return (
    <div
      className="rounded-card-1 p-xl"
      style={{
        background: "var(--white)",
        border: "1px solid var(--tint-100)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
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
            <span
              className="text-xs font-semibold px-sm py-xs rounded-full"
              style={statusStyle(upcomingOrder.status)}
            >
              {statusLabels[upcomingOrder.status] ?? upcomingOrder.status}
            </span>
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
                    alt={item.title ?? fallbackProductTitle}
                    className="w-10 h-10 rounded-card-3 object-cover flex-shrink-0"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-card-3 flex-shrink-0 flex items-center justify-center"
                    style={{ background: "var(--tint-100)" }}
                  >
                    <span style={{ fontSize: "18px" }}>💄</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: "var(--accent-900)" }}
                  >
                    {item.title ?? fallbackProductTitle}
                  </p>
                  <p className="text-xs" style={{ color: "var(--accent-400)" }}>
                    {quantityLabel}: {item.quantity}
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
            <button
              onClick={() => void handleSkip()}
              disabled={skipping}
              className="w-full py-sm rounded-card-2 text-sm font-medium transition-opacity"
              style={{
                border: "1px solid var(--secondary-700)",
                background: "var(--white)",
                color: "var(--secondary-700)",
                borderRadius: "var(--buttons-rounding)",
                cursor: "pointer",
                opacity: skipping ? 0.5 : 1,
              }}
            >
              <juo-text prop="skipLabel">{skipLabel}</juo-text>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
