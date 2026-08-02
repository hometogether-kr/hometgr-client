import type { DraftDataDto, DraftMediaDto } from "../api/draft.dto";
import type { ScreenStep } from "./listing-step";

/** 초안 사진 — 서버가 만료 시간이 있는 조회 URL을 함께 내려줍니다. */
export interface DraftPhoto {
  id: string;
  displayOrder: number;
  isRepresentative: boolean;
  originalFilename: string;
  readUrl: string;
  readUrlExpiresAt: Date;
}

export interface ListingDraftSummary {
  draftId: string;
  roomId: string;
  /** 낙관적 잠금 version — 저장 요청마다 그대로 돌려보내야 합니다. */
  version: number;
  /** 다음에 입력할 화면 단계. 모든 단계를 채웠으면 null */
  nextStep: ScreenStep | null;
  completedSteps: readonly ScreenStep[];
  mediaCount: number;
  lastSavedAt: Date;
  expiresAt: Date;
}

export interface ListingDraft extends Omit<ListingDraftSummary, "mediaCount"> {
  data: DraftDataDto;
  photos: readonly DraftPhoto[];
}

export type { DraftDataDto, DraftMediaDto };

/** 초안이 만료됐는지 — 만료된 초안은 이어쓰기 대신 새로 시작해야 합니다. */
export function isDraftExpired(draft: ListingDraftSummary, now: Date = new Date()): boolean {
  return draft.expiresAt.getTime() <= now.getTime();
}

/**
 * 이어서 작성할 초안
 *
 * 만료된 초안은 저장이 거절되므로 건너뜁니다. 목록은 최근 저장 순이라 첫 번째
 * 유효한 초안이 사용자가 마지막으로 작성하던 것입니다.
 */
export function findResumableDraft(
  drafts: readonly ListingDraftSummary[],
  now: Date = new Date(),
): ListingDraftSummary | null {
  return drafts.find((draft) => !isDraftExpired(draft, now)) ?? null;
}

/** 만료까지 남은 일수 — 목록에서 "n일 남음"을 보여줄 때 사용합니다. */
export function daysUntilExpiry(draft: ListingDraftSummary, now: Date = new Date()): number {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((draft.expiresAt.getTime() - now.getTime()) / millisecondsPerDay));
}
