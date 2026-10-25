# 신한 고객 웹 dev API 연결 인계

버전 **1.8.0** · 2026-10-25 · 대상 `hometgr-client`의 `dev`.

## 기준과 범위

- 서버 인계 `C:/Users/PC/Documents/GitHub/shinhan-runtime-split/docs/customer-web-handoff.md` **1.5.4**. 고객 계약은 그대로이며 1.5.3의 고객 dev 비밀변수 공급과 1.5.4의 방 등록 저장·중복·세션 회수 결과를 반영했다.
- 원격 BFF 계약 **1.1.1**, 동의·걱정 계약 **2.0.0**, 공개 API 계약 **1.0.0**, 런타임 분리 계약 **1.0.2**. 확장 계약이 해당 경로에 우선한다.
- 서버 배포·검증 SHA **63612a4d8eb1511c97607aef1115c7fef3c66bb5**. migrations001/002/003·원격 세션·회수·필수 동의 등록 완료는 서버 인계의 기록이며 고객 웹의 실제 접수 결과가 아니다.
- API origin **https://dev-shinhan-api.hometogether.kr**, 기본 경로 `/api/v1`.
- 공통 BFF·익명 세션·필수 동의·HOST_REGISTRATION OWNED/RENTED는 실제 검증을 완료했다. 후속 `3400d37`에서 HOST_ESTIMATE와 현재 견적의 걱정·소개서 원격 연결을 구현했고 견적 2건·소개서 1건의 실제 검증도 완료했다. `0cb50ff`의 GUEST_BUDGET, `4722e01`의 GUEST_DEMAND도 각각 합성 신청 1건의 실제 브라우저 검증을 완료했다. 일반 공개 진입과 운영·외부 전달은 별도 범위다.

## 구현

브라우저는 동일 출처 `/api/shinhan/*`만 호출한다. BFF는 경로·메서드 allowlist, 정확한 Host/Origin, Sec-Fetch-Site, CSRF, JSON·본문 크기를 검사하며 관리자 API를 전달하지 않는다. upstream은 서버 키 주입, redirect 차단, 10초 제한, no-store, 응답 크기·Zod·환경·경로별 계약 버전을 검증한다.

| upstream 경로                                     | 응답 계약 버전 |
| ------------------------------------------------- | -------------- |
| `GET consents`, `PUT applications/:id/concerns`   | `2.0.0`        |
| `POST sessions/bootstrap`                         | `1.1.0`        |
| 신청 생성·현재 내역·소개서, local `POST sessions` | `1.0.0`        |

- 환경값 누락·오류는 연결 불가로 처리한다. local은 development·loopback만 허용한다. dev 원격은 `VERCEL=1`, `VERCEL_ENV=preview`, `vercel-direct`, 정확한 dev API origin과 HTTPS Vercel origin이 모두 필요하다. production은 지원하지 않는다.
- 원격 IP는 단일 `x-vercel-forwarded-for`만 사용한다. 다른 헤더로 대체하지 않으며 IPv4/IPv6 정규화 후 환경별 HMAC을 만든다.
- 브라우저 `POST sessions {}`는 원격에서 upstream `POST sessions/bootstrap {}`로 연결한다. 환경·고객 origin·CSRF nonce 기반 Session-Key를 사용하며 시간·새 UUID·IP를 섞지 않는다.
- 원격 쿠키는 `__Host-shinhan_intake`, `__Host-shinhan_csrf`이며 HttpOnly·Secure·Path=/·Domain 없음이다. 버전·용도·환경·origin을 서명에 결합하고 세션과 CSRF nonce를 결합한다. 만료는 API/CSRF 중 이른 시각이며 동의 재조회로 CSRF 만료를 늘리지 않는다.
- 토큰·Session-Key를 브라우저 JSON·URL·브라우저 저장소·로그로 반환하지 않는다. 만료·서명 오류·API 401은 두 쿠키를 지운다. 자동 재발급·재제출하지 않는다.
- Web Locks가 동의 조회부터 세션 발급 응답까지 보호한다. 원격에서 잠금을 사용할 수 없으면 중단한다. 명시적 재시작은 초안을 유지하고 필수 동의를 해제한 뒤 사용자의 재확인·제출을 기다린다.
- 서버 required 전문·버전·UTF-8 SHA-256 및 원격 `localOnly=false`를 검증한다. 필수 체크박스와 해당 버전 제출을 유지한다. 걱정 선택 동의 UI·상태·payload는 제거하고 과거 응답의 동의 기록은 nullable과 함께 지원한다.
- 행동별 UUID와 본문을 유지하여 불명확한 실패를 재시도한다. 실제 저장 성공 응답 뒤에만 완료로 이동하고 알림·시트 반영과 구분한다.
- 원격 화면은 호스트 방 등록·호스트 견적·게스트 예산·게스트 수요조사·개인정보 전문·접수 내역을 허용한다. 기존 소개 화면과 나머지 로컬 개발 화면은 유지한다.

