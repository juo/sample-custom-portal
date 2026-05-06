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
  const brandLabel = brandName || "Beauty Box";
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
          <span
            className="inline-flex text-[var(--primary)]"
            role="img"
            aria-label={brandLabel}
          >
            <span className="sr-only">
              <juo-text prop="brandName">{brandName}</juo-text>
            </span>
            <svg
              aria-hidden="true"
              focusable="false"
              role="presentation"
              className="h-auto w-[151px] max-w-full"
              width="151"
              height="17"
              viewBox="0 0 151 17"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M88.5714 7.19424L94.4 1.19196H97.4217L90.6331 8.00338L97.4674 16.232H94.4L89.0331 9.55767L88.576 10.0148V16.2365H86.2903V1.19196H88.576L88.5714 7.19424Z" />
              <path d="M112.837 12.6068H106.409L104.763 16.2366H102.281L109.769 0.31427L116.896 16.2366H114.418L112.837 12.6068ZM111.922 10.44L109.682 5.34284L107.355 10.44H111.922Z" />
              <path d="M125.083 9.74053L120.142 1.19196H122.743L126.217 7.2171L129.687 1.19196H132.343L127.401 9.74053V16.2365H125.115L125.083 9.74053Z" />
              <path d="M146.126 12.6068H139.698L138.048 16.2366H135.57L143.058 0.31427L150.171 16.2366H147.703L146.126 12.6068ZM145.211 10.44L142.967 5.34284L140.645 10.44H145.211Z" />
              <path d="M5.18394 9.79539L0.228516 1.15082H1.35766L5.71423 8.77596L10.1485 1.15082H11.2777L6.17137 9.79539V16.2411H5.18394V9.79539Z" />
              <path d="M31.3142 8.73029C31.3235 9.75807 31.127 10.7773 30.7363 11.728C30.3456 12.6786 29.7686 13.5415 29.0392 14.2657C28.3099 14.9899 27.443 15.5609 26.4896 15.9449C25.5362 16.3289 24.5156 16.5182 23.4879 16.5017C22.4594 16.5207 21.4374 16.3332 20.4826 15.9501C19.5279 15.567 18.6597 14.9963 17.9295 14.2716C17.1993 13.5469 16.6219 12.6831 16.2316 11.7313C15.8412 10.7795 15.6459 9.75898 15.6571 8.73029C15.7065 6.68678 16.5529 4.74358 18.0157 3.31574C19.4784 1.8879 21.4415 1.08862 23.4856 1.08862C25.5298 1.08862 27.4928 1.8879 28.9556 3.31574C30.4184 4.74358 31.2648 6.68678 31.3142 8.73029ZM30.2719 8.73029C30.2954 7.82428 30.1373 6.92274 29.8068 6.07882C29.4764 5.23491 28.9803 4.46571 28.3478 3.81658C27.7153 3.16746 26.9592 2.65156 26.1241 2.29931C25.2891 1.94705 24.392 1.76557 23.4856 1.76557C22.5793 1.76557 21.6822 1.94705 20.8471 2.29931C20.0121 2.65156 19.256 3.16746 18.6235 3.81658C17.991 4.46571 17.4949 5.23491 17.1644 6.07882C16.834 6.92274 16.6758 7.82428 16.6994 8.73029C16.6758 9.6363 16.834 10.5378 17.1644 11.3818C17.4949 12.2257 17.991 12.9949 18.6235 13.644C19.256 14.2931 20.0121 14.809 20.8471 15.1613C21.6822 15.5135 22.5793 15.695 23.4856 15.695C24.392 15.695 25.2891 15.5135 26.1241 15.1613C26.9592 14.809 27.7153 14.2931 28.3478 13.644C28.9803 12.9949 29.4764 12.2257 29.8068 11.3818C30.1373 10.5378 30.2954 9.6363 30.2719 8.73029Z" />
              <path d="M38.8297 1.15082V10.5862C38.8297 12.0125 38.8983 12.9405 39.4606 13.8457C40.3428 15.272 41.9977 15.5874 42.9668 15.5874C43.936 15.5874 45.5908 15.272 46.4731 13.8457C47.04 12.9314 47.1086 12.0171 47.1086 10.5862V1.15082H48.1051V10.5862C48.1051 12.2365 48.0137 13.3291 47.2457 14.4537C46.112 16.1085 44.3246 16.4925 42.9668 16.4925C41.6091 16.4925 39.8217 16.1085 38.6926 14.4537C37.9246 13.3245 37.8331 12.2365 37.8331 10.5862V1.15082H38.8297Z" />
              <path d="M63.0354 16.2411L58.1485 9.11425H57.6914V16.2411H56.6948V1.1554H58.8663C60.0183 1.1554 61.0605 1.24682 62.0663 1.92797C62.5753 2.29367 62.9847 2.78104 63.257 3.3456C63.5293 3.91016 63.6558 4.53392 63.6251 5.15997C63.6251 6.65482 62.9714 8.19539 61.0925 8.81711C60.4944 9.01687 59.8671 9.11574 59.2365 9.10968L64.1691 16.2365L63.0354 16.2411ZM57.7005 8.21368H59.1451C61.2937 8.21368 62.5874 7.07997 62.5874 5.13711C62.5874 3.6194 61.8377 2.82854 61.248 2.51311C60.5293 2.19323 59.7486 2.03709 58.9623 2.05597H57.7188L57.7005 8.21368Z" />
              <path d="M77.6914 9.05943L75.7714 4.14514L73.5177 8.91314C73.3527 9.22169 73.2619 9.56449 73.2526 9.91428C73.2332 10.2235 73.2761 10.5334 73.3786 10.8258C73.4811 11.1182 73.6412 11.387 73.8494 11.6165C74.0575 11.8459 74.3096 12.0313 74.5907 12.1616C74.8718 12.2919 75.1761 12.3646 75.4857 12.3753C75.7954 12.386 76.104 12.3345 76.3934 12.2239C76.6828 12.1133 76.947 11.9457 77.1706 11.7312C77.3941 11.5167 77.5724 11.2595 77.6948 10.9749C77.8172 10.6903 77.8814 10.3841 77.8834 10.0743C77.8977 9.72578 77.832 9.37863 77.6914 9.05943Z" />
            </svg>
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
