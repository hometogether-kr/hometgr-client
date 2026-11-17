export function getKakaoAuthEnvironmentHeaders(appBaseUrl: string): Record<string, string> {
  if (new URL(appBaseUrl).origin === "https://dev.hometogether.kr") {
    return { "X-HomeTogether-Auth-Environment": "development" };
  }

  return {};
}
