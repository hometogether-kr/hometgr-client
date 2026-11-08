import { z } from "zod";

const returnHrefSchema = z
  .string()
  .max(2048)
  .refine((value) => {
    if (!value.startsWith("/rooms") || /[\\\u0000-\u0020]/.test(value)) return false;
    try {
      const url = new URL(value, "https://app.invalid");
      return url.origin === "https://app.invalid" && url.pathname === "/rooms" && !url.hash;
    } catch {
      return false;
    }
  });

export function parseRoomListReturnHref(value: unknown): string {
  const parsed = returnHrefSchema.safeParse(value);
  return parsed.success ? parsed.data : "/rooms";
}

const positionSchema = z.object({
  href: returnHrefSchema,
  roomId: z.string().max(200),
  scrollY: z.number().nonnegative().finite(),
  offset: z.number().finite(),
  savedAt: z.number().finite(),
});
const positionsSchema = z.array(positionSchema).max(10);
const STORAGE_KEY = "ht_room_list_positions_v1";
const MAX_AGE_MS = 30 * 60 * 1000;

function readPositions() {
  try {
    const parsed = positionsSchema.safeParse(
      JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]"),
    );
    return parsed.success
      ? parsed.data.filter((item) => Date.now() - item.savedAt < MAX_AGE_MS)
      : [];
  } catch {
    return [];
  }
}

export function readRoomListPosition(href: string) {
  return readPositions().find((item) => item.href === href);
}

export function clearRoomListPosition(href: string) {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(readPositions().filter((item) => item.href !== href)),
    );
  } catch {
    // 저장소를 사용할 수 없어도 검색과 이동은 계속 동작합니다.
  }
}

export function saveRoomListPosition(href: string, roomId: string) {
  const card = document.getElementById(`room-card-${roomId}`);
  const position = positionSchema.safeParse({
    href,
    roomId,
    scrollY: window.scrollY,
    offset: card?.getBoundingClientRect().top ?? 0,
    savedAt: Date.now(),
  });
  if (!position.success) return;
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        ...readPositions()
          .filter((item) => item.href !== href)
          .slice(-9),
        position.data,
      ]),
    );
  } catch {
    // 목록 데이터는 저장하지 않습니다. 브라우저 기본 뒤로가기는 그대로 사용할 수 있습니다.
  }
}
