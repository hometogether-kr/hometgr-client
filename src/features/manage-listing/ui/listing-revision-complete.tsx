"use client";

import Image from "next/image";

import { BtnCta } from "@/shared/ui/btn-cta";
import { Modal } from "@/shared/ui/modal";

const PROCESS = [
  ["담당자가 입력 내용 확인", "매물 정보의 정확성과 가독성을 위해 상세히 검토합니다."],
  [
    "필요한 경우 수정 요청",
    "추가 사진이나 확인이 필요한 정보가 있을 경우 가입하신 번호로 연락을 드릴 수 있습니다.",
  ],
  ["검수 완료 후 매물 페이지 등록", "모든 검수가 끝나면 홈투게더 홈페이지에 공식적으로 반영됩니다"],
];

export function ListingRevisionComplete({
  open,
  onContinue,
  onReturn,
}: {
  open: boolean;
  onContinue: () => void;
  onReturn: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onContinue}
      closeButton="none"
      title="매물 정보 수정 요청이 완료되었습니다"
      classNames={{
        overlay: "bg-black/54",
        dialog: "md:w-[588px]",
        panel: "gap-6 rounded-[20px] md:px-12 md:py-12",
        header: "sr-only",
      }}
    >
      <div className="flex flex-col items-center gap-6 text-center">
        <Image
          src="/images/listing-management/revision-complete.svg"
          width={80}
          height={80}
          alt=""
        />
        <div className="flex flex-col gap-3">
          <p className="text-[24px] leading-[1.4] font-semibold text-grayscale-900">
            매물 정보 수정 요청이 완료되었습니다
          </p>
          <p className="text-sm leading-[1.6] text-grayscale-700">
            담당자가 꼼꼼히 확인 후 빠르게 반영해 드릴게요.
            <br />
            추가 확인이 필요하면 매니저가 연락드리겠습니다.
          </p>
        </div>
      </div>
      <div className="rounded-[20px] bg-grayscale-50 p-6">
        <p className="mb-5 text-sm font-semibold text-grayscale-700">향후 진행 과정</p>
        <ol className="flex flex-col gap-5">
          {PROCESS.map(([title, description], index) => (
            <li key={title} className="flex gap-4">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-grayscale-100 text-sm text-grayscale-700">
                {index + 1}
              </span>
              <div>
                <p className="text-[13px] font-semibold text-grayscale-800">{title}</p>
                <p className="mt-1 text-[13px] leading-[1.6] text-grayscale-600">{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <BtnCta variant="stroke" className="flex-1 px-3 text-[13px]" onClick={onReturn}>
          내 방 목록으로 돌아가기
        </BtnCta>
        <BtnCta className="flex-1" onClick={onContinue}>
          계속 수정하기
        </BtnCta>
      </div>
    </Modal>
  );
}
