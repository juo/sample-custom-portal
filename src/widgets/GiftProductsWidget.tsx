import { useContext } from "@juo/blocks/react";
import { SubscriptionServiceContext, SchedulesServiceContext } from "@juo/blocks";
import type { ScheduleOrderItem } from "@juo/blocks";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { Countdown } from "../components/Countdown";
import { Button } from "../components/Button";
import {
  useGiftProductsWidget,
  type GiftWidgetEntry,
  type ThresholdEntry,
  type GiftItem,
} from "../hooks/useGiftProductsWidget";

// --- Rich text (same pattern as PromotionBanner) ---

type RichTextNode = {
  type: string;
  value?: string;
  url?: string;
  children?: RichTextNode[];
  level?: number;
  listType?: "ordered" | "unordered";
  bold?: boolean;
  italic?: boolean;
};

function renderRichTextNodes(nodes: RichTextNode[] | undefined, keyPrefix: string): ReactNode {
  if (!nodes?.length) return null;
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;
    const children = renderRichTextNodes(node.children, key);
    switch (node.type) {
      case "paragraph":
        return <p key={key}>{children}</p>;
      case "text": {
        let content: ReactNode = node.value ?? null;
        if (node.bold) content = <strong>{content}</strong>;
        if (node.italic) content = <em>{content}</em>;
        return <span key={key}>{content}</span>;
      }
      case "link":
        return (
          <a key={key} href={node.url} target="_blank" rel="noreferrer">
            {children}
          </a>
        );
      case "heading": {
        const level = Math.min(Math.max(node.level ?? 2, 1), 6);
        if (level === 1) return <h1 key={key}>{children}</h1>;
        if (level === 2) return <h2 key={key}>{children}</h2>;
        if (level === 3) return <h3 key={key}>{children}</h3>;
        if (level === 4) return <h4 key={key}>{children}</h4>;
        if (level === 5) return <h5 key={key}>{children}</h5>;
        return <h6 key={key}>{children}</h6>;
      }
      case "list": {
        const ListTag = node.listType === "ordered" ? "ol" : "ul";
        return <ListTag key={key}>{children}</ListTag>;
      }
      case "list-item":
        return <li key={key}>{children}</li>;
      case "root":
        return <div key={key}>{children}</div>;
      default:
        return <span key={key}>{children}</span>;
    }
  });
}

function renderRichText(value: string | null, className?: string): ReactNode {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as RichTextNode;
    if (parsed.type === "root") {
      return <div className={className}>{renderRichTextNodes(parsed.children, "rt")}</div>;
    }
  } catch {
    if (value.trim().startsWith("<")) {
      return <div className={className} dangerouslySetInnerHTML={{ __html: value }} />;
    }
  }
  return <div className={className}>{value}</div>;
}

// --- Helpers ---

