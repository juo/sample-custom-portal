import { useState, useEffect } from "react";
import { useContext } from "@juo/blocks/react";
import { RouterServiceContext, LoginServiceContext } from "@juo/blocks";
import { getRouteNameFromPathname } from "../../lib/router";

type NavItemKey = "subscription" | "orders" | "history";

interface NavItemConfig {
  icon: string;
  route: string;
  labelProp: "subscriptionLabel" | "ordersLabel" | "historyLabel";
}

const NAV_ITEM_CONFIG: Record<NavItemKey, NavItemConfig> = {
  subscription: {
    icon: "💄",
    route: "subscription",
    labelProp: "subscriptionLabel",
  },
  orders: { icon: "📦", route: "orders", labelProp: "ordersLabel" },
  history: { icon: "📋", route: "history", labelProp: "historyLabel" },
};

interface Props {
  brandName: string;
  navItems: NavItemKey[];
  subscriptionLabel: string;
  ordersLabel: string;
  historyLabel: string;
  logoutIcon: string;
  logoutLabel: string;
}

export function BeautyNavigation({
  brandName,
  navItems,
  subscriptionLabel,
  historyLabel,
  ordersLabel,
  logoutIcon,
  logoutLabel,
}: Props) {
  const routerService = useContext(RouterServiceContext);
  const loginService = useContext(LoginServiceContext);
  const navLabels: Record<NavItemConfig["labelProp"], string> = {
    subscriptionLabel,
    ordersLabel,
    historyLabel,
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

  return (
    <nav className="flex flex-col h-full px-lg py-xl gap-xs">
      <div className="mb-xl px-sm">
        <span className="text-xl font-bold" style={{ color: "var(--primary)" }}>
          <juo-text prop="brandName">{brandName}</juo-text>
        </span>
      </div>

      {navItems.map((key) => {
        const item = NAV_ITEM_CONFIG[key];
        if (!item) return null;
        const itemLabel = navLabels[item.labelProp];
        const isActive = activeRoute === item.route;
        return (
          <button
            key={key}
            onClick={() => routerService.push({ name: item.route })}
            className="flex items-center gap-md px-md py-sm rounded-card-2 text-sm font-medium text-left w-full transition-colors"
            style={
              isActive
                ? { background: "var(--accent-100)", color: "var(--primary)" }
                : { color: "var(--accent-700)", background: "transparent" }
            }
          >
            <span>{item.icon}</span>
            <span>
              <juo-text prop={item.labelProp}>{itemLabel}</juo-text>
            </span>
          </button>
        );
      })}

      <div className="flex-1" />

      <button
        onClick={() => void loginService.logout()}
        className="flex items-center gap-md px-md py-sm rounded-card-2 text-sm font-medium text-left w-full"
        style={{ color: "var(--accent-500)" }}
      >
        <span>
          <juo-text prop="logoutIcon">{logoutIcon}</juo-text>
        </span>
        <juo-text prop="logoutLabel">{logoutLabel}</juo-text>
      </button>
    </nav>
  );
}
