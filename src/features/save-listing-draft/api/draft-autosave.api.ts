import { z } from "zod";

import { draftAutosaveEntrySchema, type ListingDraft, toScreenStep } from "@/domains/listing-draft";
import { apiRequest } from "@/shared/api";

import { draftFormSchemas, type EditableDraftStep } from "../model/draft-form.schema";
import { expectedVersionSchema } from "../model/step-command.schema";

const autosaveResponseSchema = z.object({
  version: expectedVersionSchema,
  nextStep: draftAutosaveEntrySchema.shape.step.nullable(),
  completedSteps: z.array(draftAutosaveEntrySchema.shape.step),
  lastSavedAt: z.iso.datetime({ offset: true }),
  autosaves: z.array(draftAutosaveEntrySchema),
});

export async function saveDraftSnapshot(
  draft: ListingDraft,
  step: EditableDraftStep,
  input: unknown,
): Promise<ListingDraft> {
  const data = draftFormSchemas[step].parse(input);
  const result = await apiRequest({
    method: "PATCH",
    path: `/host/rooms/drafts/${draft.draftId}/autosave`,
    body: { step, expectedVersion: draft.version, data },
    schema: autosaveResponseSchema,
  });
  return {
    ...draft,
    version: result.version,
    nextStep: result.nextStep === null ? null : toScreenStep(result.nextStep),
    completedSteps: result.completedSteps.map(toScreenStep),
    lastSavedAt: new Date(result.lastSavedAt),
    autosaves: result.autosaves,
  };
}
