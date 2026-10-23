export const SHINHAN_INTAKE_PREVIEW_PATH = "/shinhan/dev/intake";
export const SHINHAN_HOST_ESTIMATE_PATH = "/shinhan/dev/host/estimate";
export const SHINHAN_HOST_FOLLOWUP_PATH = "/shinhan/dev/host/followup";
export const SHINHAN_HOST_REGISTRATION_PATH = "/shinhan/dev/host/register";
export const SHINHAN_GUEST_BUDGET_PATH = "/shinhan/dev/guest/budget";
export const SHINHAN_GUEST_DEMAND_PATH = "/shinhan/dev/guest/demand";
export const SHINHAN_GUEST_FOLLOWUP_PATH = "/shinhan/dev/guest/followup";

export type ShinhanDraftPath =
  | typeof SHINHAN_INTAKE_PREVIEW_PATH
  | typeof SHINHAN_HOST_ESTIMATE_PATH
  | typeof SHINHAN_HOST_FOLLOWUP_PATH
  | typeof SHINHAN_HOST_REGISTRATION_PATH
  | typeof SHINHAN_GUEST_BUDGET_PATH
  | typeof SHINHAN_GUEST_DEMAND_PATH
  | typeof SHINHAN_GUEST_FOLLOWUP_PATH;
