import { useGiftProductsWidget, getField } from "../hooks/useGiftProductsWidget";

export function GiftProductsWidget() {
  const { entry, isLoading, isError } = useGiftProductsWidget();
  console.log(">>>", isError, isLoading);
  if (isLoading || isError || !entry) return null;
  console.log(">>22>");

  const title = getField(entry.fields, "title");

  return <div>{title && <h2>{title}</h2>}</div>;
}
