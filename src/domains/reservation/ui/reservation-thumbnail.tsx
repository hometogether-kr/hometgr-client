"use client";

import Image from "next/image";
import { useState } from "react";

import { Icon } from "@/shared/ui/icons";

export interface ReservationThumbnailProps {
  src: string | null;
  alt: string;
  eager?: boolean;
}

export function ReservationThumbnail({ src, alt, eager = false }: ReservationThumbnailProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-grayscale-70 text-grayscale-400">
        <Icon name="image" size={28} />
        <span className="text-caption-1 font-medium">이미지 준비 중</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 767px) 100vw, 180px"
      className="object-cover"
      loading={eager ? "eager" : "lazy"}
      onError={() => setHasError(true)}
    />
  );
}
