import { z } from "zod";

import type { MockRoomSourceOptions } from "./mock-room-source";

const previewParamsSchema = z.object({
  preview: z.literal("rooms"),
  previewState: z
    .enum(["normal", "loading", "error", "empty", "listError", "nextPageError", "detailError"])
    .catch("normal"),
});

/** 운영 화면에서는 활성화하지 않는 명시적 로컬 미리보기다. */
export function getRoomPreviewOptions(
  params: Record<string, string | string[] | undefined>,
): MockRoomSourceOptions | undefined {
  if (process.env.NODE_ENV !== "development") return undefined;
  const parsed = previewParamsSchema.safeParse(params);
  if (!parsed.success) return undefined;
  return {
    delayMs: parsed.data.previewState === "loading" ? 1500 : 300,
    emptyCatalog: parsed.data.previewState === "empty",
    failOnce:
      parsed.data.previewState === "error"
        ? ["regions"]
        : parsed.data.previewState === "listError"
          ? ["list"]
          : parsed.data.previewState === "nextPageError"
            ? ["nextPage"]
            : parsed.data.previewState === "detailError"
              ? ["detail"]
              : [],
  };
}
