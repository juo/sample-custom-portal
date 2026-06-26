import { defineBlock, createBlockInstance } from "@juo/blocks";
import { createReactRenderer } from "@juo/blocks/react";
import { LoginPage } from "../pages/LoginPage";
import { SubscriptionPage } from "../pages/SubscriptionPage";
import { OrdersPage } from "../pages/OrdersPage";

// ─── Login page ───────────────────────────────────────────────────────────

const loginPageSchema = {
  type: "object",
  properties: {
    props: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    slots: {
      type: "object",
      properties: {
        default: {},
      },
      additionalProperties: false,
    },
  },
  required: ["props", "slots"],
  additionalProperties: false,
} as const;

export const CustomLoginPage = defineBlock("CustomLoginPage", {
  group: "page",
  schema: loginPageSchema,
  initialValue: () => ({
    props: {},
    slots: {
      default: [createBlockInstance("Login")],
    },
  }),
  renderer: createReactRenderer(LoginPage),
});

// ─── Subscription page ────────────────────────────────────────────────────

const subscriptionPageSchema = {
  type: "object",
  properties: {
    props: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    slots: {
      type: "object",
      properties: {
        nav: {},
        welcome: {},
        upcoming: {},
        upsell: {},
        promo: {},
      },
      additionalProperties: false,
    },
  },
  required: ["props", "slots"],
  additionalProperties: false,
} as const;

export const CustomSubscriptionPage = defineBlock("CustomSubscriptionPage", {
  group: "page",
  schema: subscriptionPageSchema,
  initialValue: () => ({
    props: {},
    slots: {
      nav: [createBlockInstance("CustomNavigation")],
      welcome: [createBlockInstance("CustomWelcome")],
      upcoming: [createBlockInstance("CustomUpcomingOrder")],
      upsell: [createBlockInstance("CustomUpsell")],
      promo: [createBlockInstance("CustomPromo")],
    },
  }),
  renderer: createReactRenderer(SubscriptionPage),
});

// ─── Orders page ──────────────────────────────────────────────────────────

const ordersPageSchema = {
  type: "object",
  properties: {
    props: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    slots: {
      type: "object",
      properties: {
        nav: {},
        history: {},
      },
      additionalProperties: false,
    },
  },
  required: ["props", "slots"],
  additionalProperties: false,
} as const;

export const CustomOrdersPage = defineBlock("CustomOrdersPage", {
  group: "page",
  schema: ordersPageSchema,
  initialValue: () => ({
    props: {},
    slots: {
      nav: [createBlockInstance("CustomNavigation")],
      history: [createBlockInstance("CustomOrderHistory")],
    },
  }),
  renderer: createReactRenderer(OrdersPage),
});
