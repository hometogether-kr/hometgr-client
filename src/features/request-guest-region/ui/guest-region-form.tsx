"use client";

import { useState } from "react";

import { BtnCta } from "@/shared/ui/btn-cta";
import { TextField } from "@/shared/ui/text-field";

import { guestRegionFormSchema } from "../model/guest-region.schema";

import styles from "./guest-region-form.module.css";

export function GuestRegionForm() {
  const [region, setRegion] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        const parsed = guestRegionFormSchema.safeParse({ region });
        if (!parsed.success) {
          setError(parsed.error.issues[0].message);
          setNotice("");
          return;
        }
        // 저장 API 계약이 확정되기 전에는 성공 메시지나 가짜 접수 번호를 표시하지 않습니다.
        setNotice("현재 온라인 요청 접수를 준비 중입니다. 카카오 채널로 문의해 주세요.");
      }}
    >
      <div className={styles.row}>
        <TextField
          aria-label="찾고 싶은 동네나 학교"
          placeholder="예) 성수 / 공릉 / 서울여대 근처"
          value={region}
          maxLength={100}
          error={error}
          onChange={(event) => {
            setRegion(event.target.value);
            setError("");
            setNotice("");
          }}
          className={styles.input}
        />
        <BtnCta type="submit" className="h-14 w-[120px] shrink-0 text-lg font-bold">
          요청
        </BtnCta>
      </div>
      <p className={styles.notice} role="status">
        {notice}
      </p>
    </form>
  );
}
