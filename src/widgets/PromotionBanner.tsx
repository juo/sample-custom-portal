import { useContext } from "@juo/blocks/react";
import { CustomerServiceContext } from "@juo/blocks";
import { useEffect, useState, type ReactNode } from "react";
import { Countdown, useNow } from "../components/Countdown";
import {
  getField,
  getFieldReference,
  usePromotionBanner,
  type MetaobjectNode,
} from "../hooks/usePromotionBanner";

const PROMO_BANNER_CONTENT_CLASS =
  "promo-banner-content mt-0.5 text-[13px] font-medium leading-[145%] tracking-[0.26px] text-black [&_*]:text-[13px] [&_*]:font-medium [&_*]:leading-[145%] [&_*]:tracking-[0.26px] [&_a]:text-black [&_a]:underline [&_p]:m-0 [&_b]:font-bold [&_strong]:font-bold";

const PROMO_BANNER_BOTTOM_CLASS =
  "promo-banner-content bottom mt-0.5 text-[11px] font-medium leading-[145%] tracking-[0.22px] text-text-secondary [&_*]:text-[11px] [&_*]:font-medium [&_*]:leading-[145%] [&_*]:tracking-[0.22px] [&_*]:text-text-secondary [&_a]:underline [&_p]:m-0 [&_b]:font-bold [&_strong]:font-bold";

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

function parseDate(value: string | null): Date | null {
  if (!value) return null;

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : new Date(timestamp);
}

function getReferenceFieldValue(
  field: Array<{ key: string; value: string | null }>,
  key: string,
): string | null {
  return field.find((item) => item.key === key)?.value ?? null;
}

function getActivationSchedule(entry: MetaobjectNode) {
  const reference = getFieldReference(entry.fields, "activation_schedule");

  if (!reference || reference.__typename !== "Metaobject") return null;

  return {
    startDate: parseDate(getReferenceFieldValue(reference.fields, "start_date")),
    endDate: parseDate(getReferenceFieldValue(reference.fields, "end_date")),
  };
}

function isBannerEnabled(entry: MetaobjectNode, now: Date) {
  const schedule = getActivationSchedule(entry);
  if (!schedule?.startDate || !schedule.endDate) return true;

  return now >= schedule.startDate && now < schedule.endDate;
}

function getCounterState(entry: MetaobjectNode, now: Date) {
  const counterMode = getField(entry.fields, "counter");
  const counterEndDate = parseDate(getField(entry.fields, "counter_end_date"));

  const showCounter = counterMode === "Enabled" || counterMode === "Enabled for only last 24h";
  const showCounterLastDay = counterMode === "Enabled for only last 24h";

  if (!showCounter || !counterEndDate) {
    return { hasCounter: false, counterEndDate: null as Date | null };
  }

  const remainingMs = counterEndDate.getTime() - now.getTime();
  if (remainingMs <= 0) {
    return { hasCounter: false, counterEndDate };
  }

  if (showCounterLastDay && remainingMs >= 24 * 60 * 60 * 1000) {
    return { hasCounter: false, counterEndDate };
  }

  return { hasCounter: true, counterEndDate };
}

function getBannerImage(entry: MetaobjectNode) {
  const reference = getFieldReference(entry.fields, "banner");

  if (!reference || reference.__typename !== "MediaImage") return null;

  return reference.image;
}

