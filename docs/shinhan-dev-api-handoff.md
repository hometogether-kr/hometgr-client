# 신한 고객 웹 dev API 연결 인계

버전 **1.11.0** · 2026-10-25 · 대상 `hometgr-client`의 `dev`.

## 기준과 범위

- 서버 인계 `C:/Users/PC/Documents/GitHub/shinhan-runtime-split/docs/customer-web-handoff.md` **1.5.7**(서버 기록 Git 기준 `6a82cb99b1fa4a2188b10acb6b53c5552fd805a1`)의 NHN 준비 상태와 기존 고객 소스를 읽기로 대조했다. 고객 요청 필드·API·화면·계약·환경변수는 변경하지 않았고, 기존 검증을 재실행하거나 신청·발송을 추가하지 않았다. 1.5.5에서 정합한 완료 상태와 1.5.6의 발송 시점은 유지하며, 새 서버 근거로 확인된 항목만 아래에서 갱신한다.
- 원격 세션 문서 **1.1.1** / bootstrap API **1.1.0**, 동의·걱정 계약 **2.0.0**, 공개 API 계약 **1.0.0**, 런타임 분리 계약 **1.0.2**. 확장 계약이 해당 경로에 우선한다.
- 서버 배포·검증 SHA **63612a4d8eb1511c97607aef1115c7fef3c66bb5**. migrations001/002/003·원격 세션·회수·필수 동의 등록 완료는 서버 인계의 기록이며 고객 웹의 실제 접수 결과가 아니다.
- API origin **https://dev-shinhan-api.hometogether.kr**, 기본 경로 `/api/v1`.
- 공통 BFF·익명 세션·필수 동의·HOST_REGISTRATION OWNED/RENTED는 실제 검증을 완료했다. 후속 `3400d37`에서 HOST_ESTIMATE와 현재 견적의 걱정·소개서 원격 연결을 구현했고 견적 2건·소개서 1건의 실제 검증도 완료했다. `0cb50ff`의 GUEST_BUDGET, `4722e01`의 GUEST_DEMAND도 각각 합성 신청 1건의 실제 브라우저 검증을 완료했다. 일반 공개 진입과 운영·외부 전달은 별도 범위다.

## 완료 상태와 근거 구분

| 범위 | 완료 근거 | 반복하지 않는 확인 |
| --- | --- | --- |
| HOST_REGISTRATION OWNED/RENTED | 고객 실제 브라우저 15항목 + 서버 인계9.1의 저장2건·추가중복0 대조 | 실제 저장·같은 키 재요청·대상 세션 회수 후401/쿠키 삭제 |
| HOST_ESTIMATE | 고객 실제 브라우저 13항목 + 서버 인계9.2의 견적2건·소개서1건 대조 | 계산 스냅샷·원견적 보존·같은 입력의 추가 POST0·소개서 응답 유실 재시도 |
| GUEST_BUDGET | 고객 실제 브라우저 9항목 + 서버 인계9.2의 신청1건·추가중복0 대조 | 실제 저장·원래 키 재시도·걱정 저장·조회 전용 내역 |
| GUEST_DEMAND | 고객 실제 브라우저 9항목·순수 경계27항목 + 서버 인계9.2의 신청1건·추가중복0 대조 | 실제 저장·원래 세션/키/본문 재시도·걱정 저장·조회 전용 내역 |
| 관리자 로그인·호스트/게스트 목록·상세 | 2026-10-25 사용자의 Chrome 등 브라우저 수동 확인, 서버 인계9.3 | 관리자 화면 재검사·재로그인 |

관리자 근거는 [관리자 dev 사용자 확인 기록 1.0.0](C:/Users/PC/Documents/GitHub/shinhan-runtime-split/docs/admin-dev-acceptance-2026-10-25.md)이다. 앞선 자동 HTTP 경계8/8과 사용자 수동 확인을 구분한다. 자동 정상 로그인200·모든 쿠키 속성·신청6건의 전체 상세 필드·두 관리자 역할 각각의 원격 검사를 새로 수행한 것으로 확대하지 않는다. 이 근거의 한계가 로그인·목록·상세 단계를 다시 미완료로 돌리는 이유는 아니다.

