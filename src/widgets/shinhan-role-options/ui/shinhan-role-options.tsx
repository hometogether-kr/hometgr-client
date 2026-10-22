import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./shinhan-role-options.module.css";

interface RoleCardProps {
  role: "host" | "guest";
  index: string;
  label: string;
  question: string;
  children: ReactNode;
  action: string;
}

function RoleCard({ role, index, label, question, children, action }: RoleCardProps) {
  return (
    <section className={styles.card} aria-labelledby={`shinhan-${role}-heading`}>
      <Image
        src={`/images/shinhan/role-${role}.png`}
        alt=""
        fill
        sizes="(max-width: 767px) 100vw, 50vw"
        loading="eager"
        className={styles.photo}
      />
      <div className={styles.overlay} aria-hidden="true" />
      <p className={styles.roleLabel}>
        <span className={styles.index}>{index}</span>
        <span className={styles.rule} aria-hidden="true" />
        <span>{label}</span>
      </p>
      <div className={styles.message}>
        <p className={styles.question}>{question}</p>
        <h2 id={`shinhan-${role}-heading`} className={styles.title}>
          {children}
        </h2>
        <Link href={`/shinhan/${role}`} prefetch={false} className={styles.action}>
          <span>{action}</span>
          <Image
            src="/images/shinhan/role-arrow.svg"
            alt=""
            width={64}
            height={64}
            className={styles.arrow}
          />
        </Link>
      </div>
    </section>
  );
}

export function ShinhanRoleOptions() {
  return (
    <div className={styles.options}>
      <RoleCard
        role="host"
        index="01"
        label="HOST / 호스트"
        question="집주인이세요?"
        action="호스트로 시작하기"
      >
        지금 살고 있는 집에서
        <br />
        <span className={styles.highlight}>월세 버는 방법!</span>
      </RoleCard>
      <RoleCard
        role="guest"
        index="02"
        label="GUEST / 게스트"
        question="학교 근처 방을 찾고 있나요?"
        action="게스트로 시작하기"
      >
        학교 바로 앞<br />
        <span className={styles.highlight}>아파트에서 거주</span>하기
      </RoleCard>
    </div>
  );
}