function renderRichTextNodes(nodes: RichTextNode[] | undefined, keyPrefix: string): ReactNode {
  if (!nodes?.length) return null;

  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;
    const children = renderRichTextNodes(node.children, key);

    switch (node.type) {
      case "paragraph":
        return (
          <p key={key} className="mt-0.5">
            {children}
          </p>
        );
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

function renderRichText(value: string | null, className?: string) {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as RichTextNode;

    if (parsed.type === "root") {
      return <div className={className}>{renderRichTextNodes(parsed.children, "rich-text")}</div>;
    }
  } catch {
    if (value.trim().startsWith("<")) {
      return <div className={className} dangerouslySetInnerHTML={{ __html: value }} />;
    }
  }

  return <div className={className}>{value}</div>;
}

function useCustomerPresence() {
  const customerService = useContext(CustomerServiceContext);
  const [hasCustomer, setHasCustomer] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void customerService.getCurrent().then((result) => {
      if (cancelled) return;

      setHasCustomer(result._tag === "Success" && Boolean(result.data));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return hasCustomer;
}

function CopyIcon() {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1 7.6875L1 3.94444C1 2.59441 2.18197 1.5 3.64 1.5L7.6825 1.5M4.96 12.5L9.415 12.5C10.2351 12.5 10.9 11.8844 10.9 11.125L10.9 5.16667C10.9 4.40728 10.2351 3.79167 9.415 3.79167L4.96 3.79167C4.13986 3.79167 3.475 4.40727 3.475 5.16667L3.475 11.125C3.475 11.8844 4.13986 12.5 4.96 12.5Z"
        stroke="black"
        strokeLinecap="round"
      />
      <path
        d="M1 7.6875L1 3.94444C1 2.59441 2.18197 1.5 3.64 1.5L7.6825 1.5M4.96 12.5L9.415 12.5C10.2351 12.5 10.9 11.8844 10.9 11.125L10.9 5.16667C10.9 4.40728 10.2351 3.79167 9.415 3.79167L4.96 3.79167C4.13986 3.79167 3.475 4.40727 3.475 5.16667L3.475 11.125C3.475 11.8844 4.13986 12.5 4.96 12.5Z"
        stroke="black"
        strokeOpacity="0.2"
        strokeLinecap="round"
      />
      <path
        d="M1 7.6875L1 3.94444C1 2.59441 2.18197 1.5 3.64 1.5L7.6825 1.5M4.96 12.5L9.415 12.5C10.2351 12.5 10.9 11.8844 10.9 11.125L10.9 5.16667C10.9 4.40728 10.2351 3.79167 9.415 3.79167L4.96 3.79167C4.13986 3.79167 3.475 4.40727 3.475 5.16667L3.475 11.125C3.475 11.8844 4.13986 12.5 4.96 12.5Z"
        stroke="black"
        strokeOpacity="0.2"
        strokeLinecap="round"
      />
      <path
        d="M1 7.6875L1 3.94444C1 2.59441 2.18197 1.5 3.64 1.5L7.6825 1.5M4.96 12.5L9.415 12.5C10.2351 12.5 10.9 11.8844 10.9 11.125L10.9 5.16667C10.9 4.40728 10.2351 3.79167 9.415 3.79167L4.96 3.79167C4.13986 3.79167 3.475 4.40727 3.475 5.16667L3.475 11.125C3.475 11.8844 4.13986 12.5 4.96 12.5Z"
        stroke="black"
        strokeOpacity="0.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PromotionBanner() {
  const { entries, isLoading, isError } = usePromotionBanner();
  const hasCustomer = useCustomerPresence();
  const now = useNow();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!copiedCode) return;

    const timeout = window.setTimeout(() => {
      setCopiedCode(null);
    }, 2000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [copiedCode]);

  if (isLoading || isError || !entries.length) return null;

  const visibleEntries = entries.filter((entry) => isBannerEnabled(entry, now));
  if (!visibleEntries.length) return null;

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
    } catch {
      setCopiedCode(null);
    }
  }

  return (
    <>
      {visibleEntries.map((entry) => {
        const title = getField(entry.fields, "title") ?? "PROMOCJA!";
        const image = getBannerImage(entry);
        const promotionCode = getField(entry.fields, "promotion_code");
        const textContent = getField(entry.fields, "text_content");
        const loggedOutTextContent = getField(entry.fields, "not_logged_in_text_content");
        const bottomMessage = getField(entry.fields, "bottom_message");
        const contentValue =
          !hasCustomer && loggedOutTextContent ? loggedOutTextContent : textContent;
        const { hasCounter, counterEndDate } = getCounterState(entry, now);

        return (
          <div
            key={entry.id}
            className="promotion-banner max-w-[410px] mb-5 flex flex-col overflow-hidden rounded-lg"
            style={{ boxShadow: "0 0 12px 0 rgba(255, 174, 207, 0.40)" }}
          >
            {image && (
              <img
                src={image.url}
                alt={image.altText ?? title}
                width={image.width ?? undefined}
                height={image.height ?? undefined}
                className="w-full object-cover"
                style={{ aspectRatio: "41 / 14" }}
              />
            )}

            <div className="promo-banner-header relative flex items-center justify-between gap-2 rounded-t-lg bg-pink100 px-4 pb-4 pt-2">
              <div className="absolute bottom-[-1px] left-0 right-0 h-[9px] w-full rounded-t-[8px] bg-white" />
              <div className="relative z-10 leading-tight text-13 font-semibold tracking-[0.26px] text-white">
                {title}
              </div>
              {hasCounter && counterEndDate && (
                <Countdown
                  endDate={counterEndDate}
                  className="relative z-10 flex h-fit grow-0 items-center gap-[6px] rounded-sm pl-[6px] text-[12px] font-semibold leading-[17px] tracking-[-0.12px] text-white"
                />
              )}
            </div>

            <div className="flex flex-col gap-3 rounded-b-lg bg-white px-4 pb-[14px] pt-[3px]">
              {renderRichText(contentValue, PROMO_BANNER_CONTENT_CLASS)}

              {promotionCode && (
                <div className="mt-0.5 flex items-baseline gap-1.5">
                  <span className={PROMO_BANNER_CONTENT_CLASS}>
                    <span>Kod</span>
                  </span>
                  <button
                    type="button"
                    className="promotion-banner-button inline-flex w-fit items-center gap-1 border-0 rounded-[24px] px-[6px] py-[4px] font-quasimoda text-[11px] font-semibold uppercase tracking-[1.76px] text-black"
                    style={{ background: "#FECCE1" }}
                    onClick={() => {
                      void copyCode(promotionCode);
                    }}
                  >
                    {copiedCode === promotionCode ? "Skopiowano" : promotionCode}
                    <CopyIcon />
                  </button>
                </div>
              )}

              {renderRichText(bottomMessage, PROMO_BANNER_BOTTOM_CLASS)}
            </div>
          </div>
        );
      })}
    </>
  );
}
