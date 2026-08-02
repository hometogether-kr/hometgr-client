import type { DraftPhoto, ListingDraft, ListingDraftSummary } from "../model/draft";
import { type ApiStep, type ScreenStep, toScreenStep } from "../model/listing-step";
import type { DraftDetailDto, DraftMediaDto, DraftSummaryDto } from "./draft.dto";

function toScreenSteps(apiSteps: readonly ApiStep[]): ScreenStep[] {
  return apiSteps.map(toScreenStep);
}

export function toDraftPhoto(dto: DraftMediaDto): DraftPhoto {
  return {
    id: dto.id,
    displayOrder: dto.displayOrder,
    isRepresentative: dto.isRepresentative,
    originalFilename: dto.originalFilename,
    readUrl: dto.readUrl,
    readUrlExpiresAt: new Date(dto.readUrlExpiresAt),
  };
}

export function toListingDraftSummary(dto: DraftSummaryDto): ListingDraftSummary {
  return {
    draftId: dto.draftId,
    roomId: dto.roomId,
    version: dto.version,
    nextStep: dto.nextStep === null ? null : toScreenStep(dto.nextStep),
    completedSteps: toScreenSteps(dto.completedSteps),
    mediaCount: dto.mediaCount,
    lastSavedAt: new Date(dto.lastSavedAt),
    expiresAt: new Date(dto.expiresAt),
  };
}

export function toListingDraft(dto: DraftDetailDto): ListingDraft {
  return {
    draftId: dto.draftId,
    roomId: dto.roomId,
    version: dto.version,
    nextStep: dto.nextStep === null ? null : toScreenStep(dto.nextStep),
    completedSteps: toScreenSteps(dto.completedSteps),
    lastSavedAt: new Date(dto.lastSavedAt),
    expiresAt: new Date(dto.expiresAt),
    data: dto.data,
    photos: [...dto.media].sort((a, b) => a.displayOrder - b.displayOrder).map(toDraftPhoto),
  };
}
