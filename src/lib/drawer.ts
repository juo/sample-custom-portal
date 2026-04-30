export type DrawerPayloadMap = {
  orderDetails: { orderId: string };
  addressForm: { addressId?: string };
};

export type DrawerKey = keyof DrawerPayloadMap;

export type DrawerState =
  | {
      [K in DrawerKey]: {
        type: K;
        props: DrawerPayloadMap[K];
      };
    }[DrawerKey]
  | null;

type Listener = (state: DrawerState) => void;

let drawerState: DrawerState = null;
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) {
    listener(drawerState);
  }
}

export function getDrawerState() {
  return drawerState;
}

export function subscribeDrawer(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function openDrawer<K extends DrawerKey>(type: K, props: DrawerPayloadMap[K]) {
  drawerState = { type, props };
  emit();
}

export function closeDrawer() {
  drawerState = null;
  emit();
}
