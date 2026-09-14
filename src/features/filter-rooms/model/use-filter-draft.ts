"use client";

import { useState } from "react";

import type { RoomFilter } from "./room-filter";
import { serializeRoomFilter } from "./room-filter";

/**
 * 필터 모달 내부의 임시 초안 상태 (설계 §7-1)
 *
 * 모달을 열 때 현재 URL 필터를 스냅샷으로 받아 초안을 편집하고, "완료"에서만 커밋합니다.
 * 닫기/Esc/배경 클릭은 초안을 버립니다 — 모달이 열릴 때만 마운트되므로(부모가 조건부
 * 렌더) 이 훅도 매번 새로 초기화되어 별도 폐기 로직이 필요 없습니다.
 *
 * `isDirty`는 정규화 직렬화 결과로 비교합니다 — 필드 순서·기본값 차이에 흔들리지 않고,
 * 초안이 현재 필터와 같으면 "완료"를 비활성화하는 판단에 씁니다(§6.4).
 *
 * `patchDraft`·`resetDraft`는 섹션 입력(D/HOM-210)이 초안을 바꿀 때 사용합니다. C에서는
 * 셸만 있어 초안이 바뀌지 않으므로 "완료"는 항상 비활성입니다.
 */
export function useFilterDraft(initial: RoomFilter) {
  const [draft, setDraft] = useState<RoomFilter>(initial);

  const patchDraft = (partial: Partial<RoomFilter>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  };

  const resetDraft = () => {
    setDraft(initial);
  };

  const isDirty = serializeRoomFilter(draft) !== serializeRoomFilter(initial);

  return { draft, patchDraft, resetDraft, isDirty };
}