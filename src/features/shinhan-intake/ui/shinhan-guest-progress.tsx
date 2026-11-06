import styles from "./shinhan-guest-progress.module.css";
interface GuestProgressProps {
  current: 1 | 2 | 3 | 4;
}
export function ShinhanGuestProgress({ current }: GuestProgressProps) {
  return (
    <ol className={styles.progress} aria-label="게스트 신청 진행 단계">
      {["예산·지역 입력", "아파트 확인", "공간 사진 확인", "입주조건 확인"].map((label, index) => (
        <li
          key={label}
          aria-current={index + 1 === current ? "step" : undefined}
          data-complete={index + 1 < current}
        >
          <span>{index + 1 < current ? "✓" : index + 1}</span>
          {label}
        </li>
      ))}
    </ol>
  );
}
