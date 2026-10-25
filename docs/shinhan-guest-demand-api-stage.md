# 게스트 위치·예산 수요조사 dev API 연결

버전 **1.0.0** · 2026-10-25 · `hometgr-client` / `dev`.

## 범위와 계약

- 기준 인계: `C:/Users/PC/Documents/GitHub/shinhan-runtime-split/docs/customer-web-handoff.md` **1.5.4**.
- 신청·현재 조회 **1.0.0**, 원격 문서 **1.1.1** / bootstrap **1.1.0**, 동의·걱정 **2.0.0**, 런타임 분리 **1.0.2**를 유지한다.
- 기존 BFF·익명 세션·HttpOnly 쿠키·필수 동의 버전·Zod·멱등 재시도를 재사용해 `GUEST_DEMAND`를 원격 생성·걱정 저장 허용 목록에 추가했다. 서버 인증·DB·공통 계약·공유 의존성·키 변경은 없다.
- `/shinhan/dev/guest/demand`는 기존 환경·origin 검사를 통과한 dev Preview에서 열린다. 얇은 Server Component route와 FSD 구조, 기존 화면·공통 예시 사진을 유지했다.
- 기존 수요조사 안내만 실제 저장 동작에 맞췄다. 서버 저장 성공 전에는 접수 완료를 표시하지 않고, 알림톡 전달·시트 반영과 구분한다.
- 저장 후 기본 입력은 조회 전용이다. 불명확한 결과는 원래 세션·키·본문으로 재시도하며 자동 새 접수·새 세션을 만들지 않는다. 걱정의 선택 동의나 게스트 소개서 요청을 추가하지 않았다.
- 신한 파일 3개만 변경했다. 기존 미추적 기획서·UTM 문서 4개, 개발도구·의존성·캐시는 보존했다. 시작 시 C 드라이브 여유 공간은 25.76GB이며 정리는 필요하지 않았다.
- 구현 커밋 `4722e018ba6cd8b3c15e50f23d132bdbb5757890`: `feat(shinhan): 게스트 수요조사 원격 접수 연결`.

## 입력 계약과 기존 매핑

| 요청 필드 | 유지한 입력·검증 |
| --- | --- |
| `desiredRegionRaw` | 자유 입력, 앞뒤 공백 제거 후 1~200자 |
| `budgetMinKrw` / `budgetMaxKrw` | 각각 200000~1000000원·10000원 단위, 최소≤최대, 같은 금액 허용 |
| `moveInDate` | 실제 존재하는 YYYY-MM-DD 날짜, 한국 시간의 오늘 포함 이후 |
| `contractTermCode` | `MONTH_1`~`MONTH_12`, 별도 `MONTHS_12_PLUS` |
| `gender` | `FEMALE` 또는 `MALE` |
| `phone` | 공통 휴대폰 검증·정규화 사용 |
| `requiredConsent` | 서버 전문에 명시적으로 동의하고 표시된 버전으로 제출 |

기존 mapper·폼 schema·응답 DTO가 위 계약과 일치해 수정하지 않았다. API 입력 필드를 UI에서 새로 구성하거나 미확정 필드를 추가하지 않았다. 전체 가이드 보기는 읽기 전용이며 건너뛰기 저장 제안을 임의 확정하지 않았다.

## 실행 환경

기존 `welcome-web`의 **Preview / dev**와 환경변수 7개를 그대로 사용한다. 이름·설정 위치·로컬 실행 방법은 [고객 공통 인계](shinhan-dev-api-handoff.md)를 따른다. 새 API·DB는 만들지 않았다.

검증 진입 주소:

`https://welcome-web-git-dev-hometogethers-projects-5dc18f8f.vercel.app/shinhan/dev/guest/demand`

구현 `4722e01`의 Preview `dpl_8uBPAW9nNhKGej8yJiakh3nNbZHx`가 **READY**이며 `target=null` / `branch=dev`와 위 직접 Vercel 별칭 연결을 확인했다. 고유 배포 URL은 `https://welcome-18frz76uz-hometogethers-projects-5dc18f8f.vercel.app`이다. 실제 BFF 검증에는 기존 allowlist의 고정 별칭을 사용했다.

서버 마지막 차단 상태 확인은 **2026-10-25 17:18:28 KST**, `worker inactive` / `INTEGRATION_MODE=disabled` / `EXTERNAL_WRITES_APPROVED=false`, 실행 SHA `63612a4`다. 서버 담당은 이후 배포·차단 설정 변경이 없다고 답했다. 기존 세 유형과 동일한 차단 검사를 다시 실행하지 않았다.

## 검증 기록

이번 범위는 합성 `GUEST_DEMAND` 신청 최대 1건·해당 걱정 저장 1회와 같은 키 재시도다. 입력 오류·경계값은 추가 접수 없이 확인한다. 이미 끝난 방 등록·호스트 견적·게스트 예산 검증과 세션 회수는 반복하지 않는다.

### 코드와 비저장 경계 검증

- `tsc --noEmit`, 변경 3파일 ESLint, `git diff --check` 통과.
- diff 검토에서 기존 환경·origin 보안 가드, 같은 키 재시도, 게스트 접수 후 조회 전용, HOST_ESTIMATE에만 허용된 소개서 요청이 유지됨을 확인했다.
- 기존 TypeScript·Zod로 실제 폼/DTO/날짜 helper를 메모리에서 읽어 **27/27 통과**했다. API·DB 요청과 신청 생성은 **0회**다. 테스트 인프라·의존성·시스템 시계는 변경하지 않았다.
- KST 날짜가 바뀌는 UTC15:00 전후, 오늘 포함·어제 거절, 윤년·존재하지 않는 날짜, 최소=최대 허용, 기간 13개 코드와 `MONTH_13` 거절, 성별 2개와 기타·null 거절을 확인했다.
- 저장된 신청의 DTO는 과거의 유효한 날짜를 읽을 수 있으며, 신규 폼에서는 어제를 거절한다. 이 검증은 실제 서버나 브라우저 Calendar 동작을 대신하지 않는다.

