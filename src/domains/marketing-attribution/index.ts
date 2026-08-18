export { appendAttributionEventToGoogleSheet } from "./api/google-sheets.server";
export type { MarketingSource, TrackingEventName } from "./model/attribution";
export { isMarketingSource, MARKETING_SOURCES, TRACKING_EVENT_NAMES } from "./model/attribution";
export type { AttributionEventInput, AttributionEventRecord } from "./model/attribution.schema";
export { attributionEventInputSchema } from "./model/attribution.schema";
