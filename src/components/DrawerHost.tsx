import { useEffect, useState } from "react";
import { closeDrawer, getDrawerState, subscribeDrawer, type DrawerState } from "../lib/drawer";
import { Drawer } from "./Drawer";
import { getDrawerTitle, renderDrawerContent } from "../drawers/registry";

export function DrawerHost() {
  const [state, setState] = useState<DrawerState>(() => getDrawerState());

  useEffect(() => {
    return subscribeDrawer(setState);
  }, []);

  if (state == null) return null;

  return (
    <Drawer open title={getDrawerTitle(state)} onClose={closeDrawer}>
      {renderDrawerContent(state)}
    </Drawer>
  );
}
