import { ApiError, toApiError } from "@/shared/api";
import { ROUTES } from "@/shared/config";

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function requestAuthRoute(path: string, method: "POST" | "DELETE"): Promise<void> {
  let response: Response;

  try {
    response = await fetch(path, { method });
  } catch (cause) {
    throw new ApiError("네트워크 연결을 확인해주세요.", {
      status: 0,
      kind: "network",
      cause,
    });
  }

  if (!response.ok) {
    throw toApiError(response.status, await readBody(response));
  }
}

export async function logoutAccount(): Promise<void> {
  await requestAuthRoute(ROUTES.auth.logout, "POST");
}

export async function deleteAccount(): Promise<void> {
  await requestAuthRoute(ROUTES.auth.account, "DELETE");
}
