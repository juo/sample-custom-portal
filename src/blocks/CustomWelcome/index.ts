import { defineBlock } from "@juo/blocks";
import { createReactRenderer } from "@juo/blocks/react";
import type { FromExtendedSchema, ExtendedJSONSchema } from "json-schema-to-ts";
import { blockLocales } from "../../locales";
import { CustomWelcome as CustomWelcomeComponent } from "./CustomWelcome";

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
        greetingPrefix: {
          type: "string",
          "x-juo-control-type": "inline-text",
          default: "Welcome back,",
        },
        subtitle: {
          type: "string",
          "x-juo-control-type": "inline-text",
          default: "Manage your custom subscription",
        },
        showSubtitle: {
          type: "boolean",
          title: "Show subtitle",
          default: true,
        },
      },
      required: ["greetingPrefix", "subtitle", "showSubtitle"],
      additionalProperties: false,
    },
  },
  required: ["props"],
  additionalProperties: false,
} as const satisfies CustomSchema;

type Schema = FromExtendedSchema<Extensions, typeof schema>;

export const CustomWelcome = defineBlock<Schema>("CustomWelcome", {
  group: "theme",
  schema,
  initialValue: () => ({
    props: {
      greetingPrefix: "Welcome back,",
      subtitle: "Manage your custom subscription",
      showSubtitle: true,
    },
  }),
  renderer: createReactRenderer(CustomWelcomeComponent),
  locales: blockLocales("CustomWelcome"),
});
