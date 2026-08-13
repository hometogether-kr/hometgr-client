import { notFound } from "next/navigation";

import { isMarketingSource } from "@/domains/marketing-attribution";
import { KakaoAttributionPage } from "@/pages-layer/kakao-attribution";

interface KakaoSourcePageProps {
  params: Promise<{ source: string }>;
  searchParams: Promise<{ campaign?: string | string[] }>;
}

function getFirstQueryValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value.slice(0, 160) : undefined;
}

export default async function KakaoSourcePage({ params, searchParams }: KakaoSourcePageProps) {
  const { source } = await params;
  const query = await searchParams;

  if (!isMarketingSource(source)) notFound();

  return <KakaoAttributionPage campaign={getFirstQueryValue(query.campaign)} source={source} />;
}
