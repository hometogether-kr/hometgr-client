"use client";

import { useEffect } from "react";

import { clearRoomListPosition, readRoomListPosition } from "./room-list-navigation";

/** 목록 DOM이 준비된 뒤 복원하고, 최신 조회로 카드 높이가 바뀌면 한 번 더 맞춥니다. */
export function useRoomListScrollRestoration(href: string, isFetching: boolean) {
  useEffect(() => {
    // native replaceState로 page만 바뀐 경우 서버 props보다 현재 URL이 최신입니다.
    const position =
      readRoomListPosition(window.location.pathname + window.location.search) ??
      readRoomListPosition(href);
    if (!position) return;
    let stopped = false;
    let frame = 0;
    const cancel = () => {
      stopped = true;
      cancelAnimationFrame(frame);
      clearRoomListPosition(position.href);
    };
    const restore = () => {
      if (stopped) return;
      const card = document.getElementById(`room-card-${position.roomId}`);
      const top = card
        ? window.scrollY + card.getBoundingClientRect().top - position.offset
        : position.scrollY;
      window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
      if (!isFetching) {
        stopped = true;
        clearRoomListPosition(position.href);
      }
    };
    // Next의 내비게이션 스크롤 처리 이후에 위치를 복원합니다.
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(restore);
    });
    window.addEventListener("wheel", cancel, { passive: true });
    window.addEventListener("touchstart", cancel, { passive: true });
    window.addEventListener("keydown", cancel);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("keydown", cancel);
    };
  }, [href, isFetching]);
}
