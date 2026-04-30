import { defineBlock } from "@juo/blocks";
import { createReactRenderer } from "@juo/blocks/react";
import type { FromExtendedSchema, ExtendedJSONSchema } from "json-schema-to-ts";
import { blockLocales } from "../../locales";
import { BeautyNavigation as BeautyNavigationComponent } from "./BeautyNavigation";

type Extensions = {
  "x-juo-control-type": "inline-text";
};

type BeautySchema = ExtendedJSONSchema<Extensions>;

const schema = {
  type: "object",
  properties: {
    props: {
      type: "object",
      properties: {
        brandName: {
          type: "string",
          "x-juo-control-type": "inline-text",
          default: "Beauty Box",
        },
        navItems: {
          type: "array",
          title: "Navigation items",
          items: {
            enum: ["subscription", "orders", "history", "aktualnosci", "adresy"] as const,
          },
        },
        subscriptionLabel: {
          type: "string",
          "x-juo-control-type": "inline-text",
          default: "Subskrypcje",
        },
        ordersLabel: {
          type: "string",
          "x-juo-control-type": "inline-text",
          default: "Orders",
        },
        historyLabel: {
          type: "string",
          "x-juo-control-type": "inline-text",
          default: "History",
        },
        aktualnosciLabel: {
          type: "string",
          "x-juo-control-type": "inline-text",
          default: "Aktualności",
        },
        adresyLabel: {
          type: "string",
          "x-juo-control-type": "inline-text",
          default: "Twoje adresy",
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
        "historyLabel",
        "aktualnosciLabel",
        "adresyLabel",
        "logoutIcon",
        "logoutLabel",
      ],
      additionalProperties: false,
    },
  },
  required: ["props"],
  additionalProperties: false,
} as const satisfies BeautySchema;

type Schema = FromExtendedSchema<Extensions, typeof schema>;

export const BeautyNavigation = defineBlock<Schema>("BeautyNavigation", {
  group: "theme",
  schema,
  initialValue: () => ({
    props: {
      brandName: "Beauty Box",
      navItems: ["subscription", "orders", "history", "aktualnosci", "adresy"],
      subscriptionLabel: "Subskrypcje",
      ordersLabel: "Orders",
      historyLabel: "Historia",
      aktualnosciLabel: "Aktualności",
      adresyLabel: "Twoje adresy",
      logoutIcon: "👋",
      logoutLabel: "Log out",
    },
  }),
  renderer: createReactRenderer(BeautyNavigationComponent),
  locales: blockLocales("BeautyNavigation"),
});
