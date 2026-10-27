# 고객 베타 서버 전송 연결 준비

이 문서는 Apps Script에서 기존 신한 서버로 전환하는 비동결 구현 기록이다. 동결 contract.md·fixtures·manifest 및 draft.3 DTO/HMAC 바이트 규약은 변경하지 않았다. 고객 화면·동선·신청 API 동작도 유지한다.

## 로컬 변경 완료

- 브라우저 POST /api/beta/events는 유지하고, 고객 BFF의 수집 요청만 POST /api/v1/beta/rpc로 전환했다.
- BETA_TRACKING_API_URL만 사용하며 기존 BETA_TRACKING_WEB_APP_URL로 돌아가는 fallback은 없다.
- 원격 주소는 SHINHAN_APP_ENV=dev의 https://dev-shinhan-api.hometogether.kr/api/v1/beta/rpc 또는 production의 https://shinhan-api.hometogether.kr/api/v1/beta/rpc로 고정한다. Vercel Preview/Production도 각 환경과 일치해야 한다.
- local/test는 명시한 포트의 HTTP loopback과 같은 RPC path, connection_test만 허용한다. BETA_TRACKING_MODE는 기존 local/production 구분을 유지한다.
- 모든 redirect를 거절하고 응답의 X-Shinhan-App-Env, X-Contract-Version=0.1.0-draft.3, JSON·엄격한 응답 schema를 확인한다. 실패 HTTP 응답의 안전한 error envelope도 해석한다.
- 기존 8KiB 요청/응답 한도, 같은 payload에 새 nonce를 쓰는 제한적 재시도, 쿠키 미전달, no-store를 유지한다. 전송 시간 제한은 아래 후속 기술값을 따른다. 분석 실패는 기존 신청 진행을 막지 않는다.

## 기존 Cloudflare 경계 재사용

기존 신청 BFF의 IP 정규화 및 ingress proof 검증을 shared/api/cloudflare-ingress로 옮겼다. 기존 shinhan-bridge는 같은 결과와 오류로 감싸므로 신청 인증·세션·IP HMAC·payload 동작은 바뀌지 않는다.

베타 BFF는 cloudflare-vercel 모드일 때 본문 소비와 수집 요청 전에 같은 검증을 수행한다. 정확한 64자리 소문자 hex proof를 timingSafeEqual로 비교하고, cf-worker 헤더가 존재하거나 단일 유효 x-shinhan-visitor-ip가 없으면 INGRESS_UNAVAILABLE로 거절한다. 거절 시 본문 소비·수집 요청은 0회다. proof와 IP는 분석 payload·브라우저 응답·upstream에 전달하지 않는다.

SHINHAN_CF_INGRESS_SECRET은 기존 Cloudflare 경유 검증 목적에만 재사용한다. BETA_EVENT_WRITE_SECRET은 별도 수집 HMAC 키이고 같은 값이면 베타 설정을 거절한다. 실제 키 값은 읽거나 공급하지 않았다. 기존 local/vercel-direct 모드는 유지한다.

## 적용 대상과 남은 운영 작업

서버 인계 1.8.0 기준 고객 Vercel 프로젝트는 welcome-web / prj_SXII2CPMUyf6rCfrMBF4c36bnxn3, 운영 origin은 https://hometogether.kr 및 https://www.hometogether.kr이다. 본 변경분은 로컬 소스 동결 단계이며 push·병합·배포하지 않았다: [미배포].

운영 담당은 기존 Cloudflare remove→set 보호 규칙이 정확한 /api/beta/events에도 적용되도록 별도 확장하고 적용 증거를 확인해야 한다. 기존 /api/shinhan 규칙이 새 경로를 자동 보호한다고 가정하지 않는다. 요청 빈도 제한·서버 RPC 배포·전용 쓰기 키의 안전한 공급·run/context/dataset/최초 시작시각/허용 origin/enabled 설정도 관리자 실행 기록에 따라 맞춘다. 이 문서의 로컬 준비 완료는 운영 수집 활성화가 아니다.

## 이번 검증