서버 인계9.1~9.2의 대상은 합성 신청 **6건**이다. 개별 점검 결과를 합친 작업은 **16건(NOTIFY_SEND5·SHEET_SYNC11)**이며 각각 점검 당시 PENDING/attempts0·실행 이력0·공급자 요청0·전달0이었다. 이 합계는 최신 전역 DB를 새로 조회한 수치가 아니다. 후속 견적·게스트 신청은 필수 동의 각1건·선택 동의0건·걱정 consent=null도 서버에서 대조했다. 방 등록의 대상 세션2개만 회수한 기존 기록을 유지하며 다른 세션의 회수를 새로 주장하지 않는다.

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

## 발송 작업 생성과 실제 전달 시점 — 인계 1.5.7

기준은 서버 인계9.4~9.5와 [NHN 알림톡 연결 준비 1.1.0](C:/Users/PC/Documents/GitHub/shinhan-runtime-split/docs/nhn-template-connection-v1.md)이다. 9.4의 키 입력 전 기록보다 9.5의 현재 상태를 우선한다. 발송 작업을 DB에 저장하는 시점과 고객에게 메시지가 전달되는 시점은 구분한다.

| 고객 행동 | 기존 요청 | 발송 작업 생성 시점 |
| --- | --- | --- |
| 호스트 방 등록 최종 제출 | `POST /applications`, `HOST_REGISTRATION` | 전화번호·소유 형태·위치·필수 동의 검증 후 접수 저장 성공 시 1회 |
| 게스트 예산 ‘상세조건 안내받기’ | `POST /applications`, `GUEST_BUDGET` | 예산/위치/입주일·예시 확인 뒤 연락처·필수 동의를 포함한 최종 접수 저장 성공 시 1회 |
| 게스트 수요 ‘입주조건 확인하기’ | `POST /applications`, `GUEST_DEMAND` | 조건·예시 확인 뒤 연락처·필수 동의를 포함한 최종 접수 저장 성공 시 1회 |
| 호스트 ‘소개서만 먼저 받아보기’ | `POST /applications/:id/introduction`, `{}` | 현재 견적 ID의 소개서 신청이 처음 저장될 때 1회. 새 견적 접수를 만들지 않음 |

- 신청·필수 동의·발송 작업·멱등 응답은 서버의 같은 트랜잭션에 저장된다. 실제 NHN 호출은 **DB 커밋 후 별도 worker**가 처리한다. 검증 실패/롤백은 발송 작업을 남기지 않고, 이후 외부 전달 실패가 성공한 접수를 취소하지 않는다. `PENDING`은 작업 대기, `ACCEPTED`는 공급자 요청 접수이며 `DELIVERED`만 전달 완료 근거다.
- 호스트 최초 견적과 **조건을 바꿔 명시적으로 제출한 새 견적**은 기존 계약대로 스냅샷을 저장한다. 이때 발송 사건은 만들지 않는다. 같은 입력의 결과 다시보기는 기존 결과로 이동하며 추가 POST가 없다. 모든 계산이 DB 저장 0회라는 뜻으로 확대하지 않는다.
- 조건 입력에서 연락처·공간 예시 단계로 이동하는 동작, 개발용 입력 형식 확인, 사진·결과·가이드 열람과 완료 화면 재방문은 신규 접수를 만들지 않는다. current 조회는 GET만 사용한다.
- 걱정 저장은 기존 신청 ID의 `PUT /applications/:id/concerns`만 사용한다. 기존 신청/시트 동기화 버전은 갱신할 수 있지만 새 접수나 추가 발송 사건을 만들지 않는다. 걱정 선택 동의는 추가하지 않는다.
- 불명확한 응답은 원래 세션·키·본문으로 재시도한다. 중복 클릭·같은 키 재시도·동일 견적의 반복 소개서 신청으로 추가 접수/발송 사건을 만들지 않는다. 저장 성공 전 접수 완료를 표시하지 않는 기존 흐름을 유지한다.
- 자동화 범위는 위 **접수 확인 4종**이다. 실제 청년 소개서·방 상세조건·호스트 심사 결과의 후속 전달은 운영자의 별도 업무다. 관리자는 조회 전용이고 관리자 승인 동작을 새 발송 조건으로 추가하지 않는다.

