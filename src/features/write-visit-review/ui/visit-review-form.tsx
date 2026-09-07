"use client";

import Link from "next/link";

import { ROUTES } from "@/shared/config";
import { BtnCta } from "@/shared/ui/btn-cta";
import { TextArea } from "@/shared/ui/text-area";

import { useVisitReviewForm } from "../model/use-visit-review-form";
import { REVIEW_MAX_LENGTH } from "../model/visit-review.schema";
import { StarRatingField } from "./star-rating-field";

export interface VisitReviewFormProps {
  reservationId: string;
  hostName: string;
}

/** "김현수" → "김*수" */
function maskName(name: string): string {
  if (name.length <= 2) return name;
  return `${name[0]}${"*".repeat(name.length - 2)}${name[name.length - 1]}`;
}

export function VisitReviewForm({ reservationId, hostName }: VisitReviewFormProps) {
  const { values, errors, setField, submit } = useVisitReviewForm(reservationId);

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <section className="flex flex-col gap-16 rounded-[20px] border-[1.4px] border-grayscale-200 bg-white px-9 py-8">
        <StarRatingField
          name="host-rating"
          label={`집주인 ${maskName(hostName)}님과의 소통은 어떠셨나요?`}
          value={values.hostRating}
          onChange={(value) => setField("hostRating", value)}
          error={errors.hostRating}
        />
        <StarRatingField
          name="room-match-rating"
          label="매물은 설명과 일치했나요?"
          value={values.roomMatchRating}
          onChange={(value) => setField("roomMatchRating", value)}
          error={errors.roomMatchRating}
        />
        <div className="flex flex-col gap-3">
          <label
            htmlFor="review-content"
            className="text-title-3 font-semibold text-grayscale-900"
          >
            상세 후기
          </label>
          <TextArea
            id="review-content"
            size="l"
            placeholder="방문 경험에 대한 솔직한 후기를 남겨주세요. (최소 10자)"
            value={values.content}
            onChange={(event) => setField("content", event.target.value)}
            maxLength={REVIEW_MAX_LENGTH}
            error={errors.content}
          />
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Link href={ROUTES.reservationDetail(reservationId)}>
          <BtnCta variant="stroke" size="l">
            취소
          </BtnCta>
        </Link>
        <BtnCta type="submit" size="l">
          후기 등록하기
        </BtnCta>
      </div>
    </form>
  );
}
