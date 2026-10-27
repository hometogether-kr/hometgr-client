export {
  captureDocumentMarketingAttribution,
  cleanupMarketingAttribution,
  MARKETING_ATTRIBUTION_STORAGE_KEY,
  readMarketingAttributionSnapshot,
} from "./model/browser-attribution";
export type { MarketingAttributionSnapshot } from "./model/source-snapshot";
export {
  EMPTY_MARKETING_ATTRIBUTION,
  marketingAttributionSnapshotSchema,
} from "./model/source-snapshot";
