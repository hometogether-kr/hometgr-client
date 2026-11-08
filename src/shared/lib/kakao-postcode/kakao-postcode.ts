import { z } from "zod";

/**
 * Kakao 우편번호 서비스 로더
 *
 * 별도 key가 없고 사용량 제한도 없지만, 스크립트를 임의로 수정하거나 하단 로고를
 * 가리면 사용에 제약이 생깁니다. 원본 스크립트를 그대로 불러오고 UI도 손대지 않습니다.
 */
const SCRIPT_SRC = "https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
const SCRIPT_ID = "kakao-postcode-script";

export type KakaoPostcodeResult = z.infer<typeof kakaoPostcodeResultSchema>;

export interface KakaoPostcodeOptions {
  oncomplete: (result: unknown) => void;
  onclose?: (state: "FORCE_CLOSE" | "COMPLETE_CLOSE") => void;
  onresize?: (size: { width: number; height: number }) => void;
  /** 시·도 축약 표기 (기본 true). false면 "서울특별시"처럼 전체 이름이 내려옵니다. */
  shorthand?: boolean;
  width?: string | number;
  height?: string | number;
  animation?: boolean;
}

interface KakaoPostcodeInstance {
  open: (options?: { q?: string; popupTitle?: string; popupKey?: string }) => void;
  embed: (element: HTMLElement, options?: { q?: string; autoClose?: boolean }) => void;
}

type KakaoPostcodeConstructor = new (options: KakaoPostcodeOptions) => KakaoPostcodeInstance;

declare global {
  interface Window {
    kakao?: { Postcode?: KakaoPostcodeConstructor };
  }
}

let loadPromise: Promise<KakaoPostcodeConstructor> | null = null;

/**
 * 우편번호 스크립트를 한 번만 불러옵니다.
 *
 * 주소 검색을 열 때만 필요하므로 앱 시작 시점이 아니라 요청 시점에 로드하고,
 * 이미 불러왔으면 같은 Promise를 재사용합니다.
 */
export function loadKakaoPostcode(): Promise<KakaoPostcodeConstructor> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("브라우저에서만 사용할 수 있습니다."));
  }

  const loaded = window.kakao?.Postcode;
  if (loaded) return Promise.resolve(loaded);

  loadPromise ??= new Promise<KakaoPostcodeConstructor>((resolve, reject) => {
    const existingScript = document.getElementById(SCRIPT_ID);
    const script = existingScript instanceof HTMLScriptElement ? existingScript : createScript();

    const handleLoad = () => {
      const constructor = window.kakao?.Postcode;
      if (constructor) {
        resolve(constructor);
        return;
      }
      loadPromise = null;
      reject(new Error("우편번호 서비스를 초기화하지 못했습니다."));
    };

    const handleError = () => {
      loadPromise = null;
      script.remove();
      reject(new Error("우편번호 서비스를 불러오지 못했습니다."));
    };

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });

    if (!existingScript) document.head.appendChild(script);
  });

  return loadPromise;
}

function createScript(): HTMLScriptElement {
  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = SCRIPT_SRC;
  script.async = true;
  return script;
}

export interface SelectedAddress {
  /** 도로명 주소 (없으면 지번 주소) */
  address: string;
  /** 시·도 + 시·군·구 */
  region: string;
  zonecode: string;
  buildingName: string;
  roadAddress: string;
  jibunAddress: string;
  legalDongCode: string;
  legalDongName: string;
  sido: string;
  sigungu: string;
}

const kakaoPostcodeResultSchema = z.object({
  zonecode: z.string(),
  address: z.string(),
  roadAddress: z.string(),
  jibunAddress: z.string(),
  userSelectedType: z.enum(["R", "J"]),
  sido: z.string(),
  sigungu: z.string(),
  bcode: z.string().regex(/^\d{10}$/),
  bname: z.string(),
  buildingName: z.string(),
});

/**
 * 검색 결과를 앱에서 쓰는 형태로 정리합니다.
 *
 * 예상 주소(auto*)는 확정 주소와 구분하고, 선택한 주소의 구조를 보존합니다.
 */
export function toSelectedAddress(input: unknown): SelectedAddress {
  const parsed = kakaoPostcodeResultSchema.safeParse(input);
  if (!parsed.success) throw new Error("주소 검색 결과를 확인할 수 없습니다. 다시 검색해주세요.");
  const result = parsed.data;
  // auto* fields are estimates when the user declines to select an address.
  const roadAddress = result.roadAddress || (result.userSelectedType === "R" ? result.address : "");
  const jibunAddress =
    result.jibunAddress || (result.userSelectedType === "J" ? result.address : "");
  if (!roadAddress && !jibunAddress)
    throw new Error("선택한 주소가 비어 있습니다. 다시 검색해주세요.");

  return {
    address: roadAddress || jibunAddress || result.address,
    region: [result.sido, result.sigungu].filter(Boolean).join(" "),
    zonecode: result.zonecode,
    buildingName: result.buildingName,
    roadAddress,
    jibunAddress,
    legalDongCode: result.bcode,
    legalDongName: result.bname,
    sido: result.sido,
    sigungu: result.sigungu,
  };
}
