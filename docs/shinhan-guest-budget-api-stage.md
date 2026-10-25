# 게스트 예산 dev API 연결

버전 **1.0.0** · 2026-10-25 · `hometgr-client` / `dev`.

## 범위와 기준

- 서버 인계 `C:/Users/PC/Documents/GitHub/shinhan-runtime-split/docs/customer-web-handoff.md` **1.5.4**. 공개 신청·조회 **1.0.0**, 동의·걱정 **2.0.0**, 원격 문서 **1.1.1** / bootstrap **1.1.0**, 런타임 분리 **1.0.2**를 유지한다.
- 구현 커밋 `0cb50ff4898032dc818109b664d1c6facb11e366`: `feat(shinhan): 게스트 예산 원격 접수 연결`.
- 기존 공통 BFF·익명 세션·서버 필수 동의·응답 Zod·같은 키/본문 재시도를 재사용한다. 원격 생성과 걱정 저장에 `GUEST_BUDGET`만 추가했다. `GUEST_DEMAND`는 다음 단계다.
- `/shinhan/dev/guest/budget`는 기존 환경·origin 검사를 통과한 dev Preview에서만 원격으로 열린다. 일반 공개 진입 버튼·Production 보안 가드를 변경하지 않았다.
- 월 예산 20~100만 원·1만 원 단위, 자유 입력 위치, 기존 Calendar와 KST 오늘 이상 날짜 검사를 유지했다. 공통 예시 사진과 ‘찾았어요’를 유지하며 실제 매물 검색 결과로 표시하지 않는다.
- 기본 신청은 서버201 이후에만 완료된다. 이후 조건·사진은 조회 전용이고 신청을 다시 생성하지 않는다. 게스트는 소개서 API를 사용하지 않는다.
- 걱정은 선택 동의 없이 게스트 코드만 저장한다. 전체 가이드 보기는 API 변경 없이 열리며, 제안 상태인 건너뛰기 저장을 임의로 추가하지 않았다.
- 안내 문구를 실제 저장 버튼과 개발용 입력 확인 버튼의 동작에 맞췄다. 접수 완료와 알림톡·시트 전달 성공은 구분한다.
- 변경은 신한 파일 4개다. 일반 사이트·서버 인증·DB·계약·공유 의존성·기존 키는 변경하지 않았다.

## 실행 환경

기존 Vercel `welcome-web` **Preview / dev**와 7개 환경변수를 그대로 사용한다. 이름·공급 방식·로컬 실행은 [공통 연결 인계](shinhan-dev-api-handoff.md)의 고객 dev 실행 환경 절을 따른다. 새 API·DB나 키를 만들지 않는다.

검증 주소:

`https://welcome-web-git-dev-hometogethers-projects-5dc18f8f.vercel.app/shinhan/dev/guest/budget`

Preview `dpl_EJBapAKZCUEVxu1DuhnDAhFzjmjQ`, SHA `0cb50ff4898032dc818109b664d1c6facb11e366`가 **READY**이며 `target=null`, `branch=dev`와 위 직접 Vercel 별칭 연결을 확인했다. 유일 배포 주소는 `https://welcome-rcvv6n1wn-hometogethers-projects-5dc18f8f.vercel.app`이다. BFF 검증은 allowlist에 등록된 고정 별칭을 사용했다.

서버는 앞선 **2026-10-25 17:03:07 KST** 읽기 대조에서 `worker inactive`, `INTEGRATION_MODE=disabled`, `EXTERNAL_WRITES_APPROVED=false`를 확인했다. 이번 단계 시작 시 서버 담당은 그 이후 배포·설정 변경이 없다고 답했으며, 동일한 서버 검사를 반복하지 않았다. 실행 SHA는 `63612a4`다.

## 검증

- `tsc --noEmit`, 변경 4파일 ESLint, `git diff --check` 통과. 최초 Windows ESLint `.cmd` 호출의 괄호 경로 해석 문제는 Node 직접 실행으로 해결했다.
- 변경 diff 검토에서 게스트 수요 원격 차단, 접수 후 조회 전용, 호스트에 한정된 소개서 요청, 세션 만료 차단·중복 클릭 방지·요청 키/본문 유지, Server Component와 FSD 의존 방향을 확인했다.
- 이번 실제 검증 범위는 합성 게스트 예산 신청 최대 1건·해당 걱정 저장 1회와 동일 키 재시도다. 완료된 호스트 방 등록·견적·세션 회수 검사는 반복하지 않는다.

### 실제 dev API 신청 1건

