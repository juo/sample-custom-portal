import { defineBlock } from "@juo/blocks";
import { createReactRenderer } from "@juo/blocks/react";
import type { FromExtendedSchema, ExtendedJSONSchema } from "json-schema-to-ts";
import { blockLocales } from "../../locales";
import { CustomUpcomingOrder as CustomUpcomingOrderComponent } from "./CustomUpcomingOrder";

type Extensions = {
  "x-juo-control-type": "inline-text" | "stepper";
  "x-juo-group": string;
};

type CustomSchema = ExtendedJSONSchema<Extensions>;

const schema = {
  type: "object",
  properties: {
    props: {
      type: "object",
      properties: {
        title: {
          type: "string",
          "x-juo-control-type": "inline-text",
          default: "Your Next Delivery",
        },
        deliveryDateLabel: {
          type: "string",
          "x-juo-control-type": "inline-text",
          default: "Delivery date",
        },
        skipLabel: {
          type: "string",
          "x-juo-control-type": "inline-text",
          default: "Skip this delivery",
        },
        skippedMessage: {
          type: "string",
          "x-juo-control-type": "inline-text",
          default: "Delivery skipped",
        },
        emptyMessage: {
          type: "string",
          "x-juo-control-type": "inline-text",
          default: "No upcoming deliveries scheduled.",
        },
        fetchLimit: {
          type: "integer",
          title: "Fetch limit",
          description: "How many upcoming orders to request from the service",
          "x-juo-control-type": "stepper",
          "x-juo-group": "behavior",
          minimum: 1,
          default: 2,
        },
        dateFormat: {
          type: "string",
          title: "Date format",
          enum: ["long", "short", "numeric"],
          "x-juo-group": "behavior",
          default: "long",
        },
      },
      required: [
        "title",
        "deliveryDateLabel",
        "skipLabel",
        "skippedMessage",
        "emptyMessage",
        "fetchLimit",
        "dateFormat",
      ],
      additionalProperties: false,
    },
  },
  required: ["props"],
  additionalProperties: false,
} as const satisfies CustomSchema;

type Schema = FromExtendedSchema<Extensions, typeof schema>;

export const CustomUpcomingOrder = defineBlock<Schema>("CustomUpcomingOrder", {
  group: "theme",
  schema,
  initialValue: () => ({
    props: {
      title: "Your Next Delivery",
      deliveryDateLabel: "Delivery date",
      skipLabel: "Skip this delivery",
      skippedMessage: "Delivery skipped",
      emptyMessage: "No upcoming deliveries scheduled.",
      fetchLimit: 2,
      dateFormat: "long",
    },
  }),
  renderer: createReactRenderer(CustomUpcomingOrderComponent),
  locales: blockLocales("CustomUpcomingOrder"),
});
