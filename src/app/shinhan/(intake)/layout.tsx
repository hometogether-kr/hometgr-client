import type { ReactNode } from "react";

import { ShinhanIntakeProvider } from "@/features/shinhan-intake";

export default function Layout({ children }: { children: ReactNode }) {
  return <ShinhanIntakeProvider>{children}</ShinhanIntakeProvider>;
}
