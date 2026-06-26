import { defineBlock } from "@juo/blocks";
import { createReactRenderer } from "@juo/blocks/react";
import type { FromExtendedSchema, ExtendedJSONSchema } from "json-schema-to-ts";
import { blockLocales } from "../../locales";
import { CustomNavigation as CustomNavigationComponent } from "./CustomNavigation";

type Extensions = {
  "x-juo-control-type": "inline-text";
};

type CustomSchema = ExtendedJSONSchema<Extensions>;

const schema = {
  type: "object",
  properties: {
    props: {
      type: "object",
      properties: {
        brandName: {
          type: "string",
          "x-juo-control-type": "inline-text",
          default: "Custom Box",
        },
        navItems: {
          type: "array",
          title: "Navigation items",
          items: {
            enum: ["subscription", "orders"] as const,
          },
        },
        subscriptionLabel: {
          type: "string",
          "x-juo-control-type": "inline-text",
          default: "Subscription",
        },
        ordersLabel: {
          type: "string",
          "x-juo-control-type": "inline-text",
          default: "Orders",
        },
        logoutIcon: {
          type: "string",
          "x-juo-control-type": "inline-text",
          default: "👋",
        },
        logoutLabel: {
          type: "string",
          "x-juo-control-type": "inline-text",
          default: "Log out",
        },
      },
      required: [
        "brandName",
        "navItems",
        "subscriptionLabel",
        "ordersLabel",
        "logoutIcon",
        "logoutLabel",
      ],
      additionalProperties: false,
    },
  },
  required: ["props"],
  additionalProperties: false,
} as const satisfies CustomSchema;

type Schema = FromExtendedSchema<Extensions, typeof schema>;

export const CustomNavigation = defineBlock<Schema>("CustomNavigation", {
  group: "theme",
  schema,
  initialValue: () => ({
    props: {
      brandName: "Custom Box",
      navItems: ["subscription", "orders"],
      subscriptionLabel: "Subscription",
      ordersLabel: "Orders",
      logoutIcon: "👋",
      logoutLabel: "Log out",
    },
  }),
  renderer: createReactRenderer(CustomNavigationComponent),
  locales: blockLocales("CustomNavigation"),
});
