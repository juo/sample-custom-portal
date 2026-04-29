import { useQuery } from "@tanstack/react-query";
import { storefrontFetch } from "../lib/storefront";

const QUERY = `
  query GetGiftProductsWidget {
    metaobjects(type: "widget_gift_products", first: 1) {
      nodes {
        id
        handle
        fields {
          key
          value
        }
      }
    }
  }
`;

type MetaobjectField = {
  key: string;
  value: string;
};

type MetaobjectNode = {
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
  return fields.find((f) => f.key === key)?.value ?? null;
}

export function useGiftProductsWidget() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["widget_gift_products"],
    queryFn: () => storefrontFetch<QueryResult>(QUERY),
    staleTime: 1000 * 60 * 10,
  });

  const entry = data?.metaobjects.nodes[0] ?? null;

  return { entry, isLoading, isError };
}
