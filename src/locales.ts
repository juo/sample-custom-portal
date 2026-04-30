import type { BlockLocaleFile } from "@juo/blocks";
import { getLocaleFile } from "./app-locale";

const SUPPORTED_LOCALES = ["pl", "en"] as const;

export function blockLocales(blockType: string) {
  return {
    supported: [...SUPPORTED_LOCALES],
    load: async (locale: string): Promise<BlockLocaleFile> => {
      const selected = getLocaleFile(locale) as Record<string, BlockLocaleFile | undefined>;
      if (selected[blockType] != null) {
        return selected[blockType]!;
      }

      const polishFallback = getLocaleFile("pl") as Record<string, BlockLocaleFile | undefined>;
      if (polishFallback[blockType] != null) {
        return polishFallback[blockType]!;
      }

      const englishFallback = getLocaleFile("en") as Record<string, BlockLocaleFile | undefined>;
      return englishFallback[blockType] ?? {};
    },
  };
}
