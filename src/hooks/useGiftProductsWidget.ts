import { useQuery } from "@tanstack/react-query";
import { storefrontFetch } from "../lib/storefront";

const QUERY = `
  query GetGiftProductsWidget {
    metaobjects(type: "widget_gift_products", first: 20) {
      nodes {
        id
        handle
        fields {
          key
          value
          reference {
            __typename
            ... on Metaobject {
              fields {
                key
                value
              }
            }
          }
          references(first: 10) {
            nodes {
              __typename
              ... on Metaobject {
                id
                fields {
                  key
                  value
                  references(first: 10) {
                    nodes {
                      __typename
                      ... on Metaobject {
                        id
                        fields {
                          key
                          value
                          reference {
                            __typename
                            ... on Product {
                              id
                              title
                              handle
                              compareAtPriceRange {
                                maxVariantPrice {
                                  amount
                                  currencyCode
                                }
                              }
                              variants(first: 20) {
                                nodes {
                                  id
                                  title
                                  image {
                                    url
                                  }
                                }
                              }
                              media(first: 1) {
                                nodes {
                                  ... on MediaImage {
                                    image {
                                      url
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Raw query types

type ProductRef = {
  __typename: "Product";
  id: string;
  title: string;
  handle: string;
  compareAtPriceRange: {
    maxVariantPrice: { amount: string; currencyCode: string } | null;
  };
  variants: { nodes: { id: string; title: string; image: { url: string } | null }[] };
  media: { nodes: Array<{ image: { url: string } | null }> };
};

type GiftItemField = {
  key: string;
  value: string | null;
  reference: ProductRef | { __typename: string } | null;
};

type GiftItemMetaobject = {
  __typename: "Metaobject";
  id: string;
  fields: GiftItemField[];
};

type ThresholdField = {
  key: string;
  value: string | null;
  references: { nodes: Array<GiftItemMetaobject | { __typename: string }> } | null;
};

type ThresholdMetaobject = {
  __typename: "Metaobject";
  id: string;
  fields: ThresholdField[];
};

type WidgetField = {
  key: string;
  value: string | null;
  reference:
    | { __typename: "Metaobject"; fields: { key: string; value: string | null }[] }
    | { __typename: string }
    | null;
  references: { nodes: Array<ThresholdMetaobject | { __typename: string }> } | null;
};

type RawMetaobjectNode = {
  id: string;
  handle: string;
  fields: WidgetField[];
};

type QueryResult = {
  metaobjects: {
    nodes: RawMetaobjectNode[];
  };
};

// Exported parsed types

export type GiftProductVariant = {
  id: string;
  title: string;
  imageUrl: string | null;
};

export type GiftProduct = {
  id: string;
  title: string;
  handle: string;
  compareAtPrice: number;
  variants: GiftProductVariant[];
  mediaUrl: string | null;
};

export type GiftItem = {
  gift: GiftProduct;
  redirect: GiftProduct | null;
};

export type ThresholdEntry = {
  id: string;
  threshold: number;
  badgeContent: string;
  gifts: GiftItem[];
};

export type GiftWidgetEntry = {
  id: string;
  title: string;
  description: string | null;
  bottomMessage: string | null;
  countdownEndDate: string | null;
  useDiscountedTotal: boolean;
  activationStart: string | null;
  activationEnd: string | null;
  thresholds: ThresholdEntry[];
};

// Parse helpers

function fieldValue(fields: { key: string; value: string | null }[], key: string): string | null {
  return fields.find((f) => f.key === key)?.value ?? null;
}

function parseProduct(ref: GiftItemField["reference"]): GiftProduct | null {
  if (!ref || ref.__typename !== "Product") return null;
  const p = ref as ProductRef;
  const compareAtAmount = p.compareAtPriceRange.maxVariantPrice?.amount;
  return {
    id: p.id,
    title: p.title,
    handle: p.handle,
    compareAtPrice: compareAtAmount ? parseFloat(compareAtAmount) : 0,
    variants: p.variants.nodes.map((v) => ({
      id: v.id,
      title: v.title,
      imageUrl: v.image?.url ?? null,
    })),
    mediaUrl: p.media.nodes[0]?.image?.url ?? null,
  };
}

function parseThreshold(node: ThresholdMetaobject): ThresholdEntry | null {
  const thresholdStr = node.fields.find((f) => f.key === "threshold")?.value;
  const threshold = thresholdStr ? parseFloat(thresholdStr) : NaN;
  if (isNaN(threshold)) return null;

  const badgeContent = node.fields.find((f) => f.key === "gift_badge_content")?.value ?? "Prezent";

  const giftsField = node.fields.find((f) => f.key === "gifts");
  const gifts: GiftItem[] = (giftsField?.references?.nodes ?? [])
    .filter((n): n is GiftItemMetaobject => n.__typename === "Metaobject")
    .map((giftNode) => {
      const giftRef = giftNode.fields.find((f) => f.key === "gift")?.reference ?? null;
      const redirectRef = giftNode.fields.find((f) => f.key === "redirect")?.reference ?? null;
      return { gift: parseProduct(giftRef), redirect: parseProduct(redirectRef) };
    })
    .filter((g): g is GiftItem => g.gift !== null);

  return { id: node.id, threshold, badgeContent, gifts };
}

function parseEntry(node: RawMetaobjectNode): GiftWidgetEntry | null {
  const val = (key: string) => fieldValue(node.fields, key);
  const title = val("title");
  if (!title) return null;

  const activationRef = node.fields.find((f) => f.key === "activation_schedule")?.reference;
  const scheduleFields =
    activationRef?.__typename === "Metaobject"
      ? (
          activationRef as {
            __typename: "Metaobject";
            fields: { key: string; value: string | null }[];
          }
        ).fields
      : null;

  const thresholdsField = node.fields.find((f) => f.key === "thresholds");
  const thresholds = (thresholdsField?.references?.nodes ?? [])
    .filter((n): n is ThresholdMetaobject => n.__typename === "Metaobject")
    .map(parseThreshold)
    .filter((t): t is ThresholdEntry => t !== null);

  return {
    id: node.id,
    title,
    description: val("description"),
    bottomMessage: val("bottom_message_new"),
    countdownEndDate: val("countdown_end_date"),
    useDiscountedTotal: val("use_discounted_total_price") === "true",
    activationStart: scheduleFields ? fieldValue(scheduleFields, "start_date") : null,
    activationEnd: scheduleFields ? fieldValue(scheduleFields, "end_date") : null,
    thresholds,
  };
}

function isEntryActive(entry: GiftWidgetEntry, now: Date): boolean {
  if (!entry.activationStart || !entry.activationEnd) return true;
  const start = new Date(Date.parse(entry.activationStart));
  const end = new Date(Date.parse(entry.activationEnd));
  return now >= start && now <= end;
}

export function useGiftProductsWidget() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["widget_gift_products"],
    queryFn: () => storefrontFetch<QueryResult>(QUERY),
    staleTime: 1000 * 60 * 10,
  });

  const now = new Date();
  const entry =
    (data?.metaobjects.nodes ?? [])
      .map(parseEntry)
      .find((e): e is GiftWidgetEntry => e !== null && isEntryActive(e, now)) ?? null;

  return { entry, isLoading, isError };
}
