"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import { fetchVisitRequestContext, reservationQueryKeys } from "@/domains/reservation";
import { ApiError } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { BtnCta } from "@/shared/ui/btn-cta";
import { Icon } from "@/shared/ui/icons";
import { useToast } from "@/shared/ui/toast";

import { createVisitDateOptions } from "../model/create-visit-date-options";
import { useCreateReservation } from "../model/use-create-reservation";
import { useVisitSelection } from "../model/use-visit-selection";
import type { VisitDateOption } from "../model/visit-request.types";
import { DateStrip } from "./date-strip";
import { SelectedVisitSlots } from "./selected-visit-slots";
import { TimeSlotGrid } from "./time-slot-grid";
import { VisitRequestUnavailable } from "./visit-request-unavailable";

export interface VisitSlotPickerProps {
  roomId: string;
}

function getAvailableVisitTimes(dates: VisitDateOption[]) {
  return new Set(
    dates.flatMap(({ slots }) =>
      slots.filter(({ available }) => available).map(({ startsAt }) => startsAt),
    ),
  );
}

export function VisitSlotPicker({ roomId }: VisitSlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<string>();
  const [submitState, setSubmitState] = useState<"idle" | "refreshing" | "complete">("idle");
  const submissionInProgress = useRef(false);
  const router = useRouter();
  const { showToast } = useToast();
  const { createReservation, isCreating } = useCreateReservation();
  const contextQuery = useQuery({
    queryKey: reservationQueryKeys.visitRequestContext(roomId),
    queryFn: ({ signal }) => fetchVisitRequestContext(roomId, signal),
    staleTime: 0,
    gcTime: 0,
    refetchOnReconnect: false,
  });
  const context = contextQuery.data;
  const dateOptions = useMemo(() => (context ? createVisitDateOptions(context) : []), [context]);
  const availableVisitTimes = useMemo(() => getAvailableVisitTimes(dateOptions), [dateOptions]);
  const maxVisitTimes = context?.policy.maxCandidates ?? 0;
  const {
    selectedVisitTimes,
    selectionMessage,
    toggleVisitTime,
    removeVisitTime,
    retainAvailableVisitTimes,
  } = useVisitSelection(maxVisitTimes, availableVisitTimes);
  const selectedDateOption =
    dateOptions.find((option) => option.date === selectedDate) ?? dateOptions[0];
  const isBusy = isCreating || contextQuery.isFetching || submitState !== "idle";

  const refreshAfterConflict = async () => {
    setSubmitState("refreshing");
    try {
      const latest = await contextQuery.refetch();
      if (!latest.isSuccess) return;
      retainAvailableVisitTimes(getAvailableVisitTimes(createVisitDateOptions(latest.data)));
    } finally {
      setSubmitState("idle");
    }
  };

  const handleSubmit = async () => {
    if (submissionInProgress.current || isBusy || selectedVisitTimes.length === 0) return;
    submissionInProgress.current = true;

    try {
      const { reservation } = await createReservation({
        roomId,
        visitRequestTimes: selectedVisitTimes,
      });
      setSubmitState("complete");
      showToast("방문 예약을 요청했어요.", { variant: "success" });
      router.push(ROUTES.reservationDetail(reservation.id));
    } catch (error) {
      if (error instanceof ApiError && error.code === "ROOM_SLOT_UNAVAILABLE") {
        showToast("선택한 시간 중 예약이 마감된 시간이 있어요. 가능한 시간을 다시 확인해 주세요.", {
          variant: "error",
        });
        await refreshAfterConflict();
      } else {
        showToast(error instanceof ApiError ? error.message : "방문 예약을 요청하지 못했어요.", {
          variant: "error",
        });
        if (
          error instanceof ApiError &&
          (error.code === "DUPLICATE_ACTIVE_RESERVATION" ||
            error.kind === "forbidden" ||
            error.kind === "notFound")
        ) {
          await refreshAfterConflict();
        }
      }
    } finally {
      submissionInProgress.current = false;
    }
  };

  if (contextQuery.isError) {
    const missing =
      contextQuery.error instanceof ApiError && contextQuery.error.kind === "notFound";
    return (
      <section className="space-y-4 rounded-[20px] bg-white p-5 md:p-10">
        <p role="status" className="text-body-1 text-grayscale-700">
          {missing
            ? "현재 이 매물은 방문 예약을 신청할 수 없어요."
            : "방문 가능 시간을 불러오지 못했어요."}
        </p>
        {!missing && (
          <BtnCta
            variant="sub"
            loading={contextQuery.isFetching}
            onClick={() => void refreshAfterConflict()}
          >
            다시 불러오기
          </BtnCta>
        )}
      </section>
    );
  }

  if (!context) {
    return (
      <p
        role="status"
        className="rounded-[20px] bg-white p-5 text-body-1 text-grayscale-700 md:p-10"
      >
        방문 가능 시간을 불러오고 있어요.
      </p>
    );
  }

  if (!context.canRequestVisit) {
    return <VisitRequestUnavailable context={context} roomId={roomId} />;
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <fieldset
        disabled={isBusy}
        aria-labelledby="visit-slots-heading"
        className="min-w-0 rounded-[20px] bg-white p-5 md:p-10"
      >
        <div className="flex items-center justify-between gap-4">
          <h2
            id="visit-slots-heading"
            className="text-headline-1 font-bold text-grayscale-900 md:text-title-3"
          >
            방문 희망 시간
          </h2>
          <span className="text-body-1 font-bold text-primary-500" aria-live="polite">
            {selectedVisitTimes.length}/{maxVisitTimes}
          </span>
        </div>

        <div className="mt-5 min-h-9">
          <SelectedVisitSlots selectedVisitTimes={selectedVisitTimes} onRemove={removeVisitTime} />
        </div>

        <div className="my-6 h-px bg-grayscale-200 md:my-8" />

        <div className="space-y-4">
          <h3 className="text-body-1 font-semibold text-grayscale-800">날짜를 선택해 주세요</h3>
          <DateStrip
            dates={dateOptions}
            selectedDate={selectedDateOption?.date ?? ""}
            onDateSelect={setSelectedDate}
          />
        </div>

        <div className="mt-7 space-y-4">
          <h3 className="text-body-1 font-semibold text-grayscale-800">시간을 선택해 주세요</h3>
          <TimeSlotGrid
            slots={selectedDateOption?.slots ?? []}
            selectedVisitTimes={selectedVisitTimes}
            onSlotToggle={toggleVisitTime}
          />
        </div>

        <div className="mt-6 flex items-start gap-2 rounded-xl bg-grayscale-70 p-4 text-label-1 text-grayscale-600">
          <Icon name="info" size={20} className="mt-0.5 shrink-0 text-primary-500" />
          <div className="space-y-1">
            <p>
              호스트가 일정을 확인할 수 있도록 가능한 시간을 최대 {maxVisitTimes}개 선택해 주세요.
            </p>
            <p>호스트가 마지막 희망 시간까지 일정을 확정하지 않으면 신청이 만료돼요.</p>
            <p>확정된 방문은 방문 전날 0시 전에 취소할 수 있어요.</p>
          </div>
        </div>
        <p className="sr-only" aria-live="assertive">
          {selectionMessage}
        </p>
      </fieldset>

      <BtnCta
        size="l"
        className="w-full md:ml-auto md:flex md:w-[280px]"
        disabled={isBusy || selectedVisitTimes.length === 0}
        loading={isCreating || submitState === "complete"}
        onClick={() => void handleSubmit()}
      >
        {isCreating || submitState === "complete" ? "요청 중..." : "방문 예약 요청하기"}
      </BtnCta>
    </div>
  );
}
