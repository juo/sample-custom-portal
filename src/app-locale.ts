import { useEffect } from "react";
import { TranslationContext } from "@juo/blocks";
import { useContext } from "@juo/blocks/react";

type RouteKey = "login" | "subscription" | "orders" | "history" | "aktualnosci" | "adresy";

interface AppCopy {
  routes: Record<RouteKey, string>;
  pages: {
    orders: {
      title: string;
      backToSubscriptionAriaLabel: string;
      showDetailsButton: string;
    };
    history: {
      title: string;
      backToSubscriptionAriaLabel: string;
    };
    aktualnosci: {
      title: string;
    };
    adresy: {
      title: string;
    };
  };
  errors: {
    genericTitle: string;
    missingMountElements: string;
    webComponentsLoadFailed: string;
  };
}

export interface LocaleFile extends Record<string, unknown> {
  App: AppCopy;
}

const localeModules = import.meta.glob("../locales/*.json", { eager: true }) as Record<
  string,
  { default?: LocaleFile } | LocaleFile
>;

const localeCatalog = Object.fromEntries(
  Object.entries(localeModules).map(([path, module]) => {
    const match = path.match(/\/([a-z-]+)\.json$/i);
    const locale = match?.[1]?.toLowerCase() ?? "en";
    const data = ("default" in module ? module.default : module) as LocaleFile;
    return [locale, data];
  }),
) as Record<string, LocaleFile>;

const fallbackLocale = localeCatalog.pl ?? localeCatalog.en;

export function normalizeLocale(locale: string): string {
  return locale.trim().toLowerCase().split("-")[0] || "pl";
}

let activeLocale = "pl";

export function setActiveLocale(locale: string): void {
  activeLocale = normalizeLocale(locale);
}

export function getLocaleFile(locale: string): LocaleFile {
  return localeCatalog[normalizeLocale(locale)] ?? fallbackLocale;
}

export function getAppCopy(locale: string = activeLocale): AppCopy {
  return getLocaleFile(locale).App ?? fallbackLocale.App;
}

export function useAppCopy(): AppCopy {
  const translationService = useContext(TranslationContext);
  const [locale] = translationService.locale;

  useEffect(() => {
    setActiveLocale(locale);
  }, [locale]);

  return getAppCopy(locale);
}
