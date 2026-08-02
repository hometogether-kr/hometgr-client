/**
 * Kakao 우편번호 서비스 로더
 *
 * 별도 key가 없고 사용량 제한도 없지만, 스크립트를 임의로 수정하거나 하단 로고를
 * 가리면 사용에 제약이 생깁니다. 원본 스크립트를 그대로 불러오고 UI도 손대지 않습니다.
 */
const SCRIPT_SRC = "https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
const SCRIPT_ID = "kakao-postcode-script";

/** oncomplete 콜백이 넘겨주는 값 중 이 앱에서 쓰는 필드 (모든 값은 문자열이며 없으면 공백) */
export interface KakaoPostcodeResult {
  /** 국가기초구역번호 (새 우편번호) */
  zonecode: string;
  /** 검색어 타입에 따라 달라지는 기본 주소 */
  address: string;
  /** 도로명 주소. 지번:도로명이 1:N이면 공백일 수 있습니다. */
  roadAddress: string;
  /** 지번 주소. 도로명:지번이 1:N이면 공백일 수 있습니다. */
  jibunAddress: string;
  /** roadAddress가 공백일 때 채워지는 대표 도로명 주소 */
  autoRoadAddress: string;
  /** jibunAddress가 공백일 때 채워지는 대표 지번 주소 */
  autoJibunAddress: string;
  /** 사용자가 선택한 주소 타입: R(도로명) · J(지번) */
  userSelectedType: "R" | "J";
  /** 도/시 이름 */
  sido: string;
  /** 시/군/구 이름 */
  sigungu: string;
  /** 법정동/법정리 이름 */
  bname: string;
  buildingName: string;
}

export interface KakaoPostcodeOptions {
  oncomplete: (result: KakaoPostcodeResult) => void;
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
}

/**
 * 검색 결과를 앱에서 쓰는 형태로 정리합니다.
 *
 * 지번:도로명이 1:N인 경우 선택한 타입의 주소가 공백으로 내려올 수 있어,
 * 문서 권장대로 auto* 값으로 대체합니다.
 */
export function toSelectedAddress(result: KakaoPostcodeResult): SelectedAddress {
  const roadAddress = result.roadAddress || result.autoRoadAddress;
  const jibunAddress = result.jibunAddress || result.autoJibunAddress;

  return {
    address: roadAddress || jibunAddress || result.address,
    region: [result.sido, result.sigungu].filter(Boolean).join(" "),
    zonecode: result.zonecode,
    buildingName: result.buildingName,
  };
}
