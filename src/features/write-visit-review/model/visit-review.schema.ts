import { z } from "zod";

export const RATING_MIN = 1;
export const RATING_MAX = 5;
export const REVIEW_MIN_LENGTH = 10;
export const REVIEW_MAX_LENGTH = 1000;

/**
 * 방문 후기 입력 검증
 *
 * 별점은 1~5, 상세 후기는 10자 이상. 사용자가 고칠 수 있는 입력이라 호출부에서
 * safeParse로 다루고 필드별 메시지를 보여줍니다.
 */
export const visitReviewSchema = z.object({
  hostRating: z
    .number()
    .int()
    .min(RATING_MIN, "집주인과의 소통을 평가해 주세요.")
    .max(RATING_MAX),
  roomMatchRating: z
    .number()
    .int()
    .min(RATING_MIN, "매물이 설명과 일치했는지 평가해 주세요.")
    .max(RATING_MAX),
  content: z
    .string()
    .trim()
    .min(REVIEW_MIN_LENGTH, `상세 후기를 ${REVIEW_MIN_LENGTH}자 이상 입력해 주세요.`)
    .max(REVIEW_MAX_LENGTH),
});

export type VisitReviewInput = z.infer<typeof visitReviewSchema>;
