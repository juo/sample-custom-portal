import { useQuery } from "@tanstack/react-query";
import { storefrontFetch } from "../lib/storefront";

const QUERY = `
  query GetPromotionBanner {
    metaobjects(type: "promotion_banner", first: 20) {
      nodes {
        id
        handle
        fields {
          key
          value
          type
          reference {
            __typename
            ... on Metaobject {
              fields {
                key
                value
              }
            }
            ... on MediaImage {
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
`;

export type MetaobjectField = {
  key: string;
  value: string | null;
  type: string;
  reference: MetaobjectReference | null;
};

type MetaobjectReferenceField = {
  key: string;
  value: string | null;
};

type MetaobjectReference =
  | {
      __typename: "Metaobject";
      fields: MetaobjectReferenceField[];
    }
  | {
      __typename: "MediaImage";
      image: {
        url: string;
        altText: string | null;
        width: number | null;
        height: number | null;
      } | null;
    };

export type MetaobjectNode = {
  id: string;
  handle: string;
  fields: MetaobjectField[];
};

type QueryResult = {
  metaobjects: {
    nodes: MetaobjectNode[];
  };
};

export function getField(fields: MetaobjectField[], key: string): string | null {
  return fields.find((field) => field.key === key)?.value ?? null;
}

export function getFieldReference(fields: MetaobjectField[], key: string): MetaobjectReference | null {
  return fields.find((field) => field.key === key)?.reference ?? null;
}

export function usePromotionBanner() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["promotion_banner"],
    queryFn: () => storefrontFetch<QueryResult>(QUERY),
    staleTime: 1000 * 60 * 10,
  });

  const entries = data?.metaobjects.nodes ?? [];

  return { entries, isLoading, isError };
}
