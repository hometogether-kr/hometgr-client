import type { ReactNode } from "react";

export const hostContainer = "mx-auto w-full max-w-[1248px] px-6";
interface SectionHeadingProps {
  label?: string;
  children: ReactNode;
  description?: string;
}
export function SectionHeading({ label, children, description }: SectionHeadingProps) {
  return (
    <header className="mb-10 xl:mb-12">
      {label && (
        <p className="mb-4 text-headline-1 leading-[1.5] font-bold text-primary-500 xl:text-heading-1 xl:leading-[1.5]">
          {label}
        </p>
      )}
      <h2 className="text-title-2 font-bold tracking-[-0.02em] text-grayscale-900 md:text-display-3 xl:text-[48px] xl:leading-[62px]">
        {children}
      </h2>
      {description && (
        <p className="mt-4 text-body-1 font-medium tracking-[-0.01em] text-grayscale-600 xl:text-heading-2 xl:leading-[1.5]">
          {description}
        </p>
      )}
    </header>
  );
}
