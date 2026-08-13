export const MARKETING_SOURCES = [
  "instagram",
  "everytime",
  "daangn",
  "website",
  "offline_qr",
] as const;

export type MarketingSource = (typeof MARKETING_SOURCES)[number];

export const TRACKING_EVENT_NAMES = ["landing_view", "kakao_chat_click"] as const;

export type TrackingEventName = (typeof TRACKING_EVENT_NAMES)[number];

export function isMarketingSource(value: string): value is MarketingSource {
  return (MARKETING_SOURCES as readonly string[]).includes(value);
}
