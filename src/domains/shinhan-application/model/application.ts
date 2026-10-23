import type { ShinhanApplicationDto } from "../api/application.schema";

export type ShinhanApplication = ShinhanApplicationDto & { source: "server" };

export function toShinhanApplication(dto: ShinhanApplicationDto): ShinhanApplication {
  return { ...dto, source: "server" };
}
