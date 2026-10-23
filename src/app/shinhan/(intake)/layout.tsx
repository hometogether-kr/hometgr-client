import type { ReactNode } from "react";

import { ShinhanIntakeProvider, ShinhanStorageProvider } from "@/features/shinhan-intake";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ShinhanIntakeProvider>
      <ShinhanStorageProvider>{children}</ShinhanStorageProvider>
    </ShinhanIntakeProvider>
  );
}
