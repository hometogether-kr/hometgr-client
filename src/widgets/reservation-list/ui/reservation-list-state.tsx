import { Icon } from "@/shared/ui/icons";

export function ReservationListEmpty() {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-[20px] border border-dashed border-grayscale-300 bg-white px-6 text-center">
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-grayscale-70 text-grayscale-400">
        <Icon name="calendar_month" size={28} />
      </span>
      <p className="text-headline-1 font-semibold text-grayscale-800">해당하는 예약이 없어요</p>
      <p className="mt-2 text-body-2 text-grayscale-500">
        새로운 방문 예약을 신청하면 이곳에서 확인할 수 있어요.
      </p>
    </div>
  );
}

export function ReservationListLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="예약 목록을 불러오는 중">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="flex min-h-[191px] animate-pulse gap-7 rounded-[20px] border border-grayscale-200 bg-white p-7"
        >
          <div className="hidden h-[135px] w-[180px] rounded-[10px] bg-grayscale-100 md:block" />
          <div className="flex flex-1 flex-col justify-center gap-4">
            <div className="h-5 w-2/3 rounded bg-grayscale-100" />
            <div className="h-4 w-1/3 rounded bg-grayscale-100" />
            <div className="h-5 w-1/2 rounded bg-grayscale-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReservationListError() {
  return (
    <div
      role="alert"
      className="flex min-h-72 flex-col items-center justify-center rounded-[20px] border border-system-error/30 bg-white px-6 text-center"
    >
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-[#fff1f1] text-system-error">
        <Icon name="error" size={28} />
      </span>
      <p className="text-headline-1 font-semibold text-grayscale-800">
        예약 목록을 불러오지 못했어요
      </p>
      <p className="mt-2 text-body-2 text-grayscale-500">잠시 후 페이지를 새로고침해 주세요.</p>
    </div>
  );
}