function cleanGiftTitle(title: string): string {
  return title
    .replace(/\b(GRATIS|PREZENT)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function numericId(id: string | null | undefined): string {
  if (!id) return "";
  return id.split("/").pop() ?? id;
}

function isProductInOrder(productId: string, items: ScheduleOrderItem[]): boolean {
  const nId = numericId(productId);
  return items.some((item) => numericId(item.productId) === nId);
}

function isAnyGiftFromThresholdAdded(
  threshold: ThresholdEntry,
  items: ScheduleOrderItem[],
): boolean {
  return threshold.gifts.some((g) => isProductInOrder(g.gift.id, items));
}

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const ts = Date.parse(value);
  return isNaN(ts) ? null : new Date(ts);
}

function isWidgetActive(entry: GiftWidgetEntry, now: Date): boolean {
  const start = parseDate(entry.activationStart);
  const end = parseDate(entry.activationEnd);
  if (!start || !end) return true;
  return now >= start && now <= end;
}

function isOrderDateInRange(entry: GiftWidgetEntry, orderDate: Date | null): boolean {
  const start = parseDate(entry.activationStart);
  const end = parseDate(entry.activationEnd);
  if (!start || !end || !orderDate) return true;
  return orderDate >= start && orderDate <= end;
}

// --- Lock modal ---

function LockModal({ reasons, onClose }: { reasons: string[]; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div ref={ref} className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
        <ul className="flex flex-col gap-3 text-sm text-black">
          {reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-lg border border-gray-200 py-2 text-sm font-medium"
        >
          Zamknij
        </button>
      </div>
    </div>
  );
}

// --- Gift card ---

function GiftCard({
  item,
  threshold,
  orderItems,
  subscriptionId,
  selectedVariantId,
  onVariantChange,
  isLocked,
  lockReasons,
}: {
  item: GiftItem;
  threshold: ThresholdEntry;
  orderItems: ScheduleOrderItem[];
  subscriptionId: string | null;
  selectedVariantId: string;
  onVariantChange: (variantId: string) => void;
  isLocked: boolean;
  lockReasons: string[];
}) {
  const subscriptionService = useContext(SubscriptionServiceContext);
  const [adding, setAdding] = useState(false);
  const [lockModalOpen, setLockModalOpen] = useState(false);

  const { gift, redirect } = item;
  const productHref = redirect ? `/products/${redirect.handle}` : `/products/${gift.handle}`;
  const isAdded = isProductInOrder(gift.id, orderItems);
  const isAnyAdded = isAnyGiftFromThresholdAdded(threshold, orderItems);
  const isAddedOther = !isAdded && isAnyAdded;
  const imageUrl = gift.variants[0]?.imageUrl ?? gift.mediaUrl ?? null;
  const validVariants = gift.variants;

  async function handleAdd() {
    if (!subscriptionId || isLocked || isAdded || isAddedOther || adding) return;
    setAdding(true);
    await subscriptionService.addUpsellProduct({
      subscriptionId,
      variantId: selectedVariantId,
      quantity: 1,
      oneTime: true,
    });
    setAdding(false);
    window.location.reload();
  }

  let buttonLabel: ReactNode = "DODAJ";
  if (isAdded) {
    buttonLabel = (
      <span className="flex items-center gap-1.5">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path
            d="M1.5 6.5L5 10L11.5 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        DODANO
      </span>
    );
  } else if (isAddedOther) {
    buttonLabel = (
      <span className="flex items-center gap-1.5">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path
            d="M2.20855 10.4581L10.4582 2.20854M12.1667 6.33333C12.1667 9.55499 9.55505 12.1667 6.33337 12.1667C3.11169 12.1667 0.5 9.55499 0.5 6.33333C0.5 3.11167 3.11169 0.5 6.33337 0.5C9.55505 0.5 12.1667 3.11167 12.1667 6.33333Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        DODANO INNY
      </span>
    );
  }

  const buttonDisabled = isAdded || isAddedOther || isLocked || adding;

  return (
    <>
      {lockModalOpen && <LockModal reasons={lockReasons} onClose={() => setLockModalOpen(false)} />}
      <div
        className={`gift-product flex gap-3 rounded-lg bg-white p-3 ${isLocked ? "gift-product-locked opacity-60" : ""}`}
        style={isAdded ? { border: "1px solid #C7C7C7" } : { border: "1px solid transparent" }}
      >
        {/* Image */}
        <div className="relative flex-shrink-0">
          <a href={productHref} target="_blank" rel="noreferrer" className="block">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={gift.title}
                width={93}
                height={93}
                className="h-[93px] w-[93px] rounded object-cover"
              />
            ) : (
              <div className="h-[60px] w-[60px] rounded bg-gray-100" />
            )}
            <span className="gifts-badge rounded-full absolute left-1.5 top-1.5 bg-pink100 px-1.5 py-0.5 text-10 font-medium uppercase text-white tracking-[0.2px] leading-[12px]">
              PREZENT
            </span>
          </a>
        </div>

        {/* Right side */}
        <div className="gift-product-right flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-start justify-between gap-4">
            <a
              href={productHref}
              target="_blank"
              rel="noreferrer"
              className="product-title min-w-0 text-[13px] font-medium leading-tight text-black hover:underline"
            >
              {cleanGiftTitle(gift.title)}
            </a>
            <div className="gift-product-prices flex-shrink-0 text-right">
              <p className="gift-compare-price text-[11px] leading-tight flex flex-col">
                <span className="text-[12px] font-semibold leading-[17.4px] tracking-[0.24px] text-pink100">
                  0,01 zł
                </span>
                {gift.compareAtPrice > 0 && (
                  <span className="text-[12px] leading-[17.4px] tracking-[0.24px] text-gray60 line-through">
                    {gift.compareAtPrice.toFixed(2)} zł
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Variant selector */}
          {validVariants.length > 1 && (
            <div className="gift-variants-select">
              <select
                className="gift-variants-selector w-full rounded border border-gray-200 px-2 py-1 text-[12px]"
                value={selectedVariantId}
                onChange={(e) => onVariantChange(e.target.value)}
              >
                {validVariants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="gift-product-actions flex items-center gap-2 mt-auto">
            <Button
              disabled={buttonDisabled}
              onClick={() => void handleAdd()}
              variant={isAdded || isAddedOther || isLocked ? "muted" : "primary"}
              className={`gift-button min-w-[156px] ${isAdded ? "cursor-default" : ""} ${adding ? "opacity-50" : ""}`}
            >
              {adding ? (
                <span className="inline-block h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
              ) : (
                buttonLabel
              )}
            </Button>

            {isLocked && lockReasons.length > 0 && (
              <button
                type="button"
                className="gift-lock-info-button flex-shrink-0 text-gray-400 hover:text-gray-600"
                aria-label="Dlaczego prezent jest zablokowany?"
                onClick={() => setLockModalOpen(true)}
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path
                    d="M7.16667 9.83333V7.16667M7.16667 4.5H7.17333M13.8333 7.16667C13.8333 10.8486 10.8486 13.8333 7.16667 13.8333C3.48477 13.8333 0.5 10.8486 0.5 7.16667C0.5 3.48477 3.48477 0.5 7.16667 0.5C10.8486 0.5 13.8333 3.48477 13.8333 7.16667Z"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// --- Threshold section ---

function ThresholdSection({
  threshold,
  index,
  orderItems,
  orderTotal,
  subscriptionId,
  isOrderDateActive,
  selectedVariants,
  onVariantChange,
}: {
  threshold: ThresholdEntry;
  index: number;
  orderItems: ScheduleOrderItem[];
  orderTotal: number;
  subscriptionId: string | null;
  isOrderDateActive: boolean;
  selectedVariants: Record<string, string>;
  onVariantChange: (productId: string, variantId: string) => void;
}) {
  console.log("orderTotal1§§§§§§§§§§", orderTotal);
  const isThresholdMet = orderTotal >= threshold.threshold;
  const isLocked = !isThresholdMet || !isOrderDateActive;

  const lockReasons: string[] = [];
  if (!isThresholdMet)
    lockReasons.push("Twoje zamówienie musi znajdować się w określonym przedziale cenowym");
  if (!isOrderDateActive)
    lockReasons.push("Data najbliższego zamówienia nie mieści się w zakresie dat promocji.");

  return (
    <div className={`gift-threshold gift-threshold-${index} flex flex-col gap-2`}>
      <p className="gift-threshold-value text-[13px] font-semibold text-black">
        <span className="rounded-full px-1.5 py-0.5 text-10 font-medium bg-pink tracking-[0.2px] leading-[12px]">
          od {threshold.threshold} zł
        </span>
      </p>

      {threshold.gifts.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {threshold.gifts.map((item) => {
            const selectedVariantId =
              selectedVariants[item.gift.id] ?? item.gift.variants[0]?.id ?? "";
            return (
              <div key={item.gift.id} className="w-[calc(100%-12px)] flex-shrink-0">
                <GiftCard
                  item={item}
                  threshold={threshold}
                  orderItems={orderItems}
                  subscriptionId={subscriptionId}
                  selectedVariantId={selectedVariantId}
                  onVariantChange={(v) => onVariantChange(item.gift.id, v)}
                  isLocked={isLocked}
                  lockReasons={lockReasons}
                />
              </div>
            );
          })}
        </div>
      ) : (
        threshold.gifts[0] && (
          <GiftCard
            item={threshold.gifts[0]}
            threshold={threshold}
            orderItems={orderItems}
            subscriptionId={subscriptionId}
            selectedVariantId={
              selectedVariants[threshold.gifts[0].gift.id] ??
              threshold.gifts[0].gift.variants[0]?.id ??
              ""
            }
            onVariantChange={(v) => onVariantChange(threshold.gifts[0]!.gift.id, v)}
            isLocked={isLocked}
            lockReasons={lockReasons}
          />
        )
      )}
    </div>
  );
}

// --- Main widget ---

export function GiftProductsWidget() {
  const { entry, isLoading, isError } = useGiftProductsWidget();
  const subscriptionService = useContext(SubscriptionServiceContext);
  const schedulesService = useContext(SchedulesServiceContext);

  const [current] = subscriptionService.current;
  const [upcoming] = schedulesService.upcoming;

  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  useEffect(() => {
    void schedulesService.getUpcomingOrders(1);
  }, []);

  if (isLoading || isError || !entry) return null;
  if (!entry.thresholds.length) return null;
  if (!upcoming[0]) return null;

  const orderItems: ScheduleOrderItem[] = (upcoming[0].items ?? []) as ScheduleOrderItem[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderTotal: number = (upcoming[0] as any).subtotal ?? 0;

  const subscriptionId = current?.id ?? null;
  const nextOrderDate = upcoming[0]?.deliveryDate ? new Date(upcoming[0].deliveryDate) : null;
  const orderDateActive = isOrderDateInRange(entry, nextOrderDate);
  const countdownEndDate = parseDate(entry.countdownEndDate);

  function handleVariantChange(productId: string, variantId: string) {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variantId }));
  }

  return (
    <div
      className="widget-gift-component overflow-hidden rounded-lg bg-gray-50 max-w-[410px]"
      style={{ boxShadow: "0 0 12px 0 rgba(255, 174, 207, 0.40)" }}
    >
      {/* Countdown header */}
      {countdownEndDate && (
        <div
          className="widget-gift-date relative flex items-center justify-between bg-pink100 px-4 pb-4 pt-2.5"
          style={{ borderRadius: "8px 8px 0 0" }}
        >
          <div className="absolute bottom-[-1px]  left-0 right-0 h-[9px] w-full rounded-t-[8px] bg-gray-50" />
          <div className="widget-gift-countdown-heading text-[13px] font-medium text-white">
            Ta promocja znika za:
          </div>
          <Countdown endDate={countdownEndDate} />
        </div>
      )}

      {/* Header */}
      <div className="widget-gift-header px-4 pb-3 pt-2">
        <h2 className="mb-2 pb-0 font-ivyPresto text-[24px] font-light not-italic leading-[120%] tracking-[0.72px] text-black [font-feature-settings:'liga'_off]">
          {entry.title}
        </h2>
        {renderRichText(
          entry.description,
          "description mt-1 text-[13px] [&_p]:m-0 [&_a]:underline text-black",
        )}
      </div>

      {/* Thresholds */}
      <div className="gifts-wrapper flex flex-col gap-4 px-4 pb-4">
        {entry.thresholds.map((threshold, index) => (
          <ThresholdSection
            key={threshold.id}
            threshold={threshold}
            index={index}
            orderItems={orderItems}
            orderTotal={orderTotal}
            subscriptionId={subscriptionId}
            isOrderDateActive={orderDateActive}
            selectedVariants={selectedVariants}
            onVariantChange={handleVariantChange}
          />
        ))}

        {entry.bottomMessage && (
          <div className="widget-gift-footer rounded-[4px] border border-[#8692CE] bg-[#f2f5fb] p-4 text-[12px] font-normal leading-[17.4px] tracking-[0.24px] text-[#4C5187]">
            {renderRichText(
              entry.bottomMessage,
              "[&_*]:text-[12px] [&_*]:leading-[1.45] [&_*]:text-[#4C5187] [&_*]:font-quasimoda [&_*]:font-normal [&_*]:tracking-[.01em] [&_*]:text-left [&_p]:m-0 [&_a]:underline [&_strong]:font-bold [&_b]:font-bold",
            )}
          </div>
        )}
      </div>
    </div>
  );
}