| 신청 ID | 서버 저장 시각 (2026-10-25 KST) | 동일 키·본문 재요청 | 최종 알림 상태 |
| --- | --- | --- | --- |
| `9d9f4b60-78bd-4596-8f16-dcc52231b15c` | 17:15:26.012254 | 201 · `Idempotency-Replayed:true` · 같은 ID/createdAt | `PENDING`, `deliveredAt=null` |

- 최초 생성은 실제 **201 / 계약 1.0.0**이다. 그 성공 응답을 브라우저에 전달하지 않아 입력이 잠기고 거짓 완료가 나타나지 않는 것을 확인했다. 이후 같은 요청 키·본문의 실제 재요청이 원래 접수를 복원했다. 실제 API 서버를 중단한 검증은 아니다.
- 저장 응답의 `estimate=null`, `introductionRequestedAt=null`, `exampleContentVersion=common-space-v1`을 확인했다. 접수와 외부 알림 전달을 구분했다.
- 걱정 `PRIVACY`, `COST_CONTRACT`를 한 번 저장해 **200 / 계약 2.0.0**을 받았다. 선택한 가이드 2개와 안내·접수 내역·공통 사진 다시보기를 확인했다.
- 본검증 브라우저 세션은 1개다. 신규 신청 1건·생성 키 1개·생성 HTTP 전송 2회(동일 키 재시도 포함), 걱정 변경 1회·키 1개·HTTP 전송 1회다. 호스트·게스트 수요·소개서 변경은 0회다.
- PC 1440px에서 예산 20/21/100만 원과 1만 원 키보드 단위, 소수 예산 오류, 자유 위치 입력과 Calendar 미래 날짜 선택을 확인했다. 유효 예산은 45만 원을 사용했다.
- 모바일 390px에서 실제 서버 필수 전문 왕복 후 연락처·명시적 동의 선택·공간 예시 단계가 유지됐다. 공통 사진 3장과 ‘찾았어요’ 문구를 유지했다.
- 저장 후 내역은 조회 전용이다. 원래 예산 입력 경로로 돌아가도 저장된 신청 안내만 표시되며 추가 생성은 없었다. 현재 상태 조회와 가이드·사진 탐색도 변경 요청을 추가하지 않았다.
- 브라우저 최종 **COMPLETE / 9항목 통과 / failures 0 / page error 0**이다. 이미 끝난 공통 BFF·호스트·세션 회수 검증은 반복하지 않았다.

보고서와 캡처는 다음 외부 작업 폴더에 보관했다. 토큰·비밀키·원문 Idempotency-Key를 기록하지 않았다.

`C:/Users/PC/.codex/visualizations/2026/10/22/01a16209-7b74-77d0-8d98-02e59f6e504a/`

- `shinhan-155-actual-guest-budget-report.json`
- `shinhan-155-pc-conditions-actual.png`
- `shinhan-155-mobile-contact-privacy-actual.png`
- `shinhan-155-mobile-real-201-response-lost-actual.png`
- `shinhan-155-mobile-complete-actual.png`
- `shinhan-155-pc-complete-actual.png`
- `shinhan-155-pc-concerns-guide-actual.png`
- `shinhan-155-mobile-receipt-actual.png`

캡처 7장을 직접 확인했고 PC·모바일의 가로 넘침·문구 겹침은 없었다. 전문 복귀 직후 캡처에는 반응형 이미지가 로딩 중이었으나, 이후 응답 유실 화면·공간 다시보기에서 공통 사진 3장의 로드·decode를 확인했다. 검증용 브라우저는 종료했고 사용자 Chrome·의존성·캐시·다른 문서를 유지했다. 이번 세션은 회수하지 않았으며 고정 만료를 따른다.

### 서버 저장 대조

서버 담당이 **2026-10-25 17:18:28 KST**에 위 신청 1건을 읽기로 대조했다.

- 신청 **1건·추가 중복 0건**, 최초 입력·생성 시각 보존. 걱정 응답 2개가 저장됐고 현재 버전은 2다.
- 알림 사건 **1건**, 발송 작업 **1건**, 시트 작업 **2건**이다. 모두 `PENDING`이며 실행 이력·공급자 요청·전달 기록은 **0건**이다.
- `estimate`·`introductionRequestedAt`은 null, 예시 버전은 `common-space-v1`으로 일치했다.
- worker 중지·외부 연동 차단을 유지했다. DB·세션·키는 변경하지 않았고 서버 담당의 임시 SSH 규칙도 삭제됐다. 완료된 호스트 검사는 반복하지 않았다.

## 남은 범위

GUEST_DEMAND 원격 연결, 일반 공개 진입 동선 전환, 실제 외부 연동과 운영 전환은 다음 단계다. 이번 단계에서 main·운영 배포·실고객 발송·운영 시트 쓰기를 수행하지 않는다.
