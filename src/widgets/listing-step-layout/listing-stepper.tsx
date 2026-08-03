import { cn } from "@/shared/lib/cn";
import { ProgressBar } from "@/shared/ui/progress-bar";

import { LISTING_STEPS, type ListingStepIndex } from "./listing-steps";

/**
 * 저장 상태 아이콘
 */
const IC_SAVE = "/icons/ic-save.svg";
const IC_SAVE_LOADING = "/icons/ic-save-loading.svg";

export interface ListingStepperProps {
  current: ListingStepIndex;
  /** true면 저장 중, false면 마지막 저장 완료 상태를 표시합니다. */
  autoSaving?: boolean;
}

/**
 * 진행 단계 사이드바 (Figma: step, node 420:6692)
 */
export function ListingStepper({ current, autoSaving = false }: ListingStepperProps) {
  const saveIcon = autoSaving ? IC_SAVE_LOADING : IC_SAVE;
  const saveText = autoSaving ? "자동 임시저장 중..." : "자동 임시저장 완료";

  return (
    <aside className="flex w-[332px] shrink-0 flex-col gap-9 rounded-[20px] bg-white p-6">
      <div className="flex flex-col gap-7">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 whitespace-nowrap">
            <h2 className="text-2xl leading-[1.4] font-semibold tracking-[-0.24px] text-black">
              진행 단계
            </h2>
            <p className="text-base leading-[1.5] font-medium text-grayscale-600">
              {LISTING_STEPS.length}단계 중 <span className="text-primary-600">{current}단계</span>{" "}
              진행 중
            </p>
          </div>
          <ProgressBar value={current} max={LISTING_STEPS.length} />
        </div>
        <ol className="flex flex-col">
          {LISTING_STEPS.map((label, index) => {
            const step = index + 1;
            const active = step === current;
            const isLast = step === LISTING_STEPS.length;
            return (
              <li key={label} className="flex items-start justify-center gap-2">
                <div className="flex flex-col items-center self-stretch">
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full text-xs leading-[1.4] font-semibold tracking-[0.12px] text-white",
                      active ? "bg-primary-500" : "bg-grayscale-200",
                    )}
                    aria-current={active ? "step" : undefined}
                  >
                    {step}
                  </span>
                  {!isLast && <span className="w-px flex-1 bg-grayscale-200" />}
                </div>
                <span className="flex-1 pb-3 text-sm leading-[1.4] font-semibold">
                  <span className={active ? "text-grayscale-800" : "text-grayscale-500"}>
                    {label}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="flex w-full items-center gap-1.5 rounded-lg bg-grayscale-50 p-3">
        <span className="flex size-5 shrink-0 items-center justify-center overflow-clip">
          {/* eslint-disable-next-line @next/next/no-img-element -- public SVG는 원본 비율 그대로 렌더링합니다 */}
          <img
            alt=""
            src={saveIcon}
            className={cn("block size-5 max-w-none", autoSaving ? "animate-spin" : "")}
          />
        </span>
        <p className="text-sm leading-[1.5] font-medium whitespace-nowrap text-grayscale-700">
          {saveText}
        </p>
      </div>
    </aside>
  );
}
