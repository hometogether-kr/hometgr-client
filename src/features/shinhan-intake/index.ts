export { shinhanContactSchema } from "./model/contact.schema";
export {
  SHINHAN_INTAKE_PREVIEW_PATH,
  ShinhanIntakeProvider,
  useShinhanIntake,
} from "./model/intake-context";
export type { ShinhanApplicationType, ShinhanIntakeDraft } from "./model/intake-draft";
export { SHINHAN_APPLICATION_LABELS, SHINHAN_APPLICATION_TYPES } from "./model/intake-draft";
export { ShinhanContactFields } from "./ui/contact-fields";
export {
  ShinhanIntakeRoleSlot,
  ShinhanPrivacyLink,
  ShinhanPrivacyReturn,
} from "./ui/privacy-navigation";
