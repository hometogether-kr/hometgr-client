"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import type { MockRoomSourceOptions } from "./mock-room-source";
import { createMockRoomSource } from "./mock-room-source";
import { previewRoomQueryKeys } from "./preview-room-query-keys";

export function usePreviewRegions(options: MockRoomSourceOptions | undefined, enabled: boolean) {
  const [source] = useState(() => createMockRoomSource(options));
  return useQuery({
    queryKey: previewRoomQueryKeys.regions(options),
    queryFn: () => source.listRegions(),
    enabled: Boolean(options) && enabled,
    retry: false,
  });
}
