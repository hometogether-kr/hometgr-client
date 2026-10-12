import Link from "next/link";

import { ROUTES } from "@/shared/config";
import { ResponsiveHeader } from "@/widgets/responsive-header";

export function ListingDraftState({ status }: { status: "loading" | "error" }) {
  return (
    <div className="min-h-screen bg-grayscale-50">
      <ResponsiveHeader mobile={{ variant: "logo" }} />
      <main className="min-h-[720px] p-10">
        {status === "loading" ? (
          <p role="status">초안을 불러오는 중입니다.</p>
        ) : (
          <div className="flex flex-col items-start gap-4">
            <p role="alert">
              초안을 불러오지 못했습니다. 만료되었거나 일시적인 오류일 수 있습니다.
            </p>
            <Link
              href={ROUTES.listing.start}
              className="rounded text-primary-500 underline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              임시저장 목록으로 돌아가기
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