## 고객 dev 실행 환경

Vercel 프로젝트 **welcome-web**, Preview Git branch **dev**. 직접 ingress를 확인한 고정 별칭:

`https://welcome-web-git-dev-hometogethers-projects-5dc18f8f.vercel.app`

`dev.hometogether.kr`는 Cloudflare 경유이므로 이번 `vercel-direct` allowlist에서 제외한다. 로컬에서 `VERCEL=1`을 흉내 내 실제 원격 API를 호출하지 않는다.

아래 7개 변수는 사용자 명시 승인 후 **해당 프로젝트 dev branch Preview에만** 등록·메타데이터 확인을 마쳤다. 비밀변수 3개는 Sensitive다. 기존 공개 dev bridge 키와 고객 BFF 키를 유지하며 재배포 때 새로 만들지 않는다.

| 이름                            | 값 또는 공급 방식                                           |
| ------------------------------- | ----------------------------------------------------------- |
| `SHINHAN_APP_ENV`               | `dev`                                                       |
| `SHINHAN_CLIENT_IP_MODE`        | `vercel-direct`                                             |
| `SHINHAN_API_ORIGIN`            | `https://dev-shinhan-api.hometogether.kr`                   |
| `SHINHAN_ALLOWED_ORIGINS`       | 위 고정 Vercel 별칭 하나                                    |
| `SHINHAN_BRIDGE_SECRET`         | 서버 공개 dev bridge 키를 승인된 경로로 공급                |
| `SHINHAN_CLIENT_IP_HMAC_SECRET` | 고객 BFF 전용 독립 난수 키, 최소 32바이트                   |
| `SHINHAN_BFF_STATE_SECRET`      | 위 키·bridge 키와 다른 고객 BFF 전용 난수 키, 최소 32바이트 |

비밀값은 Git·채팅·로그에 기록하지 않는다. `NEXT_PUBLIC_*`, API의 `INTAKE_SESSION_SECRET`, `DATABASE_URL`, 관리자 키는 사용하지 않는다. 실제 `.env.local`과 공유 의존성은 변경하지 않았다.

로컬 화면 검증은 기존 의존성으로 `npm run dev`를 사용한다. local BFF를 사용할 때는 프로세스의 `SHINHAN_APP_ENV=local`, `SHINHAN_CLIENT_IP_MODE=local`과 기존 loopback 설정이 명시되어야 한다. 새 API·DB는 구축하지 않는다.

## 검증 결과

