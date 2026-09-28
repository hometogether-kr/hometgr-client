interface ConsultationPrivacyPolicy {
  version: string;
  retention: string;
}

// TODO: 운영 전 보유 기간과 최종 동의 문구·버전을 확정한다.
// 현재 버전은 Swagger 예시값이며, 문구 확정 시 함께 갱신한다.
export const consultationPrivacyPolicy: ConsultationPrivacyPolicy = {
  version: "host_consultation_v1",
  retention: "확정 후 안내 예정입니다.",
};
