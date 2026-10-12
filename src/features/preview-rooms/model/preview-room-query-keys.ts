import type { MockRoomSourceOptions } from "./mock-room-source";

export const previewRoomQueryKeys = {
  regions: (options: MockRoomSourceOptions | undefined) =>
    ["room-preview", "regions", options] as const,
  list: (options: MockRoomSourceOptions, filter: string) =>
    ["room-preview", "list", options, filter] as const,
  detail: (options: MockRoomSourceOptions, id: string, viewer: "guest" | "member") =>
    ["room-preview", "detail", options, id, viewer] as const,
};
