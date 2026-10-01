"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import { ROUTES } from "@/shared/config";
import { BtnCta } from "@/shared/ui/btn-cta";
import { TextField } from "@/shared/ui/text-field";

import styles from "./guest-home.module.css";

const guestSearchSchema = z.string().trim().min(1, "동네나 학교 이름을 입력해 주세요.").max(100);

export function GuestRoomSearch() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [error, setError] = useState("");
  return (
    <form
      className={styles.searchForm}
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const parsed = guestSearchSchema.safeParse(keyword);
        if (!parsed.success) {
          setError(parsed.error.issues[0].message);
          return;
        }
        router.push(`${ROUTES.rooms}?q=${encodeURIComponent(parsed.data)}`);
      }}
    >
      <TextField
        aria-label="동네나 학교 근처 검색"
        placeholder="예) 서울과학기술대학교, 공릉역"
        value={keyword}
        onChange={(event) => {
          setKeyword(event.target.value);
          setError("");
        }}
        error={error}
        maxLength={100}
        className={styles.searchInput}
      />
      <BtnCta
        type="submit"
        variant="stroke"
        className="h-14 w-[90px] shrink-0 border-2 border-primary-300 font-bold text-primary-500"
      >
        검색
      </BtnCta>
    </form>
  );
}
