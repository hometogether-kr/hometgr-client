import type { ReactNode } from "react";

export const hostContainer = "mx-auto w-full max-w-[1248px] px-6";

interface SectionHeadingProps {
  label?: string;
  children: ReactNode;
  description?: string;
}

export function SectionHeading({ label, children, description }: SectionHeadingProps) {
  return (
    <header className="mb-10 md:mb-14">
      {label && <p className="mb-4 text-base font-bold text-primary-500 md:text-xl">{label}</p>}
      <h2 className="text-[28px] leading-[1.4] font-bold tracking-[-0.02em] text-grayscale-900 md:text-[40px]">
        {children}
      </h2>
      {description && (
        <p className="mt-5 text-base leading-relaxed text-grayscale-600 md:text-xl">
          {description}
        </p>
      )}
    </header>
  );
}
