import Image from "next/image";

import { hostContainer } from "./section-heading";

import styles from "./host-partners.module.css";

const partnerNames =
  "인천항만공사, 오퍼, 하나은행, 신한은행, 어반플레이, 카카오뱅크, 서울과학기술대학교 창업지원단, 울진군, 피플에듀, 한국핀테크지원센터, 노원구청";

export function HostPartners() {
  return (
    <section className="overflow-hidden bg-white py-10" aria-labelledby="host-partners-heading">
      <div className={hostContainer}>
        <h2
          id="host-partners-heading"
          className="text-[28px] font-bold tracking-tight text-grayscale-900 md:text-[38px] xl:text-[48px] xl:leading-[62px]"
        >
          홈투게더와 함께한 기업들
        </h2>
      </div>
      <div
        id="host-partners-logos"
        className={`${styles.viewport} mx-auto mt-[23px] max-w-[1472px] py-[16.5px]`}
        tabIndex={0}
        role="region"
        aria-label="협력 기업 로고"
      >
        <div className={styles.track}>
          {[false, true].map((duplicate) => (
            <div
              key={String(duplicate)}
              className={`${styles.group} ${duplicate ? styles.duplicate : ""}`}
              aria-hidden={duplicate || undefined}
            >
              <Image
                src="/images/host-landing/partners-loop.png"
                alt={duplicate ? "" : partnerNames}
                width={2317}
                height={55}
                className={styles.logo}
                sizes="2317px"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
