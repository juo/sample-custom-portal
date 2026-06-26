import { defineBlock } from "@juo/blocks";
import { createReactRenderer } from "@juo/blocks/react";
import type { FromExtendedSchema, ExtendedJSONSchema } from "json-schema-to-ts";
import { blockLocales } from "../../locales";
import { CustomPromo as CustomPromoComponent } from "./CustomPromo";

type Extensions = {
  "x-juo-control-type": "inline-text";
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
          default: "Special Offer",
        },
        description: {
          type: "string",
          "x-juo-control-type": "inline-text",
          default: "Apply your exclusive discount code",
        },
        discountCode: {
          type: "string",
          "x-juo-control-type": "inline-text",
          default: "CUSTOM20",
        },
        ctaText: {
          type: "string",
          "x-juo-control-type": "inline-text",
          default: "Apply code",
        },
        appliedText: {
          type: "string",
          "x-juo-control-type": "inline-text",
          default: "Applied!",
        },
        icon: {
          type: "string",
          "x-juo-control-type": "inline-text",
          default: "✨",
        },
        preset: {
          type: "string",
          enum: ["imageTop", "imageLeft", "noImage"],
          title: "Layout preset",
          default: "imageTop",
        },
        imageUrl: {
          type: "string",
          title: "Image URL",
          "x-juo-group": "media",
          default:
            "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
        },
        imageAlt: {
          type: "string",
          title: "Image alt text",
          "x-juo-group": "media",
          default: "Promo",
        },
      },
      required: [
        "title",
        "description",
        "discountCode",
        "ctaText",
        "appliedText",
        "icon",
        "preset",
        "imageUrl",
        "imageAlt",
      ],
      additionalProperties: false,
    },
  },
  required: ["props"],
  additionalProperties: false,
} as const satisfies CustomSchema;

type Schema = FromExtendedSchema<Extensions, typeof schema>;

export const CustomPromo = defineBlock<Schema>("CustomPromo", {
  group: "theme",
  schema,
  initialValue: () => ({
    props: {
      title: "Special Offer",
      description: "Apply your exclusive discount code",
      discountCode: "CUSTOM20",
      ctaText: "Apply code",
      appliedText: "Applied!",
      icon: "✨",
      preset: "imageTop",
      imageUrl:
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
      imageAlt: "Promo",
    },
  }),
  renderer: createReactRenderer(CustomPromoComponent),
  locales: blockLocales("CustomPromo"),
});
