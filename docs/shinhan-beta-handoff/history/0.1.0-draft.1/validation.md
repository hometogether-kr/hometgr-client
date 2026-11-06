# 합성 계약 자료 검증 결과

2026-10-27 Asia/Seoul. 대상: 계약 0.1.0-draft.1 및 이 폴더의 합성 자료.
앱 구현/운영 연결 검증이 아니라 문서·예시 자체의 일관성 검증이다.

- JSON 14개 파싱 및 합성/계약 버전 표시 확인.
- 원장 20행의 17열 순서, UUID, UTC 시각, connection_test/simulation 분리 확인.
- 최초 12개 JSON에서 E/S/C·미완료·진행중·중단·flow별·채널별·고유 브라우저를 독립 재계산해 expected와 대조.
- 24시간 직전: E7/S6/C3, 중단1. 정확히24시간: E7/S6/C3, 중단2.
- 늦은 완료 후: E7/S6/C4, 미완료2, 중단1.
- 보강한 종료 경계: as_of=until에서 E7/S6/C4. 잘못된 inclusive 종료 조건은 E8이 되어 잡히는 것을 확인.
- connection_test 원장을 beta로 조회하면0, 분모0 비율은 null.
- 브라우저 이벤트 필드와 ACK ID 대응, aggregate에서 UUID/원본/신청·세션/서명 필드 부재 확인.
- 보강한 금지 필드·서버 필드·role/flow·시도 flow/브라우저/UTM 충돌6개는 INVALID_EVENT 또는 ATTEMPT_CONFLICT, append0 기대값 확인.
- 공개 응답은 정책 미확정 disabled 또는 완전 suppressed의 null 형태. 공개 최소 인원은 확정하지 않음.
- Node 내장 crypto HMAC 계산과 변조 예시 검증. 별도 .NET HMACSHA256 구현으로 같은 vector의 서명 일치 확인.
- 1차 검토 후 로컬 sessions1.0.0 / remote bootstrap1.1.0 구분을 계획에 수정하고 수정 문구 확인.

서명 vector SHA256 HMAC: 41948d86229e14dd70ba1cc051afc4777aa4c3488ac1bae85673528407401cf3.
이는 공개 합성 키로 계산한 예시 서명이며 운영 자격 증명이 아니다.

실행하지 않은 것: 앱 코드 수정, 린트/포맷/빌드, dev server/브라우저, 실제 신청·걱정·소개서·알림, 실제 시트/API/Apps Script 쓰기, 배포/푸시/병합.
새 테스트 프레임워크·패키지 설치·캐시 삭제 없음. 검증 코드는 임시 명령으로만 실행했으며 앱 테스트 인프라를 추가하지 않았다.