- 세션·IP·쿠키 helper 모의 검증 **55/55 통과**.
- BFF 환경·Origin·경로/메서드·응답 버전·크기 제한·토큰 비노출·쿠키 삭제·reset 모의 검증 **62/62 통과**.
- 필수 동의 유지·선택 동의 제거·과거 응답 호환 schema 검증 **16/16 통과**.
- PC 1440px OWNED·모바일 390px RENTED의 브라우저 모의 검증 **18/18 통과**, page error 0건. 필수 전문·버전과 왕복 입력/선택/동의 유지, 제출 중 비활성화, 중복 클릭 1요청, 503 거짓 완료 방지, 동일 키·본문 재시도 후 조회 전용 내역, 401 명시적 재시작·자동 제출 없음, 걱정 선택 동의 제거를 확인했다. 화면 배치·줄바꿈·가로 넘침도 확인했다.
- 폰트 로딩 후 PC·모바일 보완 화면 검증 **4/4 통과**. 이미 통과한 화면 전체 검사를 반복하지 않았다.
- `tsc --noEmit`, 변경된 TypeScript 파일 ESLint, `git diff --check` 통과. 최초 누락 import와 import 정렬 오류는 수정했다. 이미 통과한 helper/BFF/schema 검증은 반복하지 않았다.
- 위 브라우저 응답도 모의 데이터이며 실제 API·DB 쓰기는 0회다. 로컬 검증은 프로세스에만 fixture 설정을 적용하고 실제 upstream에 접근할 수 없게 구성했다. 결과는 외부 작업 폴더의 `shinhan-152-client-browser-mock-report.json`에 있으며 파일명의 152와 관계없이 기존 1.5.1 구현을 검증한 기록이다.

이전에 키 공급 요청이 자동 승인 검토에서 거절됐으나, 사용자가 정확한 welcome-web Preview/dev 설정·배포 범위를 승인한 뒤 서버 담당이 안전한 메모리 전달 방식으로 비밀변수 3개를 등록했다. 고객 담당은 일반 연결 변수 4개를 등록했다. Production 변수·기존 키 회전·API 인증·DB 변경은 없다.

고객 구현 `afb0b133aad8a648c17c371e8c1e97f7b52706b6`을 dev에 푸시했고 Preview `dpl_7jyhk1jH9VbzyoVC46ZKrQzVQ5A8`가 READY다. 위 직접 Vercel 별칭이 해당 배포를 가리키며 target=null/branch=dev를 확인했다. main은 `6067ffe`를 유지한다.

2026-10-24 23:26 KST 실제 배포 BFF 읽기 검증: 필수 동의200·계약2.0.0·등록 버전/본문 SHA-256 일치·localOnly=false·optional 없음, __Host CSRF의 HttpOnly/Secure/Strict/Path=/ 및 Domain 없음, 잘못된 Origin403, 관리자 경로404를 확인했다. Server=Vercel/x-vercel-id 있음/CF-RAY 없음이다. 이 검증은 신청을 생성하지 않았다.

서버와 사용자가 23:25 KST worker inactive, APP_ENV dev, INTEGRATION_MODE disabled, EXTERNAL_WRITES_APPROVED false를 확인했다.

첫 실제 브라우저 실행에서 익명 세션201/1.1과 쿠키 속성은 통과했으나, 빈 areaRaw 입력 오류 probe의 예상422 검사에서 중단했다. 당시 HTTP 상태 진단값을 보고서에 남기지 않아403 추정은 확정하지 않는다. 유효 신청 요청은 보내지 않았고, 서버·사용자가23:38 KST 전체 신청0/작업0 및 해당 합성 번호의 빈areaRaw 접수0을 확인했다. 검증 도구의 route.fetch에 원래 브라우저 헤더 전달과 안전한 진단 기록을 보완한 뒤 재개했다. BFF/서버 보안 가드는 변경하지 않았다.

### 실제 dev API 접수 2건

| 유형 / 화면           | 신청 ID                                | 서버 저장 시각 (2026-10-24 KST) | 같은 키·본문 재요청                                 |
| --------------------- | -------------------------------------- | ------------------------------- | --------------------------------------------------- |
| OWNED / PC 1440px     | `bbb7f8fd-0522-4b4c-88c9-c09ee84534b2` | 23:42:08.520249                 | 201, `Idempotency-Replayed:true`, 같은 ID·createdAt |
| RENTED / 모바일 390px | `9aa97d2a-c1a8-49cd-9e5b-43e5a4cdc760` | 23:42:14.846494                 | 201, `Idempotency-Replayed:true`, 같은 ID·createdAt |

