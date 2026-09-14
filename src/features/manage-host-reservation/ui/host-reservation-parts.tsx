import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

/* eslint-disable @next/next/no-img-element -- Local original Figma assets. */
export function StudentAvatar({ small = false }: { small?: boolean }) {
  return (
    <span
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-full bg-grayscale-70",
        small ? "size-9" : "size-20 md:size-[100px]",
      )}
    >
      <img
        src="/figma/host-student-avatar.svg"
        alt=""
        className="absolute top-[19%] left-[3%] size-[93%]"
      />
    </span>
  );
}
export function HostPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-[20px] bg-white p-6 md:p-8", className)}>{children}</section>
  );
}
export function HostHeading({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-2xl leading-[1.3] font-semibold tracking-[-0.01em] text-grayscale-900 md:text-[32px]">
      {children}
    </h1>
  );
}
export function HostSuccessHeading({ title, children }: { title: string; children: ReactNode }) {
  return (
    <header className="flex flex-col items-center gap-3 text-center">
      <img src="/figma/host-reservation-success.svg" alt="" className="mb-1 size-20" />
      <HostHeading>{title}</HostHeading>
      <p className="text-body-2 text-grayscale-600">{children}</p>
    </header>
  );
}
export interface HostChoiceItem {
  value: string;
  label: string;
  detail?: string;
  disabled?: boolean;
}
export function HostChoices({
  label,
  items,
  value,
  onChange,
  centered = false,
}: {
  label: string;
  items: HostChoiceItem[];
  value: string;
  onChange: (value: string) => void;
  centered?: boolean;
}) {
  return (
    <fieldset className="flex w-full flex-col gap-3">
      <legend className="sr-only">{label}</legend>
      {items.map((item) => (
        <label
          key={item.value}
          className={cn(
            "relative flex cursor-pointer items-center justify-between rounded-[20px] border px-6 py-7 md:px-9 md:py-8",
            item.disabled
              ? "cursor-not-allowed border-grayscale-300 bg-white text-grayscale-500"
              : value === item.value
                ? "border-primary-500 bg-primary-100 text-primary-500"
                : "border-grayscale-300 bg-white text-grayscale-700",
            "has-focus-visible:ring-2 has-focus-visible:ring-primary-500 has-focus-visible:ring-offset-2",
          )}
        >
          <input
            type="radio"
            name={label}
            value={item.value}
            checked={value === item.value}
            disabled={item.disabled}
            onChange={() => onChange(item.value)}
            className="sr-only"
          />
          <span
            className={cn(
              "flex flex-1 flex-col gap-3",
              centered && "text-center",
              item.disabled && "line-through",
            )}
          >
            <span className="text-xl font-semibold md:text-2xl">{item.label}</span>
            {item.detail && <span className="text-lg md:text-xl">{item.detail}</span>}
          </span>
          {item.disabled && <span className="ml-3 text-body-1 text-system-error">마감됨</span>}
        </label>
      ))}
    </fieldset>
  );
}
