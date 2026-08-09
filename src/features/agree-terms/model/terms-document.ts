import type { TermId } from "./terms";

/**
 * 약관 전문 이미지 (public/images/terms/<디렉터리>/<디렉터리>-<쪽번호>.jpg)
 *
 * 약관 본문은 텍스트가 아니라 스캔 이미지로 들어옵니다. 쪽수는 파일이 늘어나면
 * 여기만 고치면 됩니다.
 */
interface TermsDocument {
  /** public/images/terms 아래 디렉터리이자 파일 이름 접두사 */
  directory: string;
  pageCount: number;
}

// TODO(consent): 백엔드 필수 consent에 대응하는 약관 전문 에셋을 받으면 누락 항목을 연결합니다.
const TERMS_DOCUMENTS: Partial<Record<TermId, TermsDocument>> = {
  service: { directory: "terms-of-service", pageCount: 15 },
  privacy: { directory: "privacy-policy", pageCount: 12 },
  location: { directory: "location-terms", pageCount: 5 },
  marketing: { directory: "marketing-options", pageCount: 3 },
};

export function hasTermsDocument(id: TermId): boolean {
  return TERMS_DOCUMENTS[id] !== undefined;
}

/** 약관 전문 이미지 경로를 쪽 순서대로 돌려줍니다. */
export function getTermsPageSources(id: TermId): string[] {
  const document = TERMS_DOCUMENTS[id];
  if (!document) return [];

  const { directory, pageCount } = document;

  return Array.from(
    { length: pageCount },
    (_, index) => `/images/terms/${directory}/${directory}-${index + 1}.jpg`,
  );
}
