import type { DrawerState } from "../lib/drawer";
import { AddressFormDrawer } from "./AddressFormDrawer";
import { ArticlePreviewDrawer } from "./ArticlePreviewDrawer";
import { OrderDetailsDrawer } from "./OrderDetailsDrawer";

type OpenDrawerState = Exclude<DrawerState, null>;

export function getDrawerTitle(state: OpenDrawerState) {
  switch (state.type) {
    case "orderDetails":
      return "Szczegóły zamówienia";
    case "addressForm":
      return state.props.addressId ? "Edytuj adres" : "Dodaj adres";
  }
}

export function renderDrawerContent(state: OpenDrawerState) {
  switch (state.type) {
    case "orderDetails":
      return <OrderDetailsDrawer {...state.props} />;
    case "addressForm":
      return <AddressFormDrawer {...state.props} />;
  }
}
