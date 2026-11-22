import { z } from "zod";

import { authOwnerResponseDtoSchema } from "@/domains/user";

export const switchMemberRoleRequestSchema = z.strictObject({
  role: z.enum(["student", "host"]),
});

// 인증 토큰은 BFF가 쿠키에 저장하고 브라우저에는 회원 정보만 반환합니다.
export const switchMemberRoleResponseSchema = authOwnerResponseDtoSchema.omit({
  accessToken: true,
  refreshToken: true,
});
