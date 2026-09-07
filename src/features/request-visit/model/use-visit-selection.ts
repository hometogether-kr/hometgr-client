"use client";

import { useState } from "react";

const MAX_VISIT_TIMES = 3;

export function useVisitSelection(initialVisitTimes: string[] = []) {
  const [selectedVisitTimes, setSelectedVisitTimes] = useState(() =>
    [...new Set(initialVisitTimes)].sort().slice(0, MAX_VISIT_TIMES),
  );
  const [selectionMessage, setSelectionMessage] = useState("");

  const toggleVisitTime = (startsAt: string) => {
    setSelectedVisitTimes((current) => {
      if (current.includes(startsAt)) {
        setSelectionMessage("선택한 방문 시간을 해제했어요.");
        return current.filter((value) => value !== startsAt);
      }

      if (current.length >= MAX_VISIT_TIMES) {
        setSelectionMessage("방문 희망 시간은 최대 3개까지 선택할 수 있어요.");
        return current;
      }

      setSelectionMessage("방문 희망 시간을 선택했어요.");
      return [...current, startsAt].sort();
    });
  };

  const removeVisitTime = (startsAt: string) => {
    setSelectedVisitTimes((current) => current.filter((value) => value !== startsAt));
    setSelectionMessage("선택한 방문 시간을 해제했어요.");
  };

  return {
    maxVisitTimes: MAX_VISIT_TIMES,
    selectedVisitTimes,
    selectionMessage,
    toggleVisitTime,
    removeVisitTime,
  };
}