읽기 대조 근거: `features/shinhan-intake/model/storage-context.tsx`의 생성/걱정/소개서 요청 분기·같은 입력 재사용·retainedAttempt 재시도, 해당 feature API의 POST/PUT 분리, `domains/shinhan-application/api/application.api.ts`의 current 읽기, 게스트 조건 폼의 단계 이동과 저장 내역의 `setStep` 탐색. 불일치가 없어 고객 실행 코드는 수정하지 않았다.

서버 보고의 NHN 코드 로컬 매핑·어댑터 합성 검사는 **13/13 완료**다. 인계1.5.7에는 서버 전용 NHN 키 3개와 4종 이벤트 매핑의 EC2 설정 완료, 실제 인증 GET **7회(PC6·EC2 1)** 성공, 발송 POST **0회**가 기록됐다. 고객 담당이 키값을 열람하거나 검증을 재실행한 결과가 아니다. 고객 BFF·Vercel 환경변수와 요청·DTO·계약에는 변경이 없다.

실제 조회한 템플릿 4종은 모두 **TSC02 검수 중**이며 이미지형·치환 변수0개다. `shinhan_host_roomreg`, `shinhan_host_introal`, `shinhan_guest_1`은 버튼이 없고, `shinhan_guest_2`는 URL 링크가 아닌 AC 채널 추가 버튼1개·메시지 유형AD다. 소개서 버튼 미확정 사항은 이 조회로 해소됐다. `shinhan_guest_1`의 등록 본문은 앞서 제공된 중복 문의 문장을 제외한 3문장이다. 서버/콘솔의 등록 문구·버튼을 임의 변경하지 않고 고객 payload에도 템플릿 정보를 추가하지 않는다. 승인(TSC03)·실제 발송·이미지/버튼 수신은 아직 확인하지 않았다.

고객 상태 표시는 기존대로 호스트 견적의 **‘예상 수익 진단 저장 완료’ / ‘소개서 알림 신청 접수 완료’**, 나머지 세 유형의 **‘신청 접수 완료 · 안내 대기’**를 사용한다. 저장 화면은 접수 완료와 알림 전달 완료가 다름을 안내한다. 도메인 mapper는 서버의 notification 상태·deliveredAt을 그대로 보존하며 PENDING/ACCEPTED를 DELIVERED로 바꾸지 않는다. 접수 성공을 전달 완료로 표시하는 불일치가 없어 실행 코드는 수정하지 않았다.

인계 기준 실행 API `63612a4`는 재시작·재배포 없이 유지됐고, 외부 연동은 `INTEGRATION_MODE=disabled` / `EXTERNAL_WRITES_APPROVED=false`다. worker는 미실행이며 `shinhan-dev-worker.service`는 **LoadState=not-found**(미등록)이다. 실제 발송 승인 전 설치·기동하지 않는다. 추가 관리자 세션·큐 환경 분리 개발은 진행하지 않는다는 사용자 결정을 반영하며 기존 익명 세션 보안 가드와 합성 작업은 유지한다. 실제 발송·시트 쓰기·main/운영 배포는 수행하지 않았다.

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

당시 고객 구현 `afb0b133aad8a648c17c371e8c1e97f7b52706b6`을 dev에 푸시했고 Preview `dpl_7jyhk1jH9VbzyoVC46ZKrQzVQ5A8`의 READY와 직접 Vercel 별칭 연결·target=null/branch=dev를 확인했다. 이후 단계별 검증 배포는 아래에 각각 기록하며 이 문서 갱신에서 별칭을 다시 조회하지 않았다. 고객 main은 `6067ffe`를 유지한다.

