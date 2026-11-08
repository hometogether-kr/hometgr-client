import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

import { Icon } from "../icons";

export interface BackLinkProps {
  href: string;
  children: ReactNode;
  variant?: "text" | "stroke";
  scroll?: boolean;
}

/** 목적지가 명확한 보조 탐색 링크. 문구와 경로는 사용하는 화면에서 정합니다. */
export function BackLink({ children, href, variant = "text", scroll = true }: BackLinkProps) {
  return (
    <Link
      href={href}
      scroll={scroll}
      prefetch={false}
      className={cn(
        "inline-flex min-h-11 w-fit shrink-0 items-center justify-center gap-2 rounded-[10px] text-label-1 font-medium text-grayscale-700 transition-opacity outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
        variant === "stroke" && "border border-grayscale-300 px-4 py-2",
      )}
    >
      <Icon name="arrow_back" size={18} className="shrink-0" />
      <span>{children}</span>
    </Link>
  );
}
