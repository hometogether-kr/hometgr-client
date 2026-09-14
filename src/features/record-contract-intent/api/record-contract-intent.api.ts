import {
  type ContractIntentDto,
  contractIntentDtoSchema,
  reservationResponseDtoSchema,
} from "@/domains/reservation";
import { apiRequest } from "@/shared/api";

export interface RecordContractIntentInput {
  reservationId: string;
  intent: ContractIntentDto;
}

export async function recordContractIntent({ reservationId, intent }: RecordContractIntentInput) {
  return apiRequest({
    method: "POST",
    path: `/me/reservations/${encodeURIComponent(reservationId)}/contract-intent`,
    body: { intent: contractIntentDtoSchema.parse(intent) },
    schema: reservationResponseDtoSchema,
  });
}
