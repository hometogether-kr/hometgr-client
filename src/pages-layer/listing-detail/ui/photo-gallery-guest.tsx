import type { RoomPhoto } from "@/domains/listing";
import { cn } from "@/shared/lib/cn";

export interface PhotoGalleryGuestProps {
  photos: RoomPhoto[];
  photoCount: number;
  onRequireLogin: () => void;
}

interface LockedThumbProps {
  photoNumber: number;
  className?: string;
  onRequireLogin: () => void;
}

const MAX_LOCKED_THUMBNAILS = 4;

function LockedThumb({ photoNumber, className, onRequireLogin }: LockedThumbProps) {
  return (
    <button
      type="button"
      onClick={onRequireLogin}
      aria-label={`추가 사진 ${photoNumber} 보기 (로그인 필요)`}
      className={cn(
        "relative flex min-h-28 min-w-0 flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-grayscale-200 bg-grayscale-100 px-3 py-4 text-grayscale-700 transition-colors hover:bg-grayscale-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500",
        className,
      )}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" strokeLinecap="round" />
      </svg>
      <span className="text-center text-xs leading-5 font-medium md:text-sm">
        추가 사진은 로그인 후
        <br />
        열람할 수 있어요.
      </span>
    </button>
  );
}

/** 대표 사진만 표시하고 추가 사진은 원본 URL을 사용하지 않는 잠금 자리표시자로 안내합니다. */
export function PhotoGalleryGuest({ photos, photoCount, onRequireLogin }: PhotoGalleryGuestProps) {
  const main = photos[0];
  const totalPhotoCount = Math.max(photoCount, photos.length);
  const lockedPhotoCount = Math.max(totalPhotoCount - 1, 0);
  const visibleLockedCount = Math.min(lockedPhotoCount, MAX_LOCKED_THUMBNAILS);

  if (totalPhotoCount === 0) {
    return (
      <div className="flex h-[280px] w-full items-center justify-center rounded-2xl bg-grayscale-70 text-headline-1 font-medium text-grayscale-600 md:h-[420px] md:rounded-3xl">
        등록된 사진이 없어요
      </div>
    );
  }

  return (
    <section
      aria-label="매물 사진"
      className={cn("grid min-w-0 gap-3", lockedPhotoCount > 0 && "lg:grid-cols-2")}
    >
      <div className="h-[280px] min-w-0 overflow-hidden rounded-2xl bg-grayscale-70 md:h-[420px] md:rounded-3xl">
        {main ? (
          // eslint-disable-next-line @next/next/no-img-element -- 원본 매물 사진, 기존 상세의 표시 방식 유지
          <img alt={main.alt} src={main.url} className="block size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-sm font-medium text-grayscale-600">
            대표 사진을 준비하고 있어요
          </div>
        )}
      </div>
      {lockedPhotoCount > 0 && (
        <div
          className={cn(
            "grid min-w-0 gap-3 lg:h-[420px]",
            visibleLockedCount > 1 && "grid-cols-2",
            visibleLockedCount > 2 && "lg:grid-rows-2",
          )}
        >
          {Array.from({ length: visibleLockedCount }, (_, index) => (
            <LockedThumb
              key={index}
              photoNumber={index + 1}
              className={visibleLockedCount === 3 && index === 2 ? "col-span-2" : undefined}
              onRequireLogin={onRequireLogin}
            />
          ))}
        </div>
      )}
    </section>
  );
}
