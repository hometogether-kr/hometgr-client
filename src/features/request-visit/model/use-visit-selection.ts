"use client";

import { useState } from "react";

export function useVisitSelection(maxVisitTimes: number, availableVisitTimes: Set<string>) {
  const [choices, setChoices] = useState<string[]>([]);
  const [selectionMessage, setSelectionMessage] = useState("");
  const selectedVisitTimes = choices.filter((time) => availableVisitTimes.has(time));

  const removeVisitTime = (startsAt: string) => {
    setChoices((current) => current.filter((time) => time !== startsAt));
    setSelectionMessage("선택한 방문 시간을 해제했어요.");
  };

  const toggleVisitTime = (startsAt: string) => {
    if (!availableVisitTimes.has(startsAt)) return;

    if (selectedVisitTimes.includes(startsAt)) {
      removeVisitTime(startsAt);
      return;
    }
    if (selectedVisitTimes.length >= maxVisitTimes) {
      setSelectionMessage(`방문 희망 시간은 최대 ${maxVisitTimes}개까지 선택할 수 있어요.`);
      return;
    }

    setChoices([...selectedVisitTimes, startsAt].sort());
    setSelectionMessage("방문 희망 시간을 선택했어요.");
  };

  const retainAvailableVisitTimes = (availableTimes: Set<string>) =>
    setChoices((current) => current.filter((time) => availableTimes.has(time)));

  return {
    selectedVisitTimes,
    selectionMessage,
    toggleVisitTime,
    removeVisitTime,
    retainAvailableVisitTimes,
  };
}
