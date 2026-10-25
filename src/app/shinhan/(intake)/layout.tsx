import type { ReactNode } from "react";

import { getShinhanSessionMode } from "@/features/shinhan-bridge";
import { ShinhanIntakeProvider, ShinhanStorageProvider } from "@/features/shinhan-intake";

export default async function Layout({ children }: { children: ReactNode }) {
  const sessionMode = await getShinhanSessionMode();
  return (
    <ShinhanIntakeProvider>
      <ShinhanStorageProvider sessionMode={sessionMode}>{children}</ShinhanStorageProvider>
    </ShinhanIntakeProvider>
  );
}
