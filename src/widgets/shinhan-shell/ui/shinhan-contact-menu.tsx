"use client";

import { useCallback, useId, useState } from "react";

import { Modal } from "@/shared/ui/modal";

export function ShinhanContactMenu() {
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
        className="inline-flex min-h-12 items-center justify-center rounded-lg border border-grayscale-200 bg-white px-4 text-base font-semibold text-grayscale-800 hover:bg-grayscale-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-600"
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
        <nav id={menuId} aria-label="홈투게더 고객센터">
          <a
            href="https://pf.kakao.com/_BKlhX/chat"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleMenuClose}
            className="flex min-h-12 flex-col gap-1 rounded-xl border border-grayscale-200 p-4 text-grayscale-800 hover:bg-grayscale-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-600"
          >
            <span className="text-base font-semibold">고객센터</span>
            <span className="text-sm text-grayscale-600">
              홈투게더 카카오톡 채널<span className="sr-only"> (새 창)</span>
            </span>
          </a>
        </nav>
      </Modal>
    </>
  );
}
