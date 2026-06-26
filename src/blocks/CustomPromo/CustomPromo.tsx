import { useEffect, useState } from "react";
import { useContext } from "@juo/blocks/react";
import { SubscriptionServiceContext } from "@juo/blocks";

type Preset = "imageTop" | "imageLeft" | "noImage";

interface Props {
  title: string;
  description: string;
  discountCode: string;
  ctaText: string;
  appliedText: string;
  icon: string;
  preset: Preset;
  imageUrl: string;
  imageAlt: string;
}

export function CustomPromo({
  title,
  description,
  discountCode,
  ctaText,
  appliedText,
  icon,
  preset,
  imageUrl,
  imageAlt,
}: Props) {
  const subscriptionService = useContext(SubscriptionServiceContext);
  const [current] = subscriptionService.current;
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  async function handleApply() {
    const subId = current?.id;
    if (!subId) return;
    setApplying(true);
    const result = await subscriptionService.addDiscount(subId, discountCode);
    if (result._tag === "Success") {
      setApplied(true);
    }
    setApplying(false);
  }

  const showImage = preset !== "noImage";
  const isImageLeft = preset === "imageLeft" && showImage;
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  function renderImage(className: string) {
    if (imageUrl && !imageFailed) {
      return (
        <img
          src={imageUrl}
          alt={imageAlt}
          className={className}
          onError={() => setImageFailed(true)}
        />
      );
    }
    return (
      <div
        className={`${className} flex items-center justify-center`}
        style={{ background: "var(--accent-200)" }}
      >
        <span style={{ fontSize: "32px" }}>🖼️</span>
      </div>
    );
  }

  const body = (
    <div className="p-xl flex flex-col gap-md flex-1">
      <div className="flex items-center gap-sm">
        <span style={{ fontSize: "18px" }}>
          <juo-text prop="icon">{icon}</juo-text>
        </span>
        <p className="text-sm font-bold" style={{ color: "var(--accent-900)" }}>
          <juo-text prop="title">{title}</juo-text>
        </p>
      </div>
      <p className="text-sm" style={{ color: "var(--accent-700)" }}>
        <juo-text prop="description">{description}</juo-text>
      </p>
      <div
        className="flex items-center gap-sm px-md py-sm rounded-card-2"
        style={{ background: "var(--white)", border: "1px dashed var(--accent-200)" }}
      >
        <span
          className="text-sm font-bold"
          style={{ color: "var(--primary)", letterSpacing: "0.05em" }}
        >
          <juo-text prop="discountCode">{discountCode}</juo-text>
        </span>
      </div>
      {applied ? (
        <div
          className="w-full py-md rounded-card-2 text-sm font-bold text-center"
          style={{
            background: "var(--success-100)",
            color: "var(--success-700)",
            border: "1px solid var(--success-200)",
          }}
        >
          <juo-text prop="appliedText">{appliedText}</juo-text>
        </div>
      ) : (
        <juo-button
          variant="outline"
          class="w-full"
          disabled={applying}
          onClick={() => void handleApply()}
        >
          <juo-text prop="ctaText">{ctaText}</juo-text>
        </juo-button>
      )}
    </div>
  );

  return (
    <div
      className={`rounded-card-1 overflow-hidden ${isImageLeft && showImage ? "flex" : ""}`}
      style={{
        background: "linear-gradient(135deg, var(--accent-100) 0%, var(--accent-50) 100%)",
        border: "1px solid var(--accent-200)",
      }}
    >
      {isImageLeft && renderImage("w-1/3 h-auto object-cover flex-shrink-0")}
      {showImage && !isImageLeft && renderImage("w-full h-32 object-cover")}
      {body}
    </div>
  );
}
