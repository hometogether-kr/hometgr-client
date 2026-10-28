import styles from "./shinhan-host-progress.module.css";

interface ShinhanHostProgressProps {
  currentStep: "result" | "concerns" | "introduction" | "notification" | "complete";
}

const HOST_STEPS = [
  { value: "result", label: "월세 알아보기" },
  { value: "introduction", label: "소개서 안내" },
  { value: "notification", label: "알림 신청" },
] as const;

export function ShinhanHostProgress({ currentStep }: ShinhanHostProgressProps) {
  const currentIndex =
    currentStep === "complete"
      ? HOST_STEPS.length
      : HOST_STEPS.findIndex((step) => step.value === currentStep);

  return (
    <ol className={styles.progress} aria-label="호스트 신청 순서">
      {HOST_STEPS.map((step, index) => (
        <li
          key={step.value}
          aria-current={index === currentIndex ? "step" : undefined}
          data-complete={index < currentIndex ? "" : undefined}
        >
          <span>0{index + 1}</span> {step.label}
        </li>
      ))}
    </ol>
  );
}
