import Image from "next/image";
import Link from "next/link";

import { ShinhanHostMenu } from "./shinhan-host-menu";

import styles from "./shinhan-host-header.module.css";

export function ShinhanHostHeader() {
  return (
    <header className={styles.header}>
      <a href="#service-introduction" className={styles.skipLink}>
        호스트 서비스 소개로 건너뛰기
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
          <nav aria-label="호스트 서비스" className={styles.desktopNavigation}>
            <Link href="/shinhan/host#service-introduction" className={styles.currentPage}>
              서비스 소개
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
          <ShinhanHostMenu />
        </div>
      </div>
    </header>
  );
}
