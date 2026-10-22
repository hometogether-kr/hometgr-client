"use client";

import Link from "next/link";
import { useCallback, useId, useState } from "react";

import { Modal } from "@/shared/ui/modal";

import styles from "./shinhan-service-header.module.css";

interface ShinhanServiceMenuProps {
  introductionHref: string;
  serviceName: string;
}

export function ShinhanServiceMenu({ introductionHref, serviceName }: ShinhanServiceMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const handleMenuClose = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <button
        type="button"
        aria-label="메뉴 열기"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => setIsOpen(true)}
        className={styles.menuButton}
      >
        메뉴
      </button>
      <Modal
        open={isOpen}
        onClose={handleMenuClose}
        title="메뉴"
        closeIcon={<span className="text-base font-medium">닫기</span>}
        classNames={{
          dialog: "max-w-md",
          closeButton:
            "min-h-12 rounded-lg text-grayscale-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600",
        }}
      >
        <nav id={menuId} aria-label={serviceName} className={styles.menuList}>
          <Link href={introductionHref} onClick={handleMenuClose} className={styles.menuItem}>
            서비스 소개
          </Link>
          <a
            href="https://pf.kakao.com/_BKlhX/chat"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleMenuClose}
            className={styles.menuItem}
          >
            고객센터<span className="sr-only"> (새 창)</span>
          </a>
        </nav>
      </Modal>
    </>
  );
}
