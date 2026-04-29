/// <reference types="vite/client" />
import type { HTMLAttributes } from "react";

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_SHOP_DOMAIN?: string;
  readonly VITE_MOCK_MODE?: string;
  readonly VITE_BLOCKS_EXTENSIONS_VERSION?: string;
  readonly VITE_BLOCKS_EXTENSIONS_URL?: string;
  readonly VITE_STOREFRONT_TOKEN: string;
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "juo-text": HTMLAttributes<HTMLElement> & { prop?: string };
      "juo-extension-root": HTMLAttributes<HTMLElement> & { name?: string };
      "juo-context-root": HTMLAttributes<HTMLElement>;
      "juo-page": HTMLAttributes<HTMLElement> & { name?: string };
    }
  }
}

declare module "*.css" {}

export {};