- 두 최초 저장 모두 실제 API201/계약1.0.0, 현재 내역 조회200과 일치했다. 각각 원래 세션·키·본문을 재사용한 재요청이다. 새로운 키로 추가 접수하지 않았다.
- 서버 담당의 DB 대조 결과 전체 접수는 정확히2건, 동일 키 재요청으로 증가한 접수는0건이며 각 dev 검증 세션에는 해당 신청1건만 연결됐다. 알림톡·시트 작업4건은 모두 대기 상태이며 실행 이력은0건이다.
- 실제 필수 동의2.0.0·익명 세션1.1.0·expiry만 있는 브라우저 JSON, HttpOnly/Secure/host-only 쿠키와 고정 만료를 확인했다. 전문 왕복 후 입력·소유 형태·필수 동의 선택이 유지됐고 저장된 내역은 조회 전용이었다.
- OWNED의 빈 `areaRaw`는 실제 API422 `VALIDATION_ERROR`와 `input.areaRaw` 필드 오류로 거절됐다. 중복 클릭은 최초 저장 요청1회만 보냈다.
- OWNED 최초 실제201 응답을 브라우저에서 유실시켜 거짓 완료가 나타나지 않는지 확인했다. 이어 브라우저에만503을 주입하고, 같은 키·본문을 실제 API에 재요청하여 원래 신청을 복원했다. **503은 모의 장애이며 실제 API 서버를 중단한 검증이 아니다.**
- 접수 완료와 알림 전달을 구분했다. 조회 응답의 알림은 DELIVERED가 아니며 deliveredAt은 null이었다. 외부 메시지·시트 성공으로 표시하지 않았다.
- 서버 담당이 2026-10-24 **23:53:37 KST**에 두 신청과 연결된 dev 검증 세션만 회수했다. 이후 기존 PC·모바일 브라우저가 각각 current 조회1회로 실제401 `SESSION_EXPIRED`와 두 `__Host-` 쿠키 삭제를 확인했다. 자동 세션 발급·재제출은0회이며 접수2건·대기 작업4건은 보존했다.
- 실제 브라우저 검사 **15건 통과**, failures0·page error0, 보고서 상태COMPLETE. 최초 검증에서 신청 없이 만든 별도 익명 세션의 회수까지 확인한 것은 아니며 해당 세션은 고정 만료를 따른다.
- 외부 작업 폴더 `C:/Users/PC/.codex/visualizations/2026/10/22/01a16209-7b74-77d0-8d98-02e59f6e504a/`의 `shinhan-153-actual-host-browser-report.json`과 `shinhan-153-*-actual.png`에 비밀값 없는 결과와 PC·모바일 캡처를 보관했다.

실제 검증 중 호스트 방 등록의 상단 문구가 저장 버튼과 달리 전송되지 않는다고 안내하던 문제를 수정했다. ‘입력 내용 확인’과 ‘방 등록 신청 저장’을 구분하는 안내만 변경했으며 신청 로직은 유지했다.

### 호스트 견적·소개서 실제 dev API 검증

[상세 연결·검증 기록 1.1.0](shinhan-host-estimate-api-stage.md). 테스트 대상은 `8db7e65`의 dev Preview `dpl_FjqxZexG2StXAgvuEHD5A418CARB`이며 동작 코드는 `3400d37`이다. main·Production은 변경하지 않았다.

사용자가 2026-10-25 **16:44:25 KST** 설정 파일·실행 API의 `dev`, `worker inactive`, `INTEGRATION_MODE=disabled`, `EXTERNAL_WRITES_APPROVED=false`, SHA `63612a4`를 확인한 뒤 예정된 범위의 재개를 지시했다.

| 대상 | 신청 ID | 저장 시각 (2026-10-25 KST) | 결과 |
| --- | --- | --- | --- |
| 서울 견적 / PC 1440px | `12265a21-031c-4598-b613-b79631ac2fd6` | 16:54:20.458998 | 월 42.5~52.5만 원, 소개서 미신청 |
| 인천 견적 / 모바일 390px | `6e4a1ed6-5091-4403-8f6c-1100511f2e4d` | 16:56:50.230458 | 월 41.5~51.5만 원, 소개서 `PENDING` |

