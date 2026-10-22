import Image from "next/image";
import Link from "next/link";

import { HostRegistrationForm } from "./host-registration-form";

import styles from "./shinhan-host-registration.module.css";

export function ShinhanHostRegistration() {
  return (
    <section className={styles.section} aria-labelledby="host-registration-title">
      <div className={styles.container}>
        <ol className={styles.progress} aria-label="방 등록 진행 단계">
          <li aria-current="step">01 기본 정보 입력</li>
          <li>02 심사 안내</li>
        </ol>
        <div className={styles.columns}>
          <div className={styles.introduction}>
            <p className={styles.eyebrow}>우리 집 빈방 등록하기</p>
            <h1 id="host-registration-title">
              방 등록,
              <br />
              간단한 정보로 시작해요
            </h1>
            <p className={styles.description}>
              연락처와 집에 대한 기본 정보만 알려주세요.
              <br />
              심사 후 남겨주신 번호로 연락드릴게요.
            </p>
            <div className={styles.illustration}>
              <Image
                src="/images/shinhan/host/house.png"
                alt="파란 지붕의 우리 집"
                width={260}
                height={260}
                sizes="(max-width: 767px) 200px, 260px"
              />
            </div>
            <p className={styles.caption}>방 사진과 자세한 조건은 상담할 때 알려주세요.</p>
          </div>
          <HostRegistrationForm />
        </div>
        <Link className={styles.backLink} href="/shinhan/host">
          ← 홈으로 돌아가기
        </Link>
      </div>
    </section>
  );
}
