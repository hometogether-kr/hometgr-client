import type { RoomPhoto } from "@/domains/listing";
import { cn } from "@/shared/lib/cn";

export interface PhotoGalleryGuestProps {
  photos: RoomPhoto[];
  onRequireLogin: () => void;
}

/* eslint-disable @next/next/no-img-element -- 원본 매물 사진, next/image 최적화 대상 아님 */

const LOCK_MESSAGE = "추가 사진은 로그인 후\n열람할 수 있어요.";

function LockedThumb({ photo, onRequireLogin }: { photo: RoomPhoto; onRequireLogin: () => void }) {
  return (
    <button
      type="button"
      onClick={onRequireLogin}
      className="relative block size-full overflow-hidden text-left"
    >
      <img
        alt=""
        src={photo.url}
        aria-hidden="true"
        className="block size-full scale-110 object-cover blur-sm"
      />
      <span className="absolute inset-0 flex items-center justify-center bg-grayscale-900/50 px-4 text-center text-headline-1 font-medium whitespace-pre-line text-grayscale-200">
        {LOCK_MESSAGE}
      </span>
    </button>
  );
}

/**
 * 사진 갤러리 — 비회원 (Figma: node 1067:45501)
 *
 * 대표 사진 1장만 공개하고, 나머지 4칸은 흐림 처리 후 로그인 유도 문구를
 * 겹쳐 보여줍니다. 클릭하면 로그인 모달이 열립니다.
 */
export function PhotoGalleryGuest({ photos, onRequireLogin }: PhotoGalleryGuestProps) {
  const [main, ...rest] = photos;
  const grid = rest.slice(0, 4);

  return (
    <div className="relative flex h-[280px] w-full gap-3 md:h-[420px]">
      <div className="h-full flex-1 overflow-hidden rounded-l-2xl md:rounded-l-3xl">
        <img alt={main.alt} src={main.url} className="block size-full object-cover" />
      </div>
      <div className="hidden h-full w-[600px] shrink-0 grid-cols-2 grid-rows-2 gap-3 md:grid">
        {grid.map((photo, index) => (
          <div
            key={photo.id}
            className={cn(
              index === 1 && "rounded-tr-3xl",
              index === 3 && "rounded-br-3xl",
              "overflow-hidden",
            )}
          >
            <LockedThumb photo={photo} onRequireLogin={onRequireLogin} />
          </div>
        ))}
      </div>
      <span className="absolute right-4 bottom-4 rounded-full bg-white/20 px-5 py-2.5 text-headline-1 text-white backdrop-blur-sm md:right-6 md:bottom-6">
        제공 사진 <span className="font-medium">{photos.length}장</span>
      </span>
    </div>
  );
}