- 실제 신청201·걱정200·현재 내역200, 같은 입력 결과 재보기의 추가 POST 0회, 조건 변경 시 새 ID와 이전 견적 불변을 확인했다. 실제 카카오 주소·서버 필수 동의 전문 왕복·모바일 입력/선택 유지와 결과 화면을 확인했다.
- 두 번째 견적의 소개서는 **16:56:52.094714 KST**에 한 번 접수됐다. 실제200 응답 유실 후 같은 키·본문 재시도는200 / `Idempotency-Replayed:true`와 같은 ID·시각을 반환했다. 알림은 `PENDING`, `deliveredAt=null`이며 외부 전달 성공으로 표시하지 않는다.
- 브라우저 최종 **13항목 통과 / page error 0**, 캡처 5장 직접 확인. 검증 도구의 계약 기대값 오류를 교정한 동일 키 걱정 재시도 이력은 상세 기록에 남겼다. 신규 견적 2건·걱정 저장 2건·소개서 1건이며, 재전송을 포함한 변경 HTTP 요청은 7회다.
- 서버 담당의 **17:03:07 KST** 읽기 대조에서 대상 견적 2건·추가 중복 0건·원본/시각/금액 일치를 확인했다. 첫 견적의 소개서 사건·발송 작업은 0건, 두 번째만 각각 1건이며 대상 작업 6건은 모두 `PENDING`이다. 실행 이력·공급자 요청·전달 기록은 0건이고 외부 차단 설정을 유지했다.
- 완료된 방 등록·세션 회수 검사를 반복하지 않았다. 기존 고객 키·서버 인증·DB·계약·공유 의존성을 변경하지 않았다. 서버 담당의 임시 SSH 규칙도 삭제·기존 규칙 보존 확인을 마쳤다.

### 게스트 예산 실제 dev API 검증

[상세 연결·검증 기록 1.0.0](shinhan-guest-budget-api-stage.md). 구현 `0cb50ff4898032dc818109b664d1c6facb11e366`, dev Preview `dpl_EJBapAKZCUEVxu1DuhnDAhFzjmjQ` **READY**와 고정 직접 Vercel 별칭 연결을 확인했다. 기존 7개 환경변수·비밀키는 유지했다.

- 신청 ID `9d9f4b60-78bd-4596-8f16-dcc52231b15c`, 저장 시각 **2026-10-25 17:15:26.012254 KST**. 최초 실제201 응답을 브라우저에서 유실시킨 뒤 동일 키·본문 재시도201 / `Idempotency-Replayed:true`로 같은 ID·시각을 복원했다.
- 알림 `PENDING` / `deliveredAt=null`, `estimate=null`, `introductionRequestedAt=null`, `exampleContentVersion=common-space-v1`을 확인했다. 걱정 `PRIVACY`, `COST_CONTRACT` 1회 저장은200 / 계약2.0.0이다. 생성 키1개·HTTP2회, 걱정 키1개·HTTP1회이며 신규 신청은1건이다.
- PC1440 / 모바일390 **9항목 통과**, failures0·page error0. 예산 범위·1만 원 단위·자유 위치·Calendar, 실제 필수 전문 복귀와 입력/선택 유지, 접수 후 조회 전용, 가이드·내역·공통 사진과 ‘찾았어요’를 확인했다.
- 서버 담당의 **17:18:28 KST** 읽기 대조 결과 신청1건·추가 중복0건, 최초 입력·시각 보존, 걱정2개·버전2로 일치했다. 알림 사건1건·발송 작업1건·시트 작업2건은 모두 `PENDING`이고 실행 이력·공급자 요청·전달 기록은0건이다. DB·세션·키 변경은 없고 임시 SSH 규칙 삭제를 마쳤다.
- 기존 호스트·세션 회수 검사를 반복하지 않았다. 외부 차단을 유지했고 외부 전달·main·운영 배포는 수행하지 않았다. 검증 브라우저만 종료하고 사용자 Chrome·의존성·캐시는 유지했다.

### 게스트 위치·예산 수요조사 실제 dev API 검증

[상세 연결·검증 기록 1.0.0](shinhan-guest-demand-api-stage.md). 구현 `4722e018ba6cd8b3c15e50f23d132bdbb5757890`, dev Preview `dpl_8uBPAW9nNhKGej8yJiakh3nNbZHx` **READY**와 직접 Vercel 고정 별칭 연결을 확인했다. 기존 환경변수·키·계약을 유지했다.

