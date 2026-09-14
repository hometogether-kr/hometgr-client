"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import {
  formatHostVisitChoice,
  type HostReservation,
  useHostReservation,
} from "@/domains/reservation";
import { ApiError } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { BtnCta } from "@/shared/ui/btn-cta";
import { Modal } from "@/shared/ui/modal";

import { useHostReservationCommands } from "../model/use-host-reservation-commands";
import { useHostReservations } from "../model/use-host-reservations";
import { HostReservationList } from "./host-reservation-list";
import {
  HostChoices,
  HostHeading,
  HostPanel,
  HostSuccessHeading,
  StudentAvatar,
} from "./host-reservation-parts";
import { HostReservationSummary } from "./host-reservation-summary";

/* eslint-disable @next/next/no-img-element -- Local original Figma assets. */
const viewSchema = z.enum([
  "select",
  "reject",
  "suggest",
  "confirmed",
  "change",
  "changed",
  "closed",
]);
const tabSchema = z.enum(["all", "pending", "confirmed", "past"]);
const reasonOptions = [
  "선택지 중 되는 시간이 없어요",
  "성별이 맞지 않아요",
  "게스트 정보가 부족해요",
  "기타",
];
const suggestionOptions = [
  "주중 오전",
  "주중 오후",
  "주말 오전",
  "주말 오후",
  "이번주는 어려워요",
  "기타",
];
const scheduleSchema = z
  .string()
  .datetime({ local: true })
  .refine((value) => new Date(value).getTime() > Date.now(), "현재보다 이후 시간을 선택해주세요.");

export function HostReservationFlow() {
  const query = useSearchParams();
  const { reservations, updateReservation } = useHostReservations();
  const reservationId = query.get("id");
  const parsedReservationId = z.uuid().safeParse(reservationId);
  const apiReservationId = parsedReservationId.success ? parsedReservationId.data : "";
  const apiReservation = useHostReservation(apiReservationId);
  const parsedTab = tabSchema.safeParse(query.get("tab") ?? "all");
  const parsedPage = z.coerce
    .number()
    .int()
    .min(1)
    .safeParse(query.get("page") ?? 1);
  const parsedView = viewSchema.safeParse(query.get("view"));
  const reservation = parsedReservationId.success
    ? apiReservation.reservation
    : reservations.find((item) => item.id === reservationId);
  return (
    <div className="mx-auto w-full max-w-[1208px] px-4">
      {!reservationId ? (
        <HostReservationList
          page={parsedPage.success ? parsedPage.data : 1}
          reservations={reservations}
          tab={parsedTab.success ? parsedTab.data : "all"}
        />
      ) : apiReservation.isLoading ? (
        <div
          className="my-20 min-h-[520px] animate-pulse rounded-[20px] bg-grayscale-100"
          aria-label="예약 상세를 불러오는 중"
        />
      ) : apiReservation.error || !reservation ? (
        <div className="py-20 text-center">
          <h1 className="text-heading-2 font-semibold">예약을 불러오지 못했어요.</h1>
          <Link href={ROUTES.hostReservations} className="mt-5 inline-block underline">
            목록으로
          </Link>
        </div>
      ) : (
        <HostReservationEditor
          key={`${reservation.id}:${parsedView.success ? parsedView.data : "select"}`}
          reservation={reservation}
          view={parsedView.success ? parsedView.data : "select"}
          isApiReservation={parsedReservationId.success}
          updateReservation={updateReservation}
        />
      )}
      {!parsedReservationId.success && (
        <p className="mx-auto my-6 max-w-[936px] text-center text-label-2 text-grayscale-500">
          예약 목록 API가 아직 없어 목록은 디자인 예시로 표시됩니다.
        </p>
      )}
    </div>
  );
}

