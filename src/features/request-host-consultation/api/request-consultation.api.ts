import { z } from "zod";

import {
  captureHostFlyerSubmission,
  hostFlyerSubmissionHeaders,
  trackHostFlyerLead,
} from "@/domains/marketing-attribution/host-flyer-browser";
import { apiRequest } from "@/shared/api";
import { formatKoreanPhone } from "@/shared/lib/korean-phone";

import { consultationPrivacyPolicy } from "../config/privacy-policy";
import {
  hostConsultationFormSchema,
  type HostConsultationFormValues,
} from "../model/host-consultation.schema";

const consultationReceiptSchema = z.object({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  regionName: z.string(),
});

export async function requestConsultation(input: HostConsultationFormValues) {
  const values = hostConsultationFormSchema.parse(input);
  const attribution = captureHostFlyerSubmission();
  const receipt = await apiRequest({
    method: "POST",
    path: "/host-consultation-requests",
    schema: consultationReceiptSchema,
    headers: hostFlyerSubmissionHeaders(attribution),
    body: {
      regionType: values.regionId === "other" ? "custom_university" : values.regionType,
      ...(values.regionId === "other"
        ? { customUniversityName: values.customRegionName }
        : { regionId: values.regionId }),
      roomCount: values.roomCount === "3_PLUS" ? 3 : Number(values.roomCount),
      hasAirConditioner: values.airConditioner === "yes",
      housingType: values.tenure === "owned" ? "owned" : "leased_or_rented",
      phone: formatKoreanPhone(values.phone),
      privacyConsentAgreed: values.consent,
      privacyConsentVersion: consultationPrivacyPolicy.version,
    },
  });
  trackHostFlyerLead(attribution, "host_consultation", receipt.id);
  return receipt;
}