- node scripts/verify-beta-bff.mjs --transport-only: 변경된 전송·공통 ingress 경계의 합성 assertion 367개 통과. 네트워크 0회.
- 변경 TypeScript 진입점 6개와 의존 모듈의 no-emit 타입 검사 1회 통과.
- 기존 브라우저 전체·네 신청 흐름·운영 API·시트·DB 검증은 반복하지 않았다.
- 합성 실행기는 새 RPC 주소와 draft.3 응답 헤더만 맞췄으며 실행하지 않았다.

전송 추가 계약의 원본은 관리자 docs/shinhan-beta-handoff/server-transport.md다. 과거 connection-readiness.md의 Apps Script URL/배포 설명은 당시 이력이고 현재 연결 대상으로 사용하지 않는다.

## 후속 기술 추가 — 데이터 구분과 시간 제한

shinhan_beta_server_transport_v1의 후속 기술값으로 서버 이벤트 전체 처리 예산 15초 → 고객 BFF 18초 → 브라우저 전송 20초를 사용한다. 기존 draft.3 contract.md의 브라우저 timeout 1.5초와 BFF 구현의 1.2초는 이 서버 전송에서 위 값으로 대체한다. 동결 contract.md·fixtures·manifest의 원본 바이트와 DTO/HMAC 규칙은 변경하지 않았다.

- dev/production은 BETA_DATASET=beta만 허용한다. connection_test는 명시적 local/test loopback에서만 사용한다. 부적합한 조합은 공개 context를 제공하지 않고 TRACKING_DISABLED를 반환하며 수집 요청은 0회다. 과거 문서의 원격 connection_test 시험안은 현재 guard 하에서 실행하지 않는다.
- BFF의 최대 두 번 서명 요청은 하나의 18초 signal을 공유한다. nonce 갱신으로 제한 시간을 다시 시작하지 않는다.
- 베타 App Router의 maxDuration=25초를 명시해 플랫폼 기본값에 의존하지 않는다. 요금제·프로젝트 설정은 변경하지 않았으며 실제 배포 적용 여부는 별도 확인한다.
- 브라우저의 한 전송은 20초에 중단된다. 응답 유실 시 같은 event ID·본문을 보존하며 기존 최대 5회·0/1/3/10/30초+jitter와 미전송 7일 TTL을 유지한다. 분석용 상태 90일과 고객 동작의 비대기 원칙도 유지한다.
- JSON 본문 소비의 기존 1.5초 제한은 별도 크기/스트림 방어로 유지한다. 서버 전체 15초 구현과 검증은 관리자 서버 작업 범위다.
- 이 값은 실제 WIF+Sheets 왕복 시간을 측정한 성능 보장이 아니다. 실제 배포 환경의 실행 한도와 신규·중복 이벤트의 지연, 중단 시 부분 실패 복구는 원격 승인 범위에서 별도로 확인한다. 시간 초과가 원본 미저장을 뜻하지 않는다.

후속 검증: node scripts/verify-beta-bff.mjs --deadlines-only의 합성 assertion 30개가 통과했다. 가상 deadline만 사용했고 실제 네트워크는 0회다. 원격/local의 dataset 조합, 거절 시 수집 0회, BFF 공통 예산·중단, 브라우저 중단 후 동일 이벤트 재전송을 확인했다. 기존 367개 전송 검증과 브라우저 전체 검증은 반복하지 않았다. 타입 구조는 바뀌지 않아 전체 타입 검사를 반복하지 않았다.

## 배포 준비 보완 — 요청 시점의 환경 평가

/shinhan 상위 Server Layout은 환경을 읽기 전에 await connection()을 호출한다. 로컬 prebuilt에 Production Sensitive 키가 없어도 unavailable/404 또는 비활성 context가 정적 결과로 고정되지 않으며, 실제 키는 배포된 서버의 런타임 환경에서만 읽는다. 빌드용 합성 키는 만들지 않고 기존 화면·동선·신청 API는 유지한다. 설치 Next 가이드와 환경 읽기 전 await 순서를 정적으로 확인했다. 실제 Production 빌드 결과는 후속 배포 기록에 남긴다.