2026-10-24 23:26 KST 실제 배포 BFF 읽기 검증: 필수 동의200·계약2.0.0·등록 버전/본문 SHA-256 일치·localOnly=false·optional 없음, __Host CSRF의 HttpOnly/Secure/Strict/Path=/ 및 Domain 없음, 잘못된 Origin403, 관리자 경로404를 확인했다. Server=Vercel/x-vercel-id 있음/CF-RAY 없음이다. 이 검증은 신청을 생성하지 않았다.

서버와 사용자가 23:25 KST worker inactive, APP_ENV dev, INTEGRATION_MODE disabled, EXTERNAL_WRITES_APPROVED false를 확인했다.

첫 실제 브라우저 실행에서 익명 세션201/1.1과 쿠키 속성은 통과했으나, 빈 areaRaw 입력 오류 probe의 예상422 검사에서 중단했다. 당시 HTTP 상태 진단값을 보고서에 남기지 않아403 추정은 확정하지 않는다. 유효 신청 요청은 보내지 않았고, 서버·사용자가23:38 KST 전체 신청0/작업0 및 해당 합성 번호의 빈areaRaw 접수0을 확인했다. 검증 도구의 route.fetch에 원래 브라우저 헤더 전달과 안전한 진단 기록을 보완한 뒤 재개했다. BFF/서버 보안 가드는 변경하지 않았다.

### 방 등록 실제 dev API 접수 2건 — 2026-10-24

| 유형 / 화면           | 신청 ID                                | 서버 저장 시각 (2026-10-24 KST) | 같은 키·본문 재요청                                 |
| --------------------- | -------------------------------------- | ------------------------------- | --------------------------------------------------- |
| OWNED / PC 1440px     | `bbb7f8fd-0522-4b4c-88c9-c09ee84534b2` | 23:42:08.520249                 | 201, `Idempotency-Replayed:true`, 같은 ID·createdAt |
| RENTED / 모바일 390px | `9aa97d2a-c1a8-49cd-9e5b-43e5a4cdc760` | 23:42:14.846494                 | 201, `Idempotency-Replayed:true`, 같은 ID·createdAt |

- 두 최초 저장 모두 실제 API201/계약1.0.0, 현재 내역 조회200과 일치했다. 각각 원래 세션·키·본문을 재사용한 재요청이다. 새로운 키로 추가 접수하지 않았다.
- 서버 담당의 당시 DB 대조 결과 전체 접수는 정확히2건, 동일 키 재요청으로 증가한 접수는0건이며 각 dev 검증 세션에는 해당 신청1건만 연결됐다. 당시 알림톡·시트 작업4건은 모두 대기 상태이며 실행 이력은0건이었다.
- 실제 필수 동의2.0.0·익명 세션1.1.0·expiry만 있는 브라우저 JSON, HttpOnly/Secure/host-only 쿠키와 고정 만료를 확인했다. 전문 왕복 후 입력·소유 형태·필수 동의 선택이 유지됐고 저장된 내역은 조회 전용이었다.
- OWNED의 빈 `areaRaw`는 실제 API422 `VALIDATION_ERROR`와 `input.areaRaw` 필드 오류로 거절됐다. 중복 클릭은 최초 저장 요청1회만 보냈다.
- OWNED 최초 실제201 응답을 브라우저에서 유실시켜 거짓 완료가 나타나지 않는지 확인했다. 이어 브라우저에만503을 주입하고, 같은 키·본문을 실제 API에 재요청하여 원래 신청을 복원했다. **503은 모의 장애이며 실제 API 서버를 중단한 검증이 아니다.**
- 접수 완료와 알림 전달을 구분했다. 조회 응답의 알림은 DELIVERED가 아니며 deliveredAt은 null이었다. 외부 메시지·시트 성공으로 표시하지 않았다.
- 서버 담당이 2026-10-24 **23:53:37 KST**에 두 신청과 연결된 dev 검증 세션만 회수했다. 이후 기존 PC·모바일 브라우저가 각각 current 조회1회로 실제401 `SESSION_EXPIRED`와 두 `__Host-` 쿠키 삭제를 확인했다. 자동 세션 발급·재제출은0회이며 접수2건·대기 작업4건은 보존했다.
- 실제 브라우저 검사 **15건 통과**, failures0·page error0, 보고서 상태COMPLETE. 최초 검증에서 신청 없이 만든 별도 익명 세션의 회수까지 확인한 것은 아니며 해당 세션은 고정 만료를 따른다.
- 외부 작업 폴더 `C:/Users/PC/.codex/visualizations/2026/10/22/01a16209-7b74-77d0-8d98-02e59f6e504a/`의 `shinhan-153-actual-host-browser-report.json`과 `shinhan-153-*-actual.png`에 비밀값 없는 결과와 PC·모바일 캡처를 보관했다.

