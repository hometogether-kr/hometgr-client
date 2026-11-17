// 카카오 개인정보 동의항목 심사용 임시 화면입니다.
// 심사가 끝나고 화면이 더 이상 필요 없으면 아래 디렉터리 3개를 함께 삭제합니다.
// - src/app/signup
// - src/pages-layer/signup
// - src/features/signup-form
// 삭제 전 `/signup` 링크나 리다이렉트가 추가됐는지 검색하고, 삭제 후 빌드로 라우트 제거를 확인합니다.
import { SignupPage } from "@/pages-layer/signup";

export default function Page() {
  return <SignupPage />;
}
