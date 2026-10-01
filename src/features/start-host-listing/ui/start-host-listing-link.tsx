"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useAccountMode } from "@/domains/user";
import { ROUTES } from "@/shared/config";

interface StartHostListingLinkProps {
  children: ReactNode;
  className?: string;
}

export function StartHostListingLink({ children, className }: StartHostListingLinkProps) {
  const { setMode } = useAccountMode();
  return (
    <Link href={ROUTES.listing.start} className={className} onClick={() => setMode("host")}>
      {children}
    </Link>
  );
}
