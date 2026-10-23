import type { ShinhanApplication } from "../model/application";
import { toShinhanApplication } from "../model/application";
import { shinhanApplicationIdSchema, shinhanApplicationResponseSchema } from "./application.schema";
import { type ShinhanConsents, shinhanConsentsResponseSchema } from "./consents.schema";
import { shinhanRequest } from "./request";

export async function getShinhanConsents(signal?: AbortSignal): Promise<ShinhanConsents> {
  const response = await shinhanRequest({
    path: "/consents",
    schema: shinhanConsentsResponseSchema,
    expectedStatus: 200,
    signal,
  });
  return { ...response.data, csrfToken: response.csrfToken };
}

export async function getShinhanApplication(
  applicationId: string,
  signal?: AbortSignal,
): Promise<ShinhanApplication> {
  const id = shinhanApplicationIdSchema.parse(applicationId);
  const response = await shinhanRequest({
    path: `/applications/${id}/current`,
    schema: shinhanApplicationResponseSchema,
    expectedStatus: 200,
    signal,
  });
  return toShinhanApplication(response.data);
}
