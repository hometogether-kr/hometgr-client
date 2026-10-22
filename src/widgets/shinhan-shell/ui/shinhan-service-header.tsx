import Image from "next/image";
import Link from "next/link";

import { ShinhanServiceMenu } from "./shinhan-service-menu";

import styles from "./shinhan-service-header.module.css";

interface ShinhanServiceHeaderProps {
  mode?: "host" | "guest";
  skipTarget?: string;
  skipLabel?: string;
}

export function ShinhanServiceHeader({
  mode,
  skipTarget = "#service-introduction",
  skipLabel,
}: ShinhanServiceHeaderProps) {
  const serviceName = mode ? (mode === "host" ? "호스트 서비스" : "게스트 서비스") : "홈투게더";
  const introductionHref = mode ? `/shinhan/${mode}#service-introduction` : "/shinhan";
  const introductionLabel = mode ? "서비스 소개" : "역할 선택";
  return (
    <header className={styles.header}>
      <a href={skipTarget} className={styles.skipLink}>
        {skipLabel ?? `${serviceName} 소개로 건너뛰기`}
      </a>
      <div className={styles.content}>
        <div className={styles.primaryNavigation}>
          <Link href="/shinhan" aria-label="홈투게더 역할 선택" className={styles.brand}>
            <Image
              src="/images/shinhan/home-together-footer.svg"
              width={155}
              height={28}
              alt="Home Together"
            />
          </Link>
          <nav aria-label={serviceName} className={styles.desktopNavigation}>
            <Link href={introductionHref} className={styles.currentPage}>
              {introductionLabel}
            </Link>
          </nav>
        </div>
        <a
          href="https://pf.kakao.com/_BKlhX/chat"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.customerService}
        >
          고객센터<span className="sr-only"> (새 창)</span>
        </a>
        <div className={styles.mobileMenu}>
          <ShinhanServiceMenu
            introductionHref={introductionHref}
            introductionLabel={introductionLabel}
            serviceName={serviceName}
          />
        </div>
      </div>
    </header>
  );
}
