import { useState, useEffect } from "react";
import { useContext } from "@juo/blocks/react";
import { RouterServiceContext, LoginServiceContext } from "@juo/blocks";
import { getRouteNameFromPathname } from "../../lib/router";

type NavItemKey = "subscription" | "orders" | "history" | "aktualnosci" | "adresy";

interface NavItemConfig {
  icon: string;
  route: string;
  labelProp: "subscriptionLabel" | "ordersLabel" | "historyLabel" | "aktualnosciLabel" | "adresyLabel";
}

const NAV_ITEM_CONFIG: Record<NavItemKey, NavItemConfig> = {
  subscription: {
    icon: "💄",
    route: "subscription",
    labelProp: "subscriptionLabel",
  },
  orders: { icon: "📦", route: "orders", labelProp: "ordersLabel" },
  history: { icon: "📋", route: "history", labelProp: "historyLabel" },
  aktualnosci: { icon: "📰", route: "aktualnosci", labelProp: "aktualnosciLabel" },
  adresy: { icon: "📍", route: "adresy", labelProp: "adresyLabel" },
};

const MOBILE_NAV_ITEMS: NavItemKey[] = ["aktualnosci", "subscription", "history", "orders"];

interface Props {
  brandName: string;
  navItems: NavItemKey[];
  subscriptionLabel: string;
  ordersLabel: string;
  historyLabel: string;
  aktualnosciLabel: string;
  adresyLabel: string;
  logoutIcon: string;
  logoutLabel: string;
}

export function BeautyNavigation({
  brandName,
  navItems,
  subscriptionLabel,
  ordersLabel,
  historyLabel,
  aktualnosciLabel,
  adresyLabel,
  logoutIcon,
  logoutLabel,
}: Props) {
  const routerService = useContext(RouterServiceContext);
  const loginService = useContext(LoginServiceContext);
  const navLabels: Record<NavItemConfig["labelProp"], string> = {
    subscriptionLabel,
    ordersLabel,
    historyLabel,
    aktualnosciLabel,
    adresyLabel,
  };
  const [activeRoute, setActiveRoute] = useState(() =>
    getRouteNameFromPathname(window.location.pathname),
  );

  useEffect(() => {
    setActiveRoute(getRouteNameFromPathname(window.location.pathname));
    return routerService.subscribe(({ path }) => {
      setActiveRoute(getRouteNameFromPathname(path));
    });
  }, [routerService]);

  const renderNavButton = (key: NavItemKey, variant: "desktop" | "mobile") => {
    const item = NAV_ITEM_CONFIG[key];
    if (!item) return null;

    const itemLabel = navLabels[item.labelProp];
    const isActive = activeRoute === item.route;

    return (
      <button
        key={`${variant}-${key}`}
        type="button"
        onClick={() => routerService.push({ name: item.route })}
        className={
          variant === "mobile"
            ? `flex min-h-[44px] items-center justify-center rounded-full border-0 bg-transparent px-2 text-center text-[11px] font-bold leading-[1.1] whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-[var(--accent-100)] text-[var(--primary)]"
                  : "text-[var(--accent-600)]"
              }`
            : `flex w-full items-center gap-md rounded-card-2 px-md py-sm text-left text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[var(--accent-100)] text-[var(--primary)]"
                  : "bg-transparent text-[var(--accent-700)]"
              }`
        }
      >
        {variant === "desktop" ? <span>{item.icon}</span> : null}
        <span>
          <juo-text prop={item.labelProp}>{itemLabel}</juo-text>
        </span>
      </button>
    );
  };

  return (
    <>
      <nav className="flex h-full flex-col gap-xs px-lg py-xl max-[480px]:hidden">
        <div className="mb-xl px-sm">
          <span className="text-xl font-bold text-[var(--primary)]">
            <juo-text prop="brandName">{brandName}</juo-text>
          </span>
        </div>

        {navItems.map((key) => renderNavButton(key, "desktop"))}

        <div className="flex-1" />

        <button
          type="button"
          onClick={() => void loginService.logout()}
          className="flex w-full items-center gap-md rounded-card-2 px-md py-sm text-left text-sm font-medium text-[var(--accent-500)]"
        >
          <span>
            <juo-text prop="logoutIcon">{logoutIcon}</juo-text>
          </span>
          <juo-text prop="logoutLabel">{logoutLabel}</juo-text>
        </button>
      </nav>

      <nav
        className="hidden max-[480px]:fixed max-[480px]:inset-x-0 max-[480px]:bottom-0 max-[480px]:z-[60] max-[480px]:grid max-[480px]:grid-cols-4 max-[480px]:gap-[6px] max-[480px]:border-t max-[480px]:border-[var(--accent-200)] max-[480px]:bg-[var(--white)] max-[480px]:shadow-[0_-10px_30px_rgb(15_23_42_/_0.08)] max-[480px]:backdrop-blur-[18px] max-[480px]:[padding-top:10px] max-[480px]:[padding-bottom:calc(10px+env(safe-area-inset-bottom,0px))] max-[480px]:[padding-left:calc(12px+env(safe-area-inset-left,0px))] max-[480px]:[padding-right:calc(12px+env(safe-area-inset-right,0px))] max-[480px]:[background:color-mix(in_srgb,var(--white)_94%,transparent)]"
        aria-label="Mobile navigation"
      >
        {MOBILE_NAV_ITEMS.filter((key) => navItems.includes(key)).map((key) =>
          renderNavButton(key, "mobile"),
        )}
      </nav>
    </>
  );
}
