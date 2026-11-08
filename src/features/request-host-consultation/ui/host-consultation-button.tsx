"use client";

import { useState } from "react";

import { BtnCta } from "@/shared/ui/btn-cta";
import { Modal } from "@/shared/ui/modal";

import { HostConsultationForm } from "./host-consultation-form";

import styles from "./host-consultation.module.css";

export function HostConsultationButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <BtnCta
        size="xl"
        onClick={() => setOpen(true)}
        className="h-[58px] w-full max-w-[490px] gap-[14px] rounded-2xl px-4 py-0 text-base leading-[26px] font-bold tracking-[-0.01em] md:px-9 md:text-xl"
      >
        우리 집은 얼마 받을 수 있는지 상담하기 <span aria-hidden="true">›</span>
      </BtnCta>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={"전담 매니저가 우리 집에 맞는\n조건을 알려드립니다"}
        classNames={{
          overlay: "bg-grayscale-900/60 px-4 py-4 md:py-20",
          dialog: styles.dialog,
          title: styles.title,
          header: styles.header,
          closeButton: styles.closeButton,
          panel: styles.panel,
        }}
      >
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap"
        />
        <HostConsultationForm />
      </Modal>
    </>
  );
}
