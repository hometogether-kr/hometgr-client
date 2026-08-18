import type { MarketingSource } from "@/domains/marketing-attribution";
import { KakaoAttributionLanding } from "@/features/kakao-attribution";

interface KakaoAttributionPageProps {
  campaign?: string;
  source: MarketingSource;
}

export function KakaoAttributionPage({ campaign, source }: KakaoAttributionPageProps) {
  return <KakaoAttributionLanding campaign={campaign} source={source} />;
}