interface EditorProps {
  reservation: HostReservation;
  view: z.infer<typeof viewSchema>;
  isApiReservation: boolean;
  updateReservation: ReturnType<typeof useHostReservations>["updateReservation"];
}
function HostReservationEditor({
  reservation,
  view: requestedView,
  isApiReservation,
  updateReservation,
}: EditorProps) {
  const router = useRouter();
  const [openedAt] = useState(() => Date.now());
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [other, setOther] = useState("");
  const [newTime, setNewTime] = useState(reservation.scheduledTime ?? "");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const { acceptReservation, rejectReservation, isSubmitting } = useHostReservationCommands();
  const closed = ["rejected", "cancelled"].includes(reservation.status);
  const view = closed
    ? "closed"
    : reservation.status === "confirmed"
      ? ["confirmed", "change", "changed"].includes(requestedView)
        ? requestedView
        : "confirmed"
      : ["confirmed", "change", "changed", "closed"].includes(requestedView)
        ? "select"
        : requestedView;
  const go = (next: string) =>
    router.push(`${ROUTES.hostReservations}?id=${reservation.id}&view=${next}`);
  function save(changes: Parameters<EditorProps["updateReservation"]>[1], next?: string) {
    if (isApiReservation) {
      setError("이 변경을 저장하는 API가 아직 제공되지 않습니다.");
      return;
    }
    try {
      updateReservation(reservation.id, changes);
      if (next) go(next);
      else router.push(ROUTES.hostReservations);
    } catch {
      setError("변경 사항을 저장하지 못했어요. 브라우저 저장 공간을 확인하고 다시 시도해주세요.");
    }
  }
  const visitChoices = reservation.requestedVisitTimes.map((value) => {
    const display = formatHostVisitChoice(value);
    return { value, ...display, closed: new Date(value).getTime() <= openedAt };
  });
  async function confirmTime() {
    const slot = visitChoices.find((item) => item.value === selectedTime);
    if (!slot || slot.closed || !scheduleSchema.safeParse(slot.value).success) {
      setError("예약 가능한 시간을 선택해주세요.");
      return;
    }
    if (!isApiReservation) {
      save({ status: "confirmed", scheduledTime: slot.value, suggestion: "" }, "confirmed");
      return;
    }

    try {
      await acceptReservation(reservation.id);
      go("confirmed");
    } catch (error) {
      setError(error instanceof ApiError ? error.message : "예약을 수락하지 못했어요.");
    }
  }
  async function reject() {
    if (reason === reasonOptions[0]) {
      go("suggest");
      return;
    }
    if (!reason || (reason === "기타" && !other.trim())) {
      setError("거절 사유를 입력해주세요.");
      return;
    }
    const message = reason === "기타" ? other.trim() : reason;
    if (!isApiReservation) {
      save({ status: "rejected", reason: message });
      return;
    }

    try {
      await rejectReservation({
        reservationId: reservation.id,
        reason:
          reason === "성별이 맞지 않아요" || reason === "게스트 정보가 부족해요"
            ? "conditionMismatch"
            : "other",
        message,
      });
      go("closed");
    } catch (error) {
      setError(error instanceof ApiError ? error.message : "예약을 거절하지 못했어요.");
    }
  }
  const completion = ["confirmed", "changed"].includes(view);
  return (
    <div className={completion ? "py-12 md:py-[120px]" : "pt-10 pb-[120px]"}>
      {!completion && (
        <Link
          href={ROUTES.hostReservations}
          className="mb-7 inline-flex items-center text-xl font-semibold"
        >
          <img src="/figma/host-reservation-back.svg" alt="" className="m-2 size-9" />
          목록으로
        </Link>
      )}
      <div className="mx-auto flex w-full max-w-[936px] flex-col gap-16">
        {view === "select" && (
          <>
            <header className="flex flex-col items-center gap-3 text-center">
              <span className="mb-4 flex size-[90px] items-center justify-center rounded-full bg-primary-100">
                <img src="/figma/host-visit-calendar.svg" alt="" className="h-[49px] w-10" />
              </span>
              <HostHeading>
                학생이 아래 시간 중 하나에 방문하고 싶어해요.
                <br />
                언제가 편하세요?
              </HostHeading>
              <p className="text-body-2 text-grayscale-600">
                학생이 신청한 방문 시간 중 편한 시간을 골라주세요.
              </p>
              {reservation.suggestion && (
                <p className="text-primary-500">추천한 시간대: {reservation.suggestion}</p>
              )}
            </header>
            <div className="flex flex-col gap-8">
              <HostPanel>
                <h2 className="mb-6 text-2xl font-semibold">학생 정보</h2>
                <div className="flex items-center gap-6">
                  <StudentAvatar />
                  <div>
                    <h3 className="text-2xl font-semibold">{reservation.studentName} 님</h3>
                    <p className="mt-3 text-label-1 text-grayscale-600">
                      자기소개: &quot;{reservation.introduction}&quot;
                    </p>
                  </div>
                </div>
              </HostPanel>
              <HostPanel>
                <h2 className="mb-6 text-2xl font-semibold">되는 시간을 선택해주세요</h2>
                <HostChoices
                  label="방문 시간"
                  value={selectedTime}
                  onChange={setSelectedTime}
                  items={visitChoices.map((item) => ({
                    value: item.value,
                    label: item.label,
                    detail: item.time,
                    disabled: item.closed,
                  }))}
                />
                {visitChoices.length === 0 && (
                  <p className="text-body-1 text-grayscale-600">
                    학생이 선택한 방문 시간이 없습니다.
                  </p>
                )}
              </HostPanel>
            </div>
            <div className="flex gap-3">
              <BtnCta size="xl" variant="emphasize" className="flex-1" onClick={() => go("reject")}>
                거절할래요
              </BtnCta>
              <BtnCta
                size="xl"
                className="flex-1"
                disabled={!selectedTime}
                loading={isSubmitting}
                onClick={() => void confirmTime()}
              >
                {isSubmitting ? "처리 중..." : isApiReservation ? "예약 수락" : "시간 확정"}
              </BtnCta>
            </div>
          </>
        )}
        {view === "reject" && (
          <>
            <HostHeading>어떤 이유로 거절하시는지 알려주시면, 입주자에게 전달드릴게요</HostHeading>
            <HostChoices
              label="거절 사유"
              items={reasonOptions.map((label) => ({ value: label, label }))}
              value={reason}
              onChange={setReason}
            />
            {reason === "기타" && (
              <OtherInput value={other} onChange={setOther} label="기타 거절 사유" />
            )}
            <div className="flex gap-3">
              <BtnCta
                size="xl"
                variant="emphasize"
                className="flex-1"
                disabled={isSubmitting}
                onClick={() => go("suggest")}
              >
                되는 시간이 없어요
              </BtnCta>
              <BtnCta
                size="xl"
                className="flex-1"
                disabled={!reason || (reason === "기타" && !other.trim())}
                loading={isSubmitting}
                onClick={() => void reject()}
              >
                {isSubmitting
                  ? "처리 중..."
                  : reason === reasonOptions[0]
                    ? "대안 시간 선택"
                    : "거절 완료"}
              </BtnCta>
            </div>
          </>
        )}
        {view === "suggest" && (
          <>
            <HostHeading>
              어떤 시간이 더 편한지 알려주시면, 학생에게 다시 전달해드릴게요
            </HostHeading>
            <HostChoices
              centered
              label="추천 시간대"
              items={suggestionOptions.map((label) => ({ value: label, label }))}
              value={suggestion}
              onChange={setSuggestion}
            />
            {suggestion === "기타" && (
              <OtherInput value={other} onChange={setOther} label="기타 추천 시간" />
            )}
            <BtnCta
              size="xl"
              disabled={!suggestion || (suggestion === "기타" && !other.trim())}
              onClick={() => {
                if (isApiReservation) {
                  setError("대안 시간 제안 API가 아직 제공되지 않습니다.");
                  return;
                }
                save({
                  status: "suggested",
                  suggestion: suggestion === "기타" ? other.trim() : suggestion,
                  reason: reasonOptions[0],
                });
              }}
            >
              선택 완료
            </BtnCta>
          </>
        )}
        {view === "confirmed" && (
          <>
            <div className="flex flex-col gap-10">
              <HostSuccessHeading
                title={
                  isApiReservation && !reservation.scheduledTime
                    ? "예약을 수락했습니다!"
                    : "예약이 확정되었습니다!"
                }
              >
                {isApiReservation && !reservation.scheduledTime ? (
                  <>확정 방문 시간은 서버 응답에 포함되지 않았습니다.</>
                ) : (
                  <>
                    {reservation.studentName} 학생과의 매칭이 완료되었습니다.
                    <br />
                    정해진 시간에 방문할 예정입니다.
                  </>
                )}
              </HostSuccessHeading>
              <HostReservationSummary reservation={reservation} usesLiveApi={isApiReservation} />
            </div>
            <div className="mx-auto flex w-full max-w-[672px] gap-3">
              <BtnCta
                variant="sub"
                size="xl"
                className="flex-1"
                onClick={() => {
                  if (isApiReservation) {
                    setError("집주인 예약 취소 API가 아직 제공되지 않습니다.");
                    return;
                  }
                  setCancelOpen(true);
                }}
              >
                예약 취소
              </BtnCta>
              <BtnCta
                size="xl"
                className="flex-1"
                onClick={() => {
                  if (isApiReservation) {
                    setError("방문 일정 변경 API가 아직 제공되지 않습니다.");
                    return;
                  }
                  go("change");
                }}
              >
                일정 변경하기
              </BtnCta>
            </div>
            <Link
              href={ROUTES.hostReservations}
              className="text-center text-grayscale-600 underline"
            >
              목록으로
            </Link>
          </>
        )}
        {view === "change" && (
          <>
            <HostHeading>학생과 합의한 새로운 방문 일정을 알려주세요</HostHeading>
            <HostPanel>
              <label className="flex flex-col gap-3 text-xl">
                변경 날짜 / 시간
                <input
                  type="datetime-local"
                  value={newTime}
                  onChange={(event) => setNewTime(event.target.value)}
                  className="w-full rounded-xl border border-grayscale-300 p-4"
                />
              </label>
              <label className="mt-6 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(event) => setAgreed(event.target.checked)}
                  className="size-5"
                />
                학생과 새로운 일정을 합의했어요.
              </label>
            </HostPanel>
            <BtnCta
              size="xl"
              disabled={!agreed || !newTime || newTime === reservation.scheduledTime}
              onClick={() => {
                const parsed = scheduleSchema.safeParse(
                  newTime.length === 16 ? `${newTime}:00` : newTime,
                );
                if (!parsed.success) {
                  setError("현재보다 이후의 올바른 날짜와 시간을 선택해주세요.");
                  return;
                }
                save({ scheduledTime: newTime }, "changed");
              }}
            >
              일정 변경 완료
            </BtnCta>
          </>
        )}
        {view === "changed" && (
          <>
            <div className="flex flex-col gap-10">
              <HostSuccessHeading title="일정이 변경되었어요!">
                입주자와 합의된 새로운 일정으로 예약 정보가 업데이트되었습니다.
              </HostSuccessHeading>
              <HostReservationSummary
                reservation={reservation}
                compact
                usesLiveApi={isApiReservation}
              />
            </div>
            <div className="mx-auto flex w-full max-w-[500px] flex-col gap-3">
              <BtnCta size="xl" onClick={() => router.push(ROUTES.hostReservations)}>
                확인
              </BtnCta>
              <BtnCta size="xl" variant="sub" onClick={() => go("confirmed")}>
                상세 일정보기
              </BtnCta>
            </div>
          </>
        )}
        {view === "closed" && (
          <>
            <HostHeading>
              {reservation.status === "rejected" ? "거절된 예약입니다" : "취소된 예약입니다"}
            </HostHeading>
            <HostPanel>
              <p>{reservation.studentName} 님</p>
              <p className="mt-4">{reservation.reason || "집주인이 예약을 취소했어요."}</p>
            </HostPanel>
          </>
        )}
        {error && (
          <p role="alert" className="text-system-error">
            {error}
          </p>
        )}
      </div>
      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="예약을 취소할까요?"
        footer={
          <div className="flex gap-3">
            <BtnCta variant="stroke" onClick={() => setCancelOpen(false)}>
              닫기
            </BtnCta>
            <BtnCta
              onClick={() => {
                save({ status: "cancelled" });
                setCancelOpen(false);
              }}
            >
              예약 취소
            </BtnCta>
          </div>
        }
      >
        <p>확정된 방문 일정이 취소됩니다.</p>
      </Modal>
    </div>
  );
}
function OtherInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <label className="flex flex-col gap-3">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={500}
        rows={3}
        className="rounded-xl border border-grayscale-300 bg-white p-4"
        required
      />
    </label>
  );
}
