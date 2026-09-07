"use client";

import { useSyncExternalStore } from "react";
import { z } from "zod";

import {
  type HostReservation,
  hostReservationFixtures,
  hostReservationSchema,
} from "@/domains/reservation";

const storageKey = "hometogether:host-reservation-preview:v1";
const changeEvent = "host-reservation-preview-change";
const reservationsSchema = z.array(hostReservationSchema);
const initialSnapshot = JSON.stringify(hostReservationFixtures);

function subscribe(notify: () => void) {
  window.addEventListener("storage", notify);
  window.addEventListener(changeEvent, notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(changeEvent, notify);
  };
}
function getSnapshot() {
  try {
    return localStorage.getItem(storageKey) ?? initialSnapshot;
  } catch {
    return initialSnapshot;
  }
}
function parseSnapshot(snapshot: string) {
  try {
    const result = reservationsSchema.safeParse(JSON.parse(snapshot));
    return result.success ? result.data : hostReservationFixtures;
  } catch {
    return hostReservationFixtures;
  }
}

export function useHostReservations() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => initialSnapshot);
  const reservations = parseSnapshot(snapshot);
  function updateReservation(
    id: string,
    changes: Partial<Pick<HostReservation, "status" | "scheduledTime" | "reason" | "suggestion">>,
  ) {
    const next = parseSnapshot(getSnapshot()).map((item) =>
      item.id === id ? { ...item, ...changes } : item,
    );
    localStorage.setItem(storageKey, JSON.stringify(reservationsSchema.parse(next)));
    window.dispatchEvent(new Event(changeEvent));
  }
  return { reservations, updateReservation };
}
