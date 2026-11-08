"use client";

import { useMemo, useSyncExternalStore } from "react";
import { z } from "zod";

import { type HostRoomDetail, hostRoomDetailSchema } from "@/domains/listing-draft";

const RECEIPT_CHANGED = "listing-edit-receipt-changed";
const listingEditReceiptSchema = z.object({
  version: z.literal(1),
  id: z.uuid(),
  room: hostRoomDetailSchema,
});

export type ListingEditReceiptScope = "host" | "preview";
export type ListingEditReceipt = z.infer<typeof listingEditReceiptSchema>;

function receiptKey(scope: ListingEditReceiptScope, roomId: string): string {
  return `listing-edit-receipt:v1:${scope}:${roomId}`;
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(RECEIPT_CHANGED, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(RECEIPT_CHANGED, onChange);
  };
}

function readReceipt(raw: string | null | undefined, roomId: string) {
  if (raw === undefined) return undefined;
  if (!raw) return null;
  try {
    const parsed = listingEditReceiptSchema.safeParse(JSON.parse(raw));
    return parsed.success && parsed.data.room.roomId === roomId ? parsed.data : null;
  } catch {
    return null;
  }
}

/** undefined는 hydration 전, null은 이 탭에 저장 완료 기록이 없다는 뜻입니다. */
export function useListingEditReceipt(scope: ListingEditReceiptScope, roomId: string) {
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return window.sessionStorage.getItem(receiptKey(scope, roomId));
      } catch {
        return null;
      }
    },
    () => undefined,
  );
  return useMemo(() => readReceipt(raw, roomId), [raw, roomId]);
}

/** 서버 저장 성공 후에만 기록합니다. 새 편집 URL에는 완료 기록 ID를 붙이지 않습니다. */
export function saveListingEditReceipt(
  scope: ListingEditReceiptScope,
  room: HostRoomDetail,
): ListingEditReceipt {
  const receipt = listingEditReceiptSchema.parse({ version: 1, id: crypto.randomUUID(), room });
  window.sessionStorage.setItem(receiptKey(scope, room.roomId), JSON.stringify(receipt));
  window.dispatchEvent(new Event(RECEIPT_CHANGED));
  return receipt;
}

function readPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = z.string().startsWith("data:image/").safeParse(reader.result);
      if (parsed.success) resolve(parsed.data);
      else reject(new Error("입력값을 다시 확인해주세요."));
    };
    reader.onerror = () => reject(reader.error ?? new Error("잠시 후 다시 시도해주세요."));
    reader.readAsDataURL(file);
  });
}

/** blob URL은 새로고침 후 유효하지 않으므로 개발용 로컬 사진도 복원 가능한 값으로 저장합니다. */
export async function createRestorableListing(
  room: HostRoomDetail,
  files: ReadonlyMap<string, File>,
): Promise<HostRoomDetail> {
  const media = await Promise.all(
    room.media.map(async (photo) => {
      const file = files.get(photo.id);
      if (!file || !photo.readUrl.startsWith("blob:")) return photo;
      return { ...photo, readUrl: await readPhoto(file) };
    }),
  );
  return hostRoomDetailSchema.parse({ ...room, media });
}
