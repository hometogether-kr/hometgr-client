"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";

import {
  type ListingDraft,
  listingDraftQueryKeys,
  toScreenStep,
  useListingDraft,
} from "@/domains/listing-draft";
import { ApiError } from "@/shared/api";
import { ROUTES } from "@/shared/config";

import { saveDraftSnapshot } from "../api/draft-autosave.api";
import { saveListingDraftStep } from "../api/draft-command.api";
import type { EditableDraftStep } from "./draft-form.schema";
import { type SaveStepCommand, STEP_DATA_SCHEMA } from "./step-command.schema";

export function useDraftFormSession(step: EditableDraftStep) {
  const params = useSearchParams();
  const parsedId = z.uuid().safeParse(params.get("draftId"));
  const draftId = parsedId.success ? parsedId.data : null;
  const { draft, isLoading, error: loadError } = useListingDraft(draftId);
  const router = useRouter();
  const queryClient = useQueryClient();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<unknown>(undefined);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const blocked = useRef(false);
  const busy = useRef(false);
  const active = useRef(true);
  const revision = useRef(0);
  const leaving = useRef(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [status, setStatus] = useState(
    "입력 내용은 자동 저장됩니다. 임시저장은 생성 후 24시간까지 유지됩니다.",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    active.current = true;
    const warnUnsaved = (event: BeforeUnloadEvent) => {
      if (pending.current === undefined && !busy.current) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warnUnsaved);
    return () => {
      active.current = false;
      if (timer.current) clearTimeout(timer.current);
      window.removeEventListener("beforeunload", warnUnsaved);
    };
  }, []);

  const currentDraft = () => {
    const current = draftId
      ? queryClient.getQueryData<ListingDraft>(listingDraftQueryKeys.detail(draftId))
      : null;
    if (!current) throw new Error("초안을 불러오지 못했습니다. 초안 목록에서 다시 열어주세요.");
    if (current.expiresAt.getTime() <= Date.now())
      throw new Error("생성 후 24시간이 지나 만료된 초안입니다. 새 등록을 시작해주세요.");
    if (blocked.current)
      throw new Error(
        "저장 충돌이 발생했습니다. 현재 입력을 확인한 뒤 새로고침하여 서버의 최신 초안을 불러와주세요.",
      );
    return current;
  };

  const persist = async (operation: (current: ListingDraft) => Promise<ListingDraft>) => {
    busy.current = true;
    if (active.current) {
      setIsSaving(true);
      setSaveError(null);
      setStatus("저장 중입니다.");
    }
    try {
      const updated = await operation(currentDraft());
      queryClient.setQueryData(listingDraftQueryKeys.detail(updated.draftId), updated);
      void queryClient.invalidateQueries({ queryKey: listingDraftQueryKeys.lists() });
      if (active.current) setStatus("저장되었습니다. 만료 시각은 연장되지 않습니다.");
    } catch (error) {
      if (error instanceof ApiError && error.kind === "conflict") blocked.current = true;
      const message = blocked.current
        ? "다른 저장 또는 만료로 충돌했습니다. 입력을 확인한 뒤 새로고침해주세요. 자동 덮어쓰기는 중단했습니다."
        : error instanceof Error
          ? error.message
          : "저장하지 못했습니다. 입력은 현재 화면에 남아 있습니다.";
      if (active.current) {
        setSaveError(message);
        setStatus("저장되지 않은 입력이 있습니다.");
      }
      throw error;
    } finally {
      busy.current = false;
      if (active.current) setIsSaving(false);
    }
  };

  const flush = () => {
    if (timer.current) clearTimeout(timer.current);
    const snapshot = pending.current;
    const snapshotRevision = revision.current;
    if (snapshot === undefined) {
      // A previous completed-save failure may be retried, but an in-flight
      // autosave failure must keep navigation on this form.
      return busy.current ? queue.current : queue.current.catch(() => undefined);
    }
    pending.current = undefined;
    const task = queue.current
      .catch(() => undefined)
      .then(() => persist((current) => saveDraftSnapshot(current, step, snapshot)));
    queue.current = task;
    void task.catch(() => {
      if (pending.current === undefined && revision.current === snapshotRevision)
        pending.current = snapshot;
    });
    return task;
  };

  const onChange = (values: unknown) => {
    if (leaving.current) return;
    revision.current += 1;
    pending.current = values;
    setStatus("변경 내용을 저장할 예정입니다.");
    if (timer.current) clearTimeout(timer.current);
    if (!blocked.current)
      timer.current = setTimeout(() => {
        void flush().catch(() => undefined);
      }, 700);
  };

  const saveAndGoNext = async (input: unknown) => {
    if (leaving.current) return;
    const parsed = STEP_DATA_SCHEMA[step].safeParse(input);
    if (!parsed.success) {
      setSaveError(parsed.error.issues.map((issue) => issue.message).join(" "));
      return;
    }
    leaving.current = true;
    setIsNavigating(true);
    try {
      await flush();
      const task = queue.current.then(() =>
        persist(async (current) => {
          const command = {
            step,
            expectedVersion: current.version,
            data: parsed.data,
          } as SaveStepCommand;
          return saveListingDraftStep(current.draftId, command);
        }),
      );
      queue.current = task;
      await task;
      pending.current = undefined;
      router.push(ROUTES.listing.step(toScreenStep(step) + 1, draftId ?? undefined));
    } catch {
      leaving.current = false;
      setIsNavigating(false);
      /* persist keeps the input and displays the failure. */
    }
  };

  const goPrev = async () => {
    if (leaving.current) return;
    leaving.current = true;
    setIsNavigating(true);
    try {
      await flush();
      router.push(ROUTES.listing.step(toScreenStep(step) - 1, draftId ?? undefined));
    } catch {
      leaving.current = false;
      setIsNavigating(false);
      /* Remain on the form so an unsaved edit is not lost. */
    }
  };

  return {
    draft,
    isLoading,
    loadError,
    isSaving: isSaving || isNavigating,
    status,
    saveError,
    onChange,
    saveAndGoNext,
    goPrev,
  };
}
