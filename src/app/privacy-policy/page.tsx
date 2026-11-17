import type { Metadata } from "next";

import { PrivacyPolicyPage } from "@/pages-layer/privacy-policy";

export const metadata: Metadata = {
  title: "개인정보 처리방침",
};

export default function Page() {
  return <PrivacyPolicyPage />;
}
