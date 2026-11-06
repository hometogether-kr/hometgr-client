import "server-only";

import { BetaTrackingFailure } from "./errors.server";

export async function readBetaJson(
  source: Request | Response,
  maximumBytes: number,
): Promise<unknown> {
  const declaredLength = source.headers.get("content-length");
  if (declaredLength && Number(declaredLength) > maximumBytes) {
    throw new BetaTrackingFailure("PAYLOAD_TOO_LARGE");
  }
  const reader = source.body?.getReader();
  if (!reader) throw new BetaTrackingFailure("INVALID_JSON");

  const chunks: Uint8Array[] = [];
  let length = 0;
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    void reader.cancel().catch(() => undefined);
  }, 1500);
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      length += part.value.byteLength;
      if (length > maximumBytes) {
        await reader.cancel();
        throw new BetaTrackingFailure("PAYLOAD_TOO_LARGE");
      }
      chunks.push(part.value);
    }
    if (timedOut) throw new BetaTrackingFailure("INVALID_JSON");
    const bytes = Buffer.concat(chunks);
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) as unknown;
  } catch (error) {
    if (error instanceof BetaTrackingFailure) throw error;
    throw new BetaTrackingFailure("INVALID_JSON");
  } finally {
    clearTimeout(timeout);
    reader.releaseLock();
  }
}