실제 검증 중 호스트 방 등록의 상단 문구가 저장 버튼과 달리 전송되지 않는다고 안내하던 문제를 수정했다. ‘입력 내용 확인’과 ‘방 등록 신청 저장’을 구분하는 안내만 변경했으며 신청 로직은 유지했다.

### 호스트 견적·소개서 실제 dev API 검증

[상세 연결·검증 기록 1.1.1](shinhan-host-estimate-api-stage.md). 테스트 대상은 `8db7e65`의 dev Preview `dpl_FjqxZexG2StXAgvuEHD5A418CARB`이며 동작 코드는 `3400d37`이다. main·Production은 변경하지 않았다.

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

[상세 연결·검증 기록 1.0.1](shinhan-guest-budget-api-stage.md). 구현 `0cb50ff4898032dc818109b664d1c6facb11e366`, dev Preview `dpl_EJBapAKZCUEVxu1DuhnDAhFzjmjQ` **READY**와 고정 직접 Vercel 별칭 연결을 확인했다. 기존 7개 환경변수·비밀키는 유지했다.

- 신청 ID `9d9f4b60-78bd-4596-8f16-dcc52231b15c`, 저장 시각 **2026-10-25 17:15:26.012254 KST**. 최초 실제201 응답을 브라우저에서 유실시킨 뒤 동일 키·본문 재시도201 / `Idempotency-Replayed:true`로 같은 ID·시각을 복원했다.
- 알림 `PENDING` / `deliveredAt=null`, `estimate=null`, `introductionRequestedAt=null`, `exampleContentVersion=common-space-v1`을 확인했다. 걱정 `PRIVACY`, `COST_CONTRACT` 1회 저장은200 / 계약2.0.0이다. 생성 키1개·HTTP2회, 걱정 키1개·HTTP1회이며 신규 신청은1건이다.
- PC1440 / 모바일390 **9항목 통과**, failures0·page error0. 예산 범위·1만 원 단위·자유 위치·Calendar, 실제 필수 전문 복귀와 입력/선택 유지, 접수 후 조회 전용, 가이드·내역·공통 사진과 ‘찾았어요’를 확인했다.
- 서버 담당의 **17:18:28 KST** 읽기 대조 결과 신청1건·추가 중복0건, 최초 입력·시각 보존, 걱정2개·버전2로 일치했다. 알림 사건1건·발송 작업1건·시트 작업2건은 모두 `PENDING`이고 실행 이력·공급자 요청·전달 기록은0건이다. DB·세션·키 변경은 없고 임시 SSH 규칙 삭제를 마쳤다.
- 기존 호스트·세션 회수 검사를 반복하지 않았다. 외부 차단을 유지했고 외부 전달·main·운영 배포는 수행하지 않았다. 검증 브라우저만 종료하고 사용자 Chrome·의존성·캐시는 유지했다.

### 게스트 위치·예산 수요조사 실제 dev API 검증

[상세 연결·검증 기록 1.0.1](shinhan-guest-demand-api-stage.md). 구현 `4722e018ba6cd8b3c15e50f23d132bdbb5757890`, dev Preview `dpl_8uBPAW9nNhKGej8yJiakh3nNbZHx` **READY**와 직접 Vercel 고정 별칭 연결을 확인했다. 기존 환경변수·키·계약을 유지했다.

