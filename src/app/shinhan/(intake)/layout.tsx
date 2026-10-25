import type { ReactNode } from "react";

import { getShinhanSessionMode } from "@/features/shinhan-bridge";
import {
  ShinhanEntryProvider,
  ShinhanIntakeProvider,
  ShinhanStorageProvider,
} from "@/features/shinhan-intake";

export default async function Layout({ children }: { children: ReactNode }) {
  const sessionMode = await getShinhanSessionMode();
  return (
    <ShinhanEntryProvider available={sessionMode !== "unavailable"}>
      <ShinhanIntakeProvider>
        <ShinhanStorageProvider sessionMode={sessionMode}>{children}</ShinhanStorageProvider>
      </ShinhanIntakeProvider>
    </ShinhanEntryProvider>
  );
}
