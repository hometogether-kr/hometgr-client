"use client";

import { useState } from "react";

import styles from "./operator-access-form.module.css";

interface OperatorAccessFormProps {
  hasError: boolean;
}

export function OperatorAccessForm({ hasError }: OperatorAccessFormProps) {
  const [pending, setPending] = useState(false);
  return (
    <form
      className={styles.form}
      action="/event_1/api/ops/session"
      method="post"
      onSubmit={() => setPending(true)}
      aria-busy={pending}
    >
      <label htmlFor="operator-access-key">운영자 접근 코드</label>
      <input
        id="operator-access-key"
        name="accessKey"
        type="password"
        placeholder="운영자 접근 코드를 입력해 주세요"
        autoComplete="current-password"
        required
        maxLength={128}
        aria-invalid={hasError}
        aria-describedby={hasError ? "access-error" : undefined}
      />
      {hasError && (
        <p className={styles.error} id="access-error" role="alert">
          접근 코드를 확인해 주세요.
        </p>
      )}
      <button className={styles.primary} type="submit" disabled={pending}>
        {pending ? "확인 중…" : "신청 내역 조회하기"}
      </button>
    </form>
  );
}

export function OperatorSignOutForm() {
  const [pending, setPending] = useState(false);
  return (
    <form action="/event_1/api/ops/logout" method="post" onSubmit={() => setPending(true)}>
      <button type="submit" className={styles.signOut} disabled={pending}>
        {pending ? "종료 중…" : "조회 종료"}
      </button>
    </form>
  );
}