- 실제 신청 ID `2e8f0dd7-ce57-411b-a52a-8699c6d91134`, 저장 시각 **2026-10-25 17:29:51.130878 KST**. 최초 실제201 응답을 브라우저에 유실시킨 뒤 원래 세션·키·본문 재시도201 / `Idempotency-Replayed:true`로 같은 ID·시각을 복원했다.
- 걱정 `PRIVACY`, `COST_CONTRACT` 1회 저장은200 / 계약2.0.0이다. 생성 키1개·HTTP2회, 걱정 키1개·HTTP1회, 신규 신청1건·세션1개이며 다른 유형 변경은0회다. 알림 `PENDING`·전달 시각null, 계산·소개서null·`common-space-v1`을 확인했다.
- 실제 PC1440 / 모바일390 **9항목 통과**, failures0·page error0. 예산 범위·단위·역전 오류, 자유 위치·Calendar, 기간13개·성별2개, 실제 전문 왕복과 모든 입력/선택 보존, 접수 후 current 조회·조회 전용 내역을 확인했다. 캡처7장 직접 확인을 마쳤다.
- 별도 순수 폼/DTO/날짜 경계 **27/27 통과**, API·접수0회다. KST 날짜 경계·오늘 포함·윤년·최소=최대·기간/성별 허용값을 확인한 것으로 실제 서버 검증과 구분한다. 타입 검사·변경3파일 ESLint·diff 검사도 통과했다.
- 서버 담당의 **17:32:17 KST** 대상 읽기 대조 결과 신청1건·추가 중복0건, 최초 입력·시각 보존, 걱정2개·버전2로 일치했다. 알림 사건1건·발송 작업1건·시트 작업2건 모두 `PENDING`, 실행 이력·공급자 요청·전달 기록0건이다. worker 중지·차단 유지, DB·세션·키 변경 없음과 임시 SSH 규칙 삭제를 확인했다.
- 기존 세 유형·세션 회수 검사는 반복하지 않았다. 검증 브라우저만 종료했고 원래 문서·도구·캐시를 보존했다. 이번 작업은 GUEST_DEMAND 단계에서 마무리하며 공개/운영 전환을 진행하지 않는다.

## 환경·UI 검증의 범위

아래 표는 기존 근거의 범위를 구분한 것으로 새로운 전체 재검증 목록이 아니다. 네 유형의 저장·재시도·후속 처리와 관리자 사용자 확인의 완료 판정을 유지한다. 추가 증거가 없는 항목만 별도로 표시하며 이번 기록 정리에서 새 요청·브라우저 검사·DB 조회는 하지 않았다.

| 항목 | 실제 확인 완료 | 모의·순수 확인 | 실제 환경의 추가 증거가 없는 범위 |
| --- | --- | --- | --- |
| ingress·IP | 고정 Vercel 별칭·Server/x-vercel-id·CF-RAY 없음, 익명 세션, 동의200·잘못된 Origin403·관리자 경로404 | helper55/BFF62: IPv4/IPv6 정규화·HMAC, 잘못된/대체 IP 헤더·위조 forwarded host·브라우저 Client-Key 처리 | 실제 ingress에 위조 IP 헤더를 주입했을 때 플랫폼 처리, IPv4/IPv6 네트워크별 대조 |
| 쿠키·CSRF | HttpOnly/Secure/host-only/SameSite·만료 상한·expiry-only JSON, 회수 후401·두 쿠키 삭제·자동 발급/제출0 | CSRF 누락·불일치·변조·환경/origin 결합·중복 쿠키·reset의 세부 경계 | 해당 공격 변형들의 배포 환경 실증. 이미 확인한 정상 쿠키/Origin403/회수401은 완료 유지 |
| 동시성·다중 탭 | 서버 인계9절의 bootstrap **10묶음×4요청**, 묶음당 DB1행·동일 token/expiry 재현 | 고객 HMAC 안정성·원키 유지·쿠키 결합; Web Locks 구현 확인 | 고객 브라우저 여러 탭의 실제 동시 초기화·Web Locks 경합 |
| PC·모바일 | 네 유형의 PC1440/모바일390 주요 흐름·전문 복귀·입력/선택 유지·완료/오류/재시도·조회 전용과 캡처 확인 | 초기 방 등록 브라우저 모의18항목·폰트 보완4항목 | 물리 모바일 기기·iOS Safari·인앱 웹뷰·모든 브라우저 조합 |
| 로딩·실패 | 실제201 응답 유실 후 원키 재현·저장 전 거짓 완료 방지, 실제422·회수 후401 | 브라우저 주입503, upstream 네트워크/스키마/상태 오류 | 실제 API 중단·외부 공급자 장애·전달 성공 |

