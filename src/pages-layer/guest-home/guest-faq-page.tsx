import Link from "next/link";

import { ROUTES } from "@/shared/config";
import { SiteLayout } from "@/widgets/site-layout";

import { GuestQuestions } from "./ui/guest-questions";

export function GuestFaqPage() {
  return (
    <SiteLayout>
      {/* eslint-disable-next-line @next/next/no-page-custom-font -- Figma의 Noto Sans KR는 입주자 페이지에만 적용합니다. */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap"
      />
      <div className="mx-auto w-[min(960px,calc(100%-40px))] pt-12">
        <Link href={ROUTES.home} className="font-bold text-primary-500">
          입주자 메인으로
        </Link>
      </div>
      <GuestQuestions scope="all" />
    </SiteLayout>
  );
}
