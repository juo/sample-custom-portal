import { useState, useEffect } from "react";
import { useContext } from "@juo/blocks/react";
import { SubscriptionServiceContext, SchedulesServiceContext } from "@juo/blocks";
import type { UpsellProduct } from "@juo/blocks";

type Layout = "carousel" | "grid";

interface Props {
  title: string;
  addLabel: string;
  addedLabel: string;
  emptyMessage: string;
  layout: Layout;
  columns: number;
  cardWidth: number;
  showPrice: boolean;
  fallbackImageUrl: string;
  fallbackImageAlt: string;
}

export function BeautyUpsell({
  title,
  addLabel,
  addedLabel,
  emptyMessage,
  layout,
  columns,
  cardWidth,
  showPrice,
  fallbackImageUrl,
  fallbackImageAlt,
}: Props) {
  const subscriptionService = useContext(SubscriptionServiceContext);
  const schedulesService = useContext(SchedulesServiceContext);

  const [current] = subscriptionService.current;
  const [upcoming, setUpcoming] = schedulesService.upcoming;

  const subscriptionId = current?.id ?? null;

  const [products, setProducts] = useState<UpsellProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState(new Set<string>());
  const [failedProductImageIds, setFailedProductImageIds] = useState(new Set<string>());

  useEffect(() => {
    if (!subscriptionId) return;
    setLoading(true);
    void subscriptionService.getUpsellProducts({ subscriptionId }).then((result) => {
      if (result._tag === "Success") {
        setProducts(result.data);
      }
      setLoading(false);
    });
  }, [subscriptionId]);

  async function handleAdd(product: UpsellProduct) {
    const subId = current?.id;
    if (!subId || addedIds.has(product.id)) return;
    setAddingId(product.id);
    const result = await subscriptionService.addUpsellProduct({
      subscriptionId: subId,
      variantId: product.variantId,
      quantity: 1,
    });
    if (result._tag === "Success") {
      setAddedIds((prev) => new Set([...prev, product.id]));

      if (upcoming[0]) {
        setUpcoming([
          {
            ...upcoming[0],
            items: [
              ...upcoming[0].items,
              {
                id: `upsell-${product.id}-${Date.now()}`,
                productId: product.id,
                variantId: product.variantId,
                quantity: 1,
                title: product.title,
                imageUrl: product.imageUrl,
              },
            ],
          },
          ...upcoming.slice(1),
        ]);
      }
    }
    setAddingId(null);
  }

  const isGrid = layout === "grid";
  const containerClass = isGrid ? "grid gap-md" : "flex gap-md overflow-x-auto pb-sm";
  const containerStyle = isGrid
    ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
    : undefined;
  const cardStyle = isGrid
    ? { border: "1px solid var(--accent-100)" }
    : { width: `${cardWidth}px`, border: "1px solid var(--accent-100)" };
  const cardClass = isGrid
    ? "rounded-card-1 flex flex-col overflow-hidden"
    : "flex-shrink-0 rounded-card-1 flex flex-col overflow-hidden";

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
        <div className={containerClass} style={containerStyle}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`animate-pulse h-48 rounded-card-1 ${isGrid ? "" : "flex-shrink-0"}`}
              style={
                isGrid
                  ? { background: "var(--accent-100)" }
                  : { background: "var(--accent-100)", width: `${cardWidth}px` }
              }
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-sm text-center py-lg" style={{ color: "var(--accent-400)" }}>
          <juo-text prop="emptyMessage">{emptyMessage}</juo-text>
        </div>
      ) : (
        <div className={containerClass} style={containerStyle}>
          {products.map((product) => {
            const isAdded = addedIds.has(product.id);
            const isAdding = addingId === product.id;
            const showProductImage =
              Boolean(product.imageUrl) && !failedProductImageIds.has(product.id);
            const imageAlt = showProductImage ? product.title : fallbackImageAlt;
            return (
              <div key={product.id} className={cardClass} style={cardStyle}>
                <div
                  className="h-28 flex items-center justify-center"
                  style={{ background: "var(--tint-50)" }}
                >
                  {showProductImage || fallbackImageUrl ? (
                    <img
                      src={showProductImage ? product.imageUrl : fallbackImageUrl}
                      alt={imageAlt}
                      className="w-full h-full object-cover"
                      onError={() => {
                        if (showProductImage) {
                          setFailedProductImageIds((prev) => new Set([...prev, product.id]));
                        }
                      }}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--accent-100) 0%, var(--accent-50) 100%)",
                        color: "var(--accent-700)",
                        fontSize: "28px",
                      }}
                    >
                      ✨
                    </div>
                  )}
                </div>
                <div className="p-md flex flex-col gap-xs">
                  <p
                    className="text-xs font-semibold leading-tight"
                    style={{ color: "var(--accent-900)" }}
                  >
                    {product.title}
                  </p>
                  {showPrice && (
                    <p className="text-xs" style={{ color: "var(--primary)" }}>
                      {product.price.amount} {product.price.currencyCode}
                    </p>
                  )}
                  <button
                    onClick={() => void handleAdd(product)}
                    disabled={isAdded || isAdding}
                    className="w-full py-xs rounded-card-3 text-xs font-semibold transition-all"
                    style={
                      isAdded
                        ? {
                            background: "var(--success-100)",
                            color: "var(--success-700)",
                            border: "1px solid var(--success-200)",
                            borderRadius: "var(--buttons-rounding)",
                            cursor: "default",
                          }
                        : {
                            background: "var(--white)",
                            color: "var(--secondary-700)",
                            border: "1px solid var(--secondary-700)",
                            borderRadius: "var(--buttons-rounding)",
                            cursor: "pointer",
                            opacity: isAdding ? 0.5 : 1,
                          }
                    }
                  >
                    {isAdded ? addedLabel : addLabel}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
