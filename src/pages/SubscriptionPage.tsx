import { GiftProductsWidget } from "../components/GiftProductsWidget";
import { PromotionBanner } from "../widgets/PromotionBanner";

export function SubscriptionPage() {
  return (
    <juo-page name="BeautySubscriptionPage">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-[240px_1fr]">
        <div className="lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-r lg:border-[var(--accent-200)] lg:bg-[var(--white)]">
          <juo-extension-root name="nav" />
        </div>
        <div className="mr-auto ml-0 flex max-w-[860px] flex-col gap-4 px-5 pt-8 pb-24 max-[480px]:pb-[calc(106px+env(safe-area-inset-bottom,0px))] lg:pt-8">
          <juo-extension-root name="welcome" />
          <juo-extension-root name="upcoming" />
          {/* Gifts widget */}
          <GiftProductsWidget />

          <PromotionBanner />

          <juo-extension-root name="upsell" />
          <juo-extension-root name="promo" />
        </div>
      </div>
    </juo-page>
  );
}
