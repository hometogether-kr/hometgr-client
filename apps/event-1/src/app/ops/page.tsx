import type { EventOpsPageProps } from "@/pages-layer/event-ops";
import { EventOpsPage } from "@/pages-layer/event-ops";

export default function Page(props: EventOpsPageProps) {
  return <EventOpsPage {...props} />;
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "이벤트 신청 관리 | 홈투게더" };