보고서: `C:/Users/PC/.codex/visualizations/2026/10/22/01a16209-7b74-77d0-8d98-02e59f6e504a/shinhan-156-demand-boundaries-report.json`.

### 실제 dev Preview

| 신청 ID | 서버 저장 시각 (2026-10-25 KST) | 원래 요청 재시도 | 걱정 저장 |
| --- | --- | --- | --- |
| `2e8f0dd7-ce57-411b-a52a-8699c6d91134` | 17:29:51.130878 | 201 · `Idempotency-Replayed:true` · 같은 ID/createdAt | `PRIVACY`, `COST_CONTRACT` · 200 / 2.0.0 |

- 최초 신청은 실제 **201 / 계약 1.0.0**이다. 그 성공 응답을 브라우저에 전달하지 않아 거짓 완료 없이 입력·원래 요청을 보존하는지 확인했다. 이후 **동일 세션·멱등 키·본문**의 실제 재요청으로 원래 신청을 복원했다. 네트워크 응답 유실은 검증 도구에서 유발했으며 실제 API 서버를 중단한 것은 아니다.
- 생성 고유 키 1개·HTTP 전송 2회(원키 재시도 포함), 걱정 고유 키 1개·HTTP 전송 1회다. 신규 신청 **1건**, 걱정 갱신 **1회**, 본검증 세션 **1개**이며 다른 유형·소개서 변경은 **0회**다. 불명확한 저장을 새 키·세션으로 재접수하지 않았다.
- 최종 `notification=PENDING`, `deliveredAt=null`, `estimate=null`, `introductionRequestedAt=null`, `exampleContentVersion=common-space-v1`을 확인했다. 걱정의 선택 동의는 보내지 않았다.
- 저장 후 current 조회가 같은 신청을 반환했다. 원래 수요조사 입력 경로로 돌아가도 조회 전용 안내가 표시됐고, 가이드·접수 내역·공간 사진 탐색이 신청이나 걱정을 다시 저장하지 않았다.
- **PC 1440px:** 각 월세 20~100만 원·1만 원 단위, 19/101만 원·45.5만 원·최소>최대 오류를 접수 없이 확인했다. 자유 입력 위치, Calendar 오늘/미래 날짜, 계약기간 13개와 성별 2개를 선택·변경했다. 실제 제출은 45~60만 원·미래 입주일·`MONTHS_12_PLUS`·`FEMALE`을 사용했다.
- **모바일 390px:** 실제 서버 필수 전문 왕복과 조건 수정 화면 복귀 후 위치·예산 범위·날짜·기간·성별·연락처·필수 동의가 유지됐다. 응답 유실 오류·재시도 완료·조회 전용 내역을 확인했다.
- 실제 브라우저 보고서 **COMPLETE / 9항목 통과 / failures 0 / page error 0**. 캡처 7장 직접 확인에서 가로 넘침·문구 겹침 없이 공통 사진 3장과 완료·오류·가이드·내역을 표시했다.

다음 외부 작업 폴더에 비밀값 없는 보고서·캡처를 보관했다.

`C:/Users/PC/.codex/visualizations/2026/10/22/01a16209-7b74-77d0-8d98-02e59f6e504a/`

- `shinhan-156-actual-guest-demand-report.json`
- `shinhan-156-pc-conditions-actual.png`
- `shinhan-156-mobile-contact-privacy-actual.png`
- `shinhan-156-mobile-real-201-response-lost-actual.png`
- `shinhan-156-mobile-complete-actual.png`
- `shinhan-156-pc-complete-actual.png`
- `shinhan-156-pc-concerns-guide-actual.png`
- `shinhan-156-mobile-receipt-actual.png`

검증 브라우저만 종료했고 사용자 Chrome·의존성·캐시를 유지했다. 세션 회수는 하지 않았다. 보고·서버 전달에는 전화번호·토큰·비밀값·원문 멱등 키를 포함하지 않았다.

### 서버 읽기 대조

위 ID·생성 시각·재시도·걱정 결과를 서버 담당에게 전달했고, **2026-10-25 17:32:17 KST**에 지정 신청 1건만 읽기로 대조했다.

- 신청 **1건·추가 중복 0건**, 최초 입력·생성 시각 보존, 걱정 응답 2개·현재 버전 2로 일치했다.
- 알림 사건 **1건**, 발송 작업 **1건**, 시트 작업 **2건**이다. 모두 `PENDING`이며 실행 이력·공급자 요청·전달 기록은 **0건**이다.
- 계산·소개서 null, 예시 버전 `common-space-v1`도 일치했다. worker 중지·외부 연동 차단을 유지했다.
- DB·세션·키를 변경하지 않았고 임시 SSH 규칙은 삭제됐다. 기존 세 유형 검사를 반복하지 않았다.

## 이번 범위 밖

운영/main 배포, 일반 공개 진입 동선 전환, worker 기동, 실제 알림톡 발송·시트 쓰기, 키 변경, 데이터 삭제, 세션 회수는 수행하지 않는다. 다중 탭 전체 조합·실제 서버 중단·외부 전달 성공을 검증했다고 보고하지 않는다.
