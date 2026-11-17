import { SignupForm } from "@/features/signup-form";
import { SiteLayout } from "@/widgets/site-layout";

export function SignupPage() {
  const currentYear = Number(
    new Intl.DateTimeFormat("en", { year: "numeric", timeZone: "Asia/Seoul" }).format(new Date()),
  );

  return (
    <SiteLayout showFooter={false} background="white">
      <div className="flex-1 md:bg-grayscale-50 md:py-10">
        <div className="mx-auto w-full max-w-[520px] px-5 py-6 md:rounded-[20px] md:bg-white md:p-8">
          <header className="mb-6 flex flex-col gap-2">
            <h1 className="text-heading-2 font-semibold text-grayscale-900 md:text-heading-1">
              회원가입
            </h1>
            <p className="text-body-2 text-grayscale-600">
              홈투게더 이용을 위해 정보를 입력해 주세요
            </p>
          </header>
          <SignupForm currentYear={currentYear} />
        </div>
      </div>
    </SiteLayout>
  );
}