모의·순수 확인 근거는 기존 `shinhan-151-session-helper-report.json`, `shinhan-151-bff-boundary-report.json`, `shinhan-152-client-browser-mock-report.json`이며 실제 신청 근거는 153~156 보고서와 위 단계별 기록이다. 서버의 동시 bootstrap 확인과 고객 브라우저 다중 탭 확인을 혼동하지 않는다. 관리자 자동 검사의 범위 한계는 위 완료 상태 절에 기록했으며 새 관리자 검사나 재로그인을 요구하지 않는다.

## 미확인·미결정인 후속 범위

1. **고객 공개 진입·운영 환경:** 현재 환경 검사를 통과한 dev 전용 경로에서 제공한다. 일반 공개 동선 전환, 운영 origin/설정, main 반영·운영 배포는 별도 지시 후 진행한다. 위 표의 실제 환경 미확인 항목도 필요한 범위를 정한 후에만 진행한다.
2. **합성 대기 작업 처리 방침:** 기존 합성 신청6건과 점검 합산 작업16건의 처리 방침이 남아 있다. 세션 만료/회수가 저장된 작업을 취소하지 않는다. 임의 삭제·취소·발송 전환 없이 worker 미실행·외부 disabled/false 상태를 유지한다.
3. **실제 NHN·Google 연동:** NHN 키 설정·인증 조회와 템플릿 버튼 메타데이터 확인은 서버 보고로 완료됐다. 심사 승인(TSC03), 승인된 테스트 대상과 발송 범위, 실제 발송 요청/전달·이미지/버튼 표시, 시트 권한·실제 쓰기는 남아 있다. worker 설치·기동도 실제 발송 승인 후 서버 담당이 별도 진행한다. PENDING/ACCEPTED를 알림 전달 완료로, 접수 성공을 시트 반영 완료로 표시하지 않는다.

서버 인증·DB·공통 계약·관리자 코드를 직접 수정하지 않는다. 데이터 초기화·seed·실제 고객 발송·운영 시트 쓰기·production 배포·main 반영은 포함하지 않는다. 이전 stage10/11 로컬 검증과 main `6067ffe` 이력은 원격 검증 완료 근거가 아니다.

## 일반 사이트 변경 범위 확인

이번 구현 `afb0b13`과 dev의 신한 구현 커밋은 신한 경로·에셋·문서만 변경했다. 다만 이전 main 분리 배포 `6067ffe`에는 공통 카카오 주소 반환값의 sido/sigungu 추가, 공통 모달의 선택적 닫기 아이콘·스타일 옵션, 신한에서 재사용하는 기존 랜딩 이미지 추가가 포함됐다. 일반 홈페이지·매물 업무 로직을 새로 바꾼 변경은 아니다. 공통 파일 변경까지 없었다고 표현하면 부정확하다.

sido/sigungu는 신한 HOST_ESTIMATE에서 카카오 선택값으로 서울/비서울과 구를 판별하는 데 필요하며 기획서216줄과 신한 application-input.mapper에서 사용을 확인했다. HOST_REGISTRATION과 게스트 위치는 자유 입력을 유지하고 이 두 필드를 사용하지 않는다. 이번 연결 단계에서 해당 공통 파일을 다시 수정하지 않았다.
