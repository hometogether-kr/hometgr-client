"use client";

import { useEffect } from "react";

import {
  captureDocumentMarketingAttribution,
  cleanupMarketingAttribution,
  MARKETING_ATTRIBUTION_STORAGE_KEY,
} from "@/domains/marketing-attribution/browser";

export function MarketingAttributionObserver() {
  useEffect(() => {
    let stopped = false;
    let timer: number | undefined;
    let cleanupRevision = 0;
    const cleanup = async () => {
      const revision = ++cleanupRevision;
      window.clearTimeout(timer);
      const expiresAt = await cleanupMarketingAttribution();
      if (revision === cleanupRevision && !stopped && expiresAt !== null) {
        timer = window.setTimeout(
          () => {
            void cleanup().catch(() => {});
          },
          Math.min(Math.max(expiresAt - Date.now(), 1), 2_147_483_647),
        );
      }
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === MARKETING_ATTRIBUTION_STORAGE_KEY) void cleanup().catch(() => {});
    };
    void captureDocumentMarketingAttribution()
      .then(cleanup)
      .catch(() => {
        // Tracking storage is optional and must never interrupt a customer action.
      });
    window.addEventListener("storage", onStorage);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return null;
}
