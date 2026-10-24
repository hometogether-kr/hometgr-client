# 신한 고객 웹 dev API 연결 인계

버전 **1.3.0** · 2026-10-24 · 대상 `hometgr-client`의 `dev`.

## 기준과 범위

- 서버 인계 `C:/Users/PC/Documents/GitHub/shinhan-runtime-split/docs/customer-web-handoff.md` **1.5.1**.
- 원격 BFF 계약 **1.1.1**, 동의·걱정 계약 **2.0.0**, 공개 API 계약 **1.0.0**, 런타임 분리 계약 **1.0.2**. 확장 계약이 해당 경로에 우선한다.
- 서버 배포·검증 SHA **63612a4d8eb1511c97607aef1115c7fef3c66bb5**. migrations001/002/003·원격 세션·회수·필수 동의 등록 완료는 서버 인계의 기록이며 고객 웹의 실제 접수 결과가 아니다.
- API origin **https://dev-shinhan-api.hometogether.kr**, 기본 경로 `/api/v1`.
- 이번 원격 범위는 공통 BFF·익명 세션·필수 동의·HOST_REGISTRATION OWNED/RENTED다. 다른 세 신청 유형과 걱정·소개서 저장은 원격에서 활성화하지 않는다.

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
- 원격 화면은 호스트 방 등록·개인정보 전문·접수 내역만 허용한다. 기존 소개 화면과 나머지 로컬 개발 화면은 유지한다.

## 고객 dev 실행 환경

Vercel 프로젝트 **welcome-web**, Preview Git branch **dev**. 직접 ingress를 확인한 고정 별칭:

`https://welcome-web-git-dev-hometogethers-projects-5dc18f8f.vercel.app`

`dev.hometogether.kr`는 Cloudflare 경유이므로 이번 `vercel-direct` allowlist에서 제외한다. 로컬에서 `VERCEL=1`을 흉내 내 실제 원격 API를 호출하지 않는다.

아래는 **해당 프로젝트 dev branch Preview에만** 필요한 서버 환경변수이며 아직 실제 설정·배포·원격 접수 완료를 뜻하지 않는다.

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

## 이번 검증과 남은 실제 검증

- 세션·IP·쿠키 helper 모의 검증 **55/55 통과**.
- BFF 환경·Origin·경로/메서드·응답 버전·크기 제한·토큰 비노출·쿠키 삭제·reset 모의 검증 **62/62 통과**.
- 필수 동의 유지·선택 동의 제거·과거 응답 호환 schema 검증 **16/16 통과**.
- PC 1440px OWNED·모바일 390px RENTED의 브라우저 모의 검증 **18/18 통과**, page error 0건. 필수 전문·버전과 왕복 입력/선택/동의 유지, 제출 중 비활성화, 중복 클릭 1요청, 503 거짓 완료 방지, 동일 키·본문 재시도 후 조회 전용 내역, 401 명시적 재시작·자동 제출 없음, 걱정 선택 동의 제거를 확인했다. 화면 배치·줄바꿈·가로 넘침도 확인했다.
- `tsc --noEmit`, 변경된 TypeScript 파일 ESLint, `git diff --check` 통과. 최초 누락 import와 import 정렬 오류는 수정했다. 이미 통과한 helper/BFF/schema 검증은 반복하지 않았다.
- 위 브라우저 응답도 모의 데이터이며 실제 API·DB 쓰기는 0회다. 로컬 검증은 프로세스에만 fixture 설정을 적용하고 실제 upstream에 접근할 수 없게 구성했다. 결과는 외부 작업 폴더의 `shinhan-152-client-browser-mock-report.json`에 있으며 파일명의 152와 관계없이 기존 1.5.1 구현을 검증한 기록이다.

자동 승인 검토가 공개 dev bridge 키를 위 Vercel Preview에 등록하도록 서버 담당에게 보내는 요청을 거절했다. 특정 프로젝트로의 비밀값 공급에 명시적 승인이 필요하다는 사유다. 대상·범위를 승인받기 전 다른 경로로 키를 이동하거나 환경을 활성화하지 않는다.

설정 승인 후 실제 검증 순서:

1. 서버 담당에게 합성 전화번호 허용 목록, worker 중지, `INTEGRATION_MODE=disabled`, `EXTERNAL_WRITES_APPROVED=false` 유지 여부를 확인한다.
2. 정확한 dev commit을 Preview로 배포하고 위 고정 origin에서 공통 BFF·필수 동의·세션을 확인한다.
3. OWNED/RENTED 합성 **2건**을 서로 다른 키로 저장한다. 같은 세션·키·본문 재요청의 추가 접수 **0건**을 서버 건수와 대조한다.
4. 입력 오류·세션 회수/만료·API 장애에서 거짓 성공이 없고 PC·모바일 제출 상태가 맞는지 확인한다. 사용한 세션 회수는 서버 담당에게 요청한다.

서버 인증·DB·공통 계약·관리자 코드를 직접 수정하지 않는다. 데이터 초기화·seed·실제 고객 발송·운영 시트 쓰기·production 배포·main 반영은 포함하지 않는다. 이전 stage10/11 로컬 검증과 main `6067ffe` 이력은 원격 검증 완료 근거가 아니다.
