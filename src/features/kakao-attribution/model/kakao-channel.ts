"use client";

interface KakaoSdk {
  Channel: {
    chat: (options: { channelPublicId: string }) => void | Promise<unknown>;
  };
  init: (javascriptKey: string) => void;
  isInitialized: () => boolean;
}

declare global {
  interface Window {
    Kakao?: KakaoSdk;
  }
}

const KAKAO_SDK_ID = "hometogether-kakao-sdk";
const KAKAO_SDK_URL = "https://t1.kakaocdn.net/kakao_js_sdk/2.8.1/kakao.min.js";
const KAKAO_SDK_INTEGRITY =
  "sha384-OL+ylM/iuPLtW5U3XcvLSGhE8JzReKDank5InqlHGWPhb4140/yrBw0bg0y7+C9J";

let sdkPromise: Promise<KakaoSdk> | undefined;

function warnInDevelopment(message: string) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[kakao-attribution] ${message}`);
  }
}

function initialize(kakao: KakaoSdk, javascriptKey: string) {
  if (!kakao.isInitialized()) kakao.init(javascriptKey);
  return kakao;
}

export function getKakaoChannelChatUrl(channelPublicId: string) {
  return `https://pf.kakao.com/${encodeURIComponent(channelPublicId)}/chat`;
}

async function loadKakaoSdk(javascriptKey: string): Promise<KakaoSdk> {
  if (window.Kakao) return initialize(window.Kakao, javascriptKey);
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<KakaoSdk>((resolve, reject) => {
    const initializeLoadedSdk = () => {
      if (!window.Kakao) {
        reject(new Error("Kakao SDK loaded without window.Kakao."));
        return;
      }

      try {
        resolve(initialize(window.Kakao, javascriptKey));
      } catch (error) {
        reject(
          error instanceof Error
            ? error
            : new Error("Kakao SDK initialization failed unexpectedly."),
        );
      }
    };

    const existingScript = document.getElementById(KAKAO_SDK_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", initializeLoadedSdk, { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Kakao SDK failed to load.")),
        {
          once: true,
        },
      );
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.id = KAKAO_SDK_ID;
    script.integrity = KAKAO_SDK_INTEGRITY;
    script.src = KAKAO_SDK_URL;
    script.addEventListener("load", initializeLoadedSdk, { once: true });
    script.addEventListener("error", () => reject(new Error("Kakao SDK failed to load.")), {
      once: true,
    });
    document.head.appendChild(script);
  });

  try {
    return await sdkPromise;
  } catch (error) {
    // A later click may recover from a transient CDN failure.
    sdkPromise = undefined;
    throw error;
  }
}

/** Opens chat through the SDK and falls back to the public channel URL on any SDK failure. */
export async function openKakaoChannelChat() {
  const channelPublicId = process.env.NEXT_PUBLIC_KAKAO_CHANNEL_PUBLIC_ID?.trim();
  const javascriptKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY?.trim();

  if (!channelPublicId) {
    warnInDevelopment("NEXT_PUBLIC_KAKAO_CHANNEL_PUBLIC_ID is not configured.");
    throw new Error("NEXT_PUBLIC_KAKAO_CHANNEL_PUBLIC_ID is not configured.");
  }

  const fallbackUrl = getKakaoChannelChatUrl(channelPublicId);
  if (!javascriptKey) {
    warnInDevelopment(
      "NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY is not configured; opening the channel URL directly.",
    );
    window.location.assign(fallbackUrl);
    return;
  }

  try {
    const kakao = await loadKakaoSdk(javascriptKey);
    await Promise.resolve(kakao.Channel.chat({ channelPublicId }));
  } catch {
    window.location.assign(fallbackUrl);
  }
}
