export const SHINHAN_INTAKE_PREVIEW_PATH = "/shinhan/dev/intake";
export const SHINHAN_HOST_ESTIMATE_PATH = "/shinhan/host/estimate";
export const SHINHAN_HOST_FOLLOWUP_PATH = "/shinhan/dev/host/followup";
export const SHINHAN_HOST_REGISTRATION_PATH = "/shinhan/host/register";
export const SHINHAN_GUEST_BUDGET_PATH = "/shinhan/guest/budget";
export const SHINHAN_GUEST_DEMAND_PATH = "/shinhan/guest/demand";
export const SHINHAN_GUEST_FOLLOWUP_PATH = "/shinhan/dev/guest/followup";
export const SHINHAN_SAVED_APPLICATION_PATH = "/shinhan/application";

export const SHINHAN_LEGACY_APPLICATION_ROUTES = [
  { pathname: "/shinhan/dev/host/estimate", applicationType: "HOST_ESTIMATE" },
  { pathname: "/shinhan/dev/host/register", applicationType: "HOST_REGISTRATION" },
  { pathname: "/shinhan/dev/guest/budget", applicationType: "GUEST_BUDGET" },
  { pathname: "/shinhan/dev/guest/demand", applicationType: "GUEST_DEMAND" },
] as const;
export const SHINHAN_LEGACY_SAVED_APPLICATION_PATH = "/shinhan/dev/application";

export type ShinhanDraftPath =
  | (typeof SHINHAN_LEGACY_APPLICATION_ROUTES)[number]["pathname"]
  | typeof SHINHAN_LEGACY_SAVED_APPLICATION_PATH
  | typeof SHINHAN_SAVED_APPLICATION_PATH
  | typeof SHINHAN_INTAKE_PREVIEW_PATH
  | typeof SHINHAN_HOST_ESTIMATE_PATH
  | typeof SHINHAN_HOST_FOLLOWUP_PATH
  | typeof SHINHAN_HOST_REGISTRATION_PATH
  | typeof SHINHAN_GUEST_BUDGET_PATH
  | typeof SHINHAN_GUEST_DEMAND_PATH
  | typeof SHINHAN_GUEST_FOLLOWUP_PATH;
