import Image from "next/image";
import Link from "next/link";

import { ShinhanContactMenu } from "./shinhan-contact-menu";

import styles from "./shinhan-role-shell.module.css";

export function ShinhanRoleHeader() {
  return (
    <header className={styles.header}>
      <a className={styles.skipLink} href="#shinhan-role-options">
        역할 선택으로 건너뛰기
      </a>
      <Link href="/shinhan" className={styles.brand} aria-label="신한 슈퍼SOL × 홈투게더 역할 선택">
        <span className={styles.solBrand}>
          <Image src="/images/shinhan/super-sol.png" width={40} height={40} alt="" />
          <span>신한 슈퍼SOL</span>
        </span>
        <span className={styles.brandSeparator} aria-hidden="true">
          ×
        </span>
        <Image
          src="/images/shinhan/home-together-brand.svg"
          width={199}
          height={36}
          alt="Home Together"
          className={styles.homeBrand}
        />
      </Link>
      <div className={styles.mobileMenu}>
        <ShinhanContactMenu />
      </div>
      <h1 id="shinhan-role-heading" className={styles.heading}>
        나에게 맞는 홈투게더를 선택하세요
      </h1>
      <p className={styles.partnership}>신한 슈퍼SOL과 홈투게더가 함께합니다</p>
    </header>
  );
}

export function ShinhanRoleFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerTop}>
          <div className={styles.contact}>
            <Image
              src="/images/shinhan/home-together-footer.svg"
              width={155}
              height={28}
              alt="Home Together"
            />
            <address className={styles.contactDetails}>
              <p>
                E-mail : <a href="mailto:contact@hometogether.kr">contact@hometogether.kr</a>
              </p>
              <p>
                Tel : <a href="tel:01045879428">010-4587-9428</a>
              </p>
              <p>Instagram: @home.tgr</p>
            </address>
          </div>
          <div className={styles.social}>
            <nav aria-label="홈투게더 소셜 및 문의" className={styles.socialLinks}>
              <a
                href="https://www.instagram.com/home.tgr/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram<span className="sr-only"> (새 창)</span>
              </a>
              <a href="https://pf.kakao.com/_BKlhX/chat" target="_blank" rel="noopener noreferrer">
                카카오 문의<span className="sr-only"> (새 창)</span>
              </a>
            </nav>
            <p className={styles.copyright}>© 2026 Home Together. All rights reserved.</p>
          </div>
        </div>
        <div className={styles.company}>
          <p>
            주식회사 핀타 · 사업자등록번호 481-87-04211 · 인천광역시 연수구 갯벌로 12, 511호(송도동,
            미추홀타워 별관A동)
          </p>
          {process.env.NODE_ENV === "development" ? (
            <Link href="/shinhan/privacy" className={styles.privacy}>
              개인정보 수집·이용 동의 전문
            </Link>
          ) : (
            <span role="link" aria-disabled="true" className={styles.privacy}>
              개인정보 수집·이용 동의 전문
            </span>
          )}
        </div>
      </div>
    </footer>
  );
}
