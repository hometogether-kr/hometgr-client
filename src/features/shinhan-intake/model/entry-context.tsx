"use client";

import { createContext, type ReactNode, useContext } from "react";

const EntryAvailabilityContext = createContext(false);

interface ShinhanEntryProviderProps {
  available: boolean;
  children: ReactNode;
}

export function ShinhanEntryProvider({ available, children }: ShinhanEntryProviderProps) {
  return <EntryAvailabilityContext value={available}>{children}</EntryAvailabilityContext>;
}

export function useShinhanEntryAvailability() {
  return useContext(EntryAvailabilityContext);
}
