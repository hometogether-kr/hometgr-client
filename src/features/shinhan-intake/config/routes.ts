export const SHINHAN_INTAKE_PREVIEW_PATH = "/shinhan/dev/intake";
export const SHINHAN_HOST_ESTIMATE_PATH = "/shinhan/dev/host/estimate";
export const SHINHAN_HOST_REGISTRATION_PATH = "/shinhan/dev/host/register";

export type ShinhanDraftPath =
  | typeof SHINHAN_INTAKE_PREVIEW_PATH
  | typeof SHINHAN_HOST_ESTIMATE_PATH
  | typeof SHINHAN_HOST_REGISTRATION_PATH;
