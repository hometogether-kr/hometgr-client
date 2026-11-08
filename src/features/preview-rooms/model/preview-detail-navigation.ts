import { z } from "zod";

const previewDetailNavigationSchema = z.object({
  viewer: z.enum(["guest", "member"]).catch("guest"),
  returnTo: z.string().max(2048).optional().catch(undefined),
});

/** 미리보기 권한은 실제 로그인 상태와 연결하지 않는다. 돌아갈 주소는 탐색 경로만 허용한다. */
export function getPreviewDetailNavigation(params: Record<string, string | string[] | undefined>) {
  const { viewer, returnTo } = previewDetailNavigationSchema.parse(params);
  const fallback = "/rooms?preview=rooms";
  if (!returnTo || !returnTo.startsWith("/rooms?")) return { viewer, returnHref: fallback };
  try {
    const url = new URL(returnTo, "https://preview.local");
    if (url.origin !== "https://preview.local" || url.pathname !== "/rooms") {
      return { viewer, returnHref: fallback };
    }
    url.searchParams.set("preview", "rooms");
    return { viewer, returnHref: `/rooms?${url.searchParams.toString()}` };
  } catch {
    return { viewer, returnHref: fallback };
  }
}
