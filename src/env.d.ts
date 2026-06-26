/// <reference types="vite/client" />
import type { HTMLAttributes } from "react";

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_SHOP_DOMAIN?: string;
  readonly VITE_MOCK_MODE?: string;
  readonly VITE_BLOCKS_EXTENSIONS_VERSION?: string;
  readonly VITE_BLOCKS_EXTENSIONS_URL?: string;
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "juo-text": HTMLAttributes<HTMLElement> & { prop?: string };
      "juo-extension-root": HTMLAttributes<HTMLElement> & { name?: string };
      "juo-context-root": HTMLAttributes<HTMLElement>;
      "juo-page": HTMLAttributes<HTMLElement> & { name?: string };
      // @juo/customer-ui design-system web components. Use `class` (not
      // `className`): React doesn't alias className to the class attribute on
      // custom elements.
      "juo-button": HTMLAttributes<HTMLElement> & {
        variant?: "solid" | "outline" | "ghost" | "link";
        size?: "sm" | "md" | "lg" | "xl";
        disabled?: boolean;
        class?: string;
      };
      "juo-card": HTMLAttributes<HTMLElement> & { level?: 1 | 2 | 3; class?: string };
      "juo-tag": HTMLAttributes<HTMLElement> & {
        variant?: "info" | "success" | "warning" | "error" | "neutral";
        size?: "sm" | "md";
        class?: string;
      };
    }
  }
}

declare module "*.css" {}

export {};
