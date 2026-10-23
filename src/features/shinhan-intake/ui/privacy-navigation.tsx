"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useShinhanIntake } from "../model/intake-context";
import { useShinhanStorage } from "../model/storage-context";

import styles from "./shinhan-intake.module.css";

export function ShinhanPrivacyLink({
  children = "전문 보기",
  kind = "required",
}: {
  children?: ReactNode;
  kind?: "required" | "optional";
}) {
  const { rememberPrivacyReturn } = useShinhanIntake();
  const { setPrivacyKind } = useShinhanStorage();
  return (
    <Link
      href="/shinhan/privacy"
      onNavigate={() => {
        setPrivacyKind(kind);
        rememberPrivacyReturn();
      }}
      className={styles.privacyLink}
    >
      {children}
    </Link>
  );
}

export function ShinhanPrivacyReturn() {
  const { draft, privacyReturnTarget } = useShinhanIntake();
  const canReturn = draft && privacyReturnTarget?.applicationType === draft.applicationType;
  return (
    <Link
      href={canReturn ? privacyReturnTarget.pathname : "/shinhan"}
      replace
      className={styles.returnLink}
    >
      {canReturn ? "작성하던 신청서로 돌아가기" : "홈으로 돌아가기"}
    </Link>
  );
}

interface RoleSlotProps {
  host: ReactNode;
  guest: ReactNode;
  fallback: ReactNode;
}

export function ShinhanIntakeRoleSlot({ host, guest, fallback }: RoleSlotProps) {
  const { draft } = useShinhanIntake();
  if (!draft) return fallback;
  return draft.applicationType.startsWith("HOST_") ? host : guest;
}
