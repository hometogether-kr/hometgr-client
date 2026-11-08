"use client";

import Image from "next/image";

import { cn } from "@/shared/lib/cn";

interface ListingVisibilityToggleProps {
  isPublic: boolean;
  disabled?: boolean;
  pending?: boolean;
  onToggle: () => void;
}

export function ListingVisibilityToggle({
  isPublic,
  disabled,
  pending,
  onToggle,
}: ListingVisibilityToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-label="매물 공개"
      aria-checked={isPublic}
      aria-busy={pending}
      disabled={disabled || pending}
      onClick={onToggle}
      className={cn(
        "relative h-10 w-[115px] shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:opacity-50",
        isPublic ? "bg-primary-400" : "bg-grayscale-200",
      )}
    >
      <span
        className={cn(
          "absolute top-1 flex h-8 items-center justify-center gap-2 rounded-full bg-grayscale-50 px-[13px] text-sm font-bold text-primary-500 transition-[left]",
          isPublic ? "left-9" : "left-1",
        )}
      >
        <Image
          src={
            isPublic
              ? "/images/listing-management/visibility-public.svg"
              : "/images/listing-management/visibility-private.svg"
          }
          alt=""
          width={17.3893}
          height={14}
        />
        {!isPublic && (
          <Image
            src="/images/listing-management/visibility-slash.svg"
            width={18.9706}
            height={2}
            alt=""
            className="absolute top-1/2 left-[13px] -rotate-45"
          />
        )}
        {isPublic ? "공개" : "비공개"}
      </span>
    </button>
  );
}