- 실제 신청 ID `2e8f0dd7-ce57-411b-a52a-8699c6d91134`, 저장 시각 **2026-10-25 17:29:51.130878 KST**. 최초 실제201 응답을 브라우저에 유실시킨 뒤 원래 세션·키·본문 재시도201 / `Idempotency-Replayed:true`로 같은 ID·시각을 복원했다.
- 걱정 `PRIVACY`, `COST_CONTRACT` 1회 저장은200 / 계약2.0.0이다. 생성 키1개·HTTP2회, 걱정 키1개·HTTP1회, 신규 신청1건·세션1개이며 다른 유형 변경은0회다. 알림 `PENDING`·전달 시각null, 계산·소개서null·`common-space-v1`을 확인했다.
- 실제 PC1440 / 모바일390 **9항목 통과**, failures0·page error0. 예산 범위·단위·역전 오류, 자유 위치·Calendar, 기간13개·성별2개, 실제 전문 왕복과 모든 입력/선택 보존, 접수 후 current 조회·조회 전용 내역을 확인했다. 캡처7장 직접 확인을 마쳤다.
- 별도 순수 폼/DTO/날짜 경계 **27/27 통과**, API·접수0회다. KST 날짜 경계·오늘 포함·윤년·최소=최대·기간/성별 허용값을 확인한 것으로 실제 서버 검증과 구분한다. 타입 검사·변경3파일 ESLint·diff 검사도 통과했다.
- 서버 담당의 **17:32:17 KST** 대상 읽기 대조 결과 신청1건·추가 중복0건, 최초 입력·시각 보존, 걱정2개·버전2로 일치했다. 알림 사건1건·발송 작업1건·시트 작업2건 모두 `PENDING`, 실행 이력·공급자 요청·전달 기록0건이다. worker 중지·차단 유지, DB·세션·키 변경 없음과 임시 SSH 규칙 삭제를 확인했다.
- 기존 세 유형·세션 회수 검사는 반복하지 않았다. 검증 브라우저만 종료했고 원래 문서·도구·캐시를 보존했다. 이번 작업은 GUEST_DEMAND 단계에서 마무리하며 공개/운영 전환을 진행하지 않는다.

## 남은 범위

1. 공개 진입 동선 전환은 후속 범위다. 현재 원격 신청은 환경 검사를 통과한 dev 전용 경로에서 제공한다. 완료된 네 유형의 저장·재시도 검사를 반복하지 않는다.
2. 실제 외부 연동과 운영 전환은 서버 담당의 준비·별도 사용자 지시 후 진행한다. 이번에는 실제 서버 중단, 모든 브라우저의 다중 탭 동시 동작, 알림톡·시트 전달 성공을 검증했다고 보고하지 않는다.

서버 인증·DB·공통 계약·관리자 코드를 직접 수정하지 않는다. 데이터 초기화·seed·실제 고객 발송·운영 시트 쓰기·production 배포·main 반영은 포함하지 않는다. 이전 stage10/11 로컬 검증과 main `6067ffe` 이력은 원격 검증 완료 근거가 아니다.

## 일반 사이트 변경 범위 확인

이번 구현 `afb0b13`과 dev의 신한 구현 커밋은 신한 경로·에셋·문서만 변경했다. 다만 이전 main 분리 배포 `6067ffe`에는 공통 카카오 주소 반환값의 sido/sigungu 추가, 공통 모달의 선택적 닫기 아이콘·스타일 옵션, 신한에서 재사용하는 기존 랜딩 이미지 추가가 포함됐다. 일반 홈페이지·매물 업무 로직을 새로 바꾼 변경은 아니다. 공통 파일 변경까지 없었다고 표현하면 부정확하다.

sido/sigungu는 신한 HOST_ESTIMATE에서 카카오 선택값으로 서울/비서울과 구를 판별하는 데 필요하며 기획서216줄과 신한 application-input.mapper에서 사용을 확인했다. HOST_REGISTRATION과 게스트 위치는 자유 입력을 유지하고 이 두 필드를 사용하지 않는다. 이번 연결 단계에서 해당 공통 파일을 다시 수정하지 않았다.
