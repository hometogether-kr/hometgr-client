# 고객 사용 기록 개발 계획

작성: 2026-10-27 Asia/Seoul. 현재 상태: draft.3 문서·합성 자료·관리자 재검토. 기존 미완성 앱 코드는 보존하고 개발 중단 유지.
공통 계약: contract.md / 0.1.0-draft.3. 기술 제안과 사용자 확정을 구분한다.

## 1. 실제 작업 기준과 보존

- 워크트리: C:/Users/PC/.codex/worktrees/shinhan-production-only/hometgr-client
- 시작 브랜치/HEAD: codex/shinhan-beta-dashboard / fd514bf256d75d2fd45bde77d062d38615537820
- 최초 tracked/staged 변경·untracked 파일: 없음.
- origin main fetch 후 기준 SHA: 9f314521e444da9b0e63efeb2d80fcea1a89da8b
- 새 브랜치: codex/shinhan-beta-tracking (위 origin/main에서 생성)
- 최신 커밋: fix(shinhan): 고객 웹사이트 입력 및 완료 화면 개선 (#44), 2026-10-27 00:14:20 +09:00
- 기존 main/dev 병합, reset, stash, clean, 기존 변경 덮어쓰기, 신규 worktree 생성 없음.
- 기존 worktree 3개 유지:
  - C:/Users/PC/Documents/GitHub/hometgr-client — codex/shinhan-main-release / 0c424300a87ac8bbc10e6b5f13324d27d5bfed61
  - C:/Users/PC/.codex/worktrees/shinhan-feedback-fix/hometgr-client — fix/shinhan-customer-feedback / 04e22013d8d923ba43e8ca27e1055dccad1d11b3
  - 지정 production-only 경로 — 작업 후 codex/shinhan-beta-tracking / 9f314521...
- 앱의 worktree 첨부는 다른 대화 소유라 지원되지 않았다. 새 worktree를 만들지 않고 사용자 지정 경로를 명시해 작업했다.
- node_modules는 기존 C:/Users/PC/Documents/GitHub/hometgr-client/node_modules junction 재사용. Next 16.2.10, React 19.2.4, Zod 4.4.3. 디스크 여유 약 14GiB, 삭제/설치 없음.

## 2. 최신 코드와 기존 계획의 차이

| 기존 계획/과거 기록 | 최신 코드 확인 및 반영 |
| --- | --- |
| 과거 고객/서버 SHA·브랜치 | 이번 고객 기준은 위 main SHA. 서버 인계1.8.0의 8cebb61/실행7df5ceb는 별도 저장소/시점 이력 |
| 서버 인계의 cloudflare-vercel BFF 보완 필요 | 현재 shinhan-bridge의 environment.server.ts, client-ip.server.ts, handler.server.ts에 모드/ingress/HTTPS 검사가 이미 있음. 과거 보완을 중복 구현하지 않음. 이번 배포 상태 확인 없음 |
| storage-context에서 완료 검토 | 저장 성공만으로 부족. 실제 saved-application 화면 표시를 관찰. 저장 성공 후 이동 실패면 완료 아님 |
| followup/FAQ 재방문 연결 | 실제 운영 안내는 saved-application-flow.tsx. guest-followup example은 개발 미리보기. 삭제된 재방문 UI/제외된 안내문을 복원하지 않음 |
| 입력·완료 화면 | 최신 main 12파일(125추가/78삭제) 개선 반영. formatShinhanPhone handler, 게스트 '집주인 프로필 보고 결정하기', 게스트 홈 링크 유지 |
| 저장 상태 다시 확인 | 공통 버튼 제거됨. 현재 오류 상태의 '신청 내역 다시 불러오기'만 관찰. 새 조회 버튼 없음 |
| 새로고침 결과 복원 가정 | 신청 ID/쿼리 캐시는 메모리. 새로고침 saved URL은 빈 상태 가능. 계측 때문에 신청 ID 보관/복원·재신청을 추가하지 않음 |
| 기존 UTM/UUID 재사용 | 현재 카카오 tracking은 현재 URL UTM만 읽고 최초/최근 보존이 없음. localStorage UUID 검증도 없음. 공통 출처/검증 보완 필요 |
| 기존 추적 API 재사용 | 기존 schema에 session_id·전체 URL/referrer·device 포함. 베타는 별도 최소 계약. landing_view 명칭/UUID 키 재사용 |
| 두 동작 수집기 | tracking의 2동작과 dashboard의 3권한 차이를 record_event/get_admin_aggregates/get_public_aggregates로 초안 통일 |
| 세 이벤트 제안 | 현재 사용자가 세 종류 확정. 정확한 새 이벤트명/집계 규칙은 계약 초안으로 구분 |

## 3. 구현 순서와 수정 예정 파일

아래는 구현 후보/계획 목록이다. 일부 초안은 중단 전에 작성됐으므로 실제 저장 상태는 implementation-progress.md를 함께 본다. 이번 단계에서 애플리케이션 파일은 수정하지 않는다.

### A. 공통 형식·기록 모델·BFF

- docs/shinhan-beta-handoff/contract.md, fixtures/*: 고객 소유, 관리자 리뷰 반영.
- src/domains/beta-tracking/model/event.schema.ts, aggregate.schema.ts, types.ts, index.ts (신규 후보): DTO/schema·고정 코드·공통 집계 형식.
- src/features/beta-tracking/model/attempt-store.ts, event-queue.ts, use-beta-tracking.ts (신규 후보): 분석 시도/단계/표식·다중 탭 잠금·제한 재시도.
- src/features/beta-tracking/api/events.ts, collector.server.ts, handler.server.ts (신규 후보): 최소 전송·서버 보강·서명·응답 검증. 서버 진입점 별도 export/server-only.
- src/features/beta-tracking/config/environment.server.ts, environment.schema.ts (신규 후보): 설정 Zod 검증, 기본 비활성, context/run/dataset 결합.
- src/app/api/beta/events/route.ts (신규): POST를 feature handler에 위임하는 얇은 route. 기존 신청 bridge allowlist 변경 없음.
- src/app/shinhan/layout.tsx 또는 해당 pages-layer 구성: 직렬화 가능한 공개 context와 작은 observer만 조합.
- Apps Script/관리자 API·화면/DB/공통 신청 API는 고객 수정 대상이 아님.

### B. UTM 최초·최근 보존

- src/domains/marketing-attribution/model/external-attribution.schema.ts, external-attribution.ts 및 index.ts (신규/보완): 승인 네 태그·최초/최근·snapshot. 기존 source enum과 구분.
- src/features/capture-marketing-attribution/ui/attribution-observer.tsx 및 index.ts (신규): 외부 진입/브라우저 URL 관찰용 작은 Client component.
- src/app/layout.tsx: 일반 홈투게더↔신한 같은 origin 이동에도 출처가 이어지도록 observer 배치. 전체 layout을 Client로 바꾸지 않음.
- 필요한 경우 src/shared/lib/browser-id.ts: UUID 검증 등 업무 독립 부분만 추출.
- features/kakao-attribution/model/tracking.ts는 공통 UUID helper가 필요한 경우에만 작은 수정. 기존 이벤트/시트 계약 변경 및 전면 재작성 없음.
- 내부 이동에 UTM 추가/역할에 맞춘 campaign 변경/새 채널 생성 없음. 숨겨진 검색 referrer를 추정하지 않음.

### C. 첫 유효 입력·선택

| 흐름 | 기존 파일/지점 | 계측 계획 |
| --- | --- | --- |
| HOST_ESTIMATE | widgets/shinhan-host-estimate/ui/shinhan-host-estimate-flow.tsx:55 selectAddress, :82 updateValues, :247/:262 입력, :293/:324 선택 | 해당 필드의 유효성 확인 후 값 없는 신호. 자동 NONE·빈 문자열·렌더 제외 |
| HOST_REGISTRATION | widgets/shinhan-host-registration/ui/host-registration-form.tsx:58 ownership, :118 위치, :77 전화 | 최초 유효 입력 1회. 맨 위 전화 입력도 포함 |
| GUEST_BUDGET | widgets/shinhan-guest-intake/ui/shinhan-guest-intake-flow.tsx:80 updateBudget, :231/:237/:242 | 표시용 슬라이더 기본값 제외. 실제 사용자 선택만 |
| GUEST_DEMAND | 같은 파일 :88 updateDemand 및 각 handler | 필드 단위 최초 유효 입력. 폼 전체 제출까지 기다리지 않음 |
| GUEST_DEMAND 진입 전 지역 | features/shinhan-intake/ui/guest-entry.tsx:44 타일, :61 검색 | 유효 지역 선택/검색은 시작 후보. 단순 guestFormButton CTA 제외 |

features/shinhan-intake/ui/contact-fields.tsx와 guest-entry.tsx에 필요 시 optional onValidInput(): void만 추가한다. 개인정보/입력값을 beta feature에 넘기지 않는다. features끼리 직접 import하지 않는다.
widgets/shinhan-guest-content/ui/guest-introduction.tsx와 guest-spaces.tsx는 Server 유지. 작은 신규 Client adapter에서 두 feature를 조합한다. 서버에서 함수 props를 전달하지 않는다. shinhan-intake/index.ts는 필요한 공개 계약만 export한다.

### D. 실제 결과·안내 표시

- src/widgets/shinhan-saved-application/ui/saved-application-flow.tsx
  - :131 HOST_REGISTRATION complete: 완료 1회.
  - :139 HOST_ESTIMATE result: 완료 1회.
  - :131 게스트 complete: resultSeen만.
  - :216 guide에서 카드 1개 이상 표시 + resultSeen: 게스트 완료라는 관찰 제안.
  - :232~237 빈 안내는 미완료. 기존 전체 보기(:92~95)로 카드가 표시되면 완료.
- DOM/브라우저 표시 관찰을 작은 observer로 분리한다. 렌더 중 전송하거나 계측 효과로 기존 신청 mutation을 유발하지 않는다.
- src/features/shinhan-intake/model/storage-context.tsx는 가능한 한 수정하지 않고 상위 widget에서 공개 상태를 최소 표식으로 관찰한다.
- 결과 재표시·새로고침·재조회는 같은 시도다. 완료 후 기존 입력 화면의 실제 첫 유효 입력으로 새 체험이 시작되면 새 attempt를 만든다. 폼/결과의 메모리 바인딩과 predecessor 잠금 규칙은 contract §4를 따른다. 신청 수나 신청 ID로 재체험을 판단하지 않는다.
- 분석 시도/완료에 신청 ID·draftGeneration·세션·신청 멱등키를 사용하지 않는다. 조회/복원 경로 추가 없음.

## 4. 공통 계약·관리자 재검토

브라우저 이벤트13필드+공개 context, BFF 보강3필드, 수집기 received_at을 구분하고 원장17열을 유지한다. 기존 세 action/전용 키, ACK·오류·dirty·HMAC/nonce 경계는 유지하며 이벤트/schema 버전은 0.1.0-draft.3, 집계 정의는 shinhan_beta_metrics_draft_v2다.

draft.2는 관리자 admin-review-2와 동일 버전 합의가 완료됐던 이력이다. 이후 사용자 운영 결정 및 admin-review-3-policy의 P1~P6를 draft.3에 반영한다. 기존 원본·예시·이전 agreement/manifest는 history/0.1.0-draft.2/에 보존한다.

| 요청 | 이번 문서/합성 예시의 변경 |
| --- | --- |
| P1 수집 범위 | 모든 /shinhan 일반방문 상시 수집. 전용 링크·참여 구분 없음. beta는 호환용 운영 dataset 명칭 |
| P2 집계 기간 | KST 오늘 포함 달력30일. 실제 period와 as_of 보존. 내부 과거기간 fallback에는 period_behind |
| P3 재체험 | 이어하기 같은 시도, 실제 완료 후 새체험은 새 시도. 폼/결과 메모리 바인딩과 잠금 경합 사례 |
| P4 보관 | 원장 최초수집90일, 이번 분석상태 고정최대90일, 미전송 최초발생최대7일. 공유ID/기존저장소 삭제 없음 |
| P5 갱신 | 내부5분/15분초과, 공개KST09시/36시간초과. 정확한 경계와 갱신실패 구분 |
| P6 공개 보호 | 지지 브라우저1~4개 및 역산 보호. 숫자 전체 공개/전체 억제 충분조건과 과거 공개 이력 한계 |

전달 묶음:
1. contract.md draft.3와 manifest의 정확한 SHA256.
2. 버전·서명 vector·이동기간/재체험/보관/공개 보호 합성 사례와 변경 부분 검증 기록.
3. 관리자 자신의 contract-review.md에 P1~P6, DTO/집계/예시 일치 여부, 차단 이견, 같은 버전 수락을 기록.
4. 고객 agreement.md가 같은 계약·manifest·관리자 리뷰 해시를 고정해 최종 확인.

기존 고정20행의 기준시각 집계 E7/S6/C3, 늦은완료 후C4는 유지한다. 30일 경계에 맞춘 H의 시각 조정, 다음날 자정의 이동기간과 I 포함, 같은 브라우저 재체험은 합성 자료에서 명시한다. 기존관리자 임시 E8 등의 과거 후보를 운영 지표로 사용하지 않는다.

새 버전 기술 합의 완료 여부는 관리자 재검토 후 agreement.md에서 판정한다. 자료 준비/검토는 실제 Apps Script 배포·시트 쓰기를 기다릴 필요 없지만, **기술 합의가 완료돼도 앱 개발 중단은 유지한다.**

## 5. 실행 전 확인 및 기술 반영 범위

사용자 정책은 확정됐다. 참여 구분·베타 종료일·종료 후 유예·보관/갱신 기간을 다시 선택받지 않는다.

실제 연결 전 확인할 정보:
- 수집·공개 각각의 실제 활성화 시점.
- 운영 계정·시트/Apps Script 접근·키 공급/보관 담당자.
- 만료 정리·갱신 장애 확인 담당자.
- 연결 검증 대상·요청 수·예상 신규행 수와 배포 대상.

기술 반영/재검토 항목:
- draft.3의 메모리 관찰 바인딩으로 실제 새 체험과 과거 결과 재표시를 구분하고 다중탭 stale observer가 최신 시도를 오염시키지 않게 한다.
- 만료 경계·선행 유실·삭제 후 canonical 보장 범위와 큐 terminal 처리.
- 고정 run 기간 대신 KST30일, 내부 최신 snapshot/fallback, 공개 실제발행기간 보존.
- 공개 역산 보호의 보수적 충분조건, 자료 만료/유실 때 전체 억제. 무기한 ID 이력이나 새 policy key로 우회하지 않는다.
- 상시 수집 설정은 종료일을 필수로 요구하지 않는다. 기존 BFF의 작성 중 코드가 이미 새 계약을 구현한 것으로 표시하지 않는다.
- /api/beta의 운영 ingress·요청 제한은 서버·인프라 담당과 확인한다.

기존 인증·DB·공통 신청 DTO 변경은 현재 필요하지 않다. 필요가 발견되면 서버 담당 요청으로 분리한다. 실제 수집/공개는 기본 비활성 상태를 유지한다.

## 6. 검증

### 이번 문서 단계

버전/필드·JSON 파싱·HMAC vector, 변경된30일 기간과24시간·갱신 경계, 재체험·보관·공개 역산 보호의 합성 기대값만 로컬에서 확인한다. 의미가 변하지 않은 이전 검증은 재사용하고 변경 부분만 검증한다. 이는 앱 코드 테스트가 아니며 개발 서버·린트·포맷·빌드·브라우저 검증을 재개하지 않는다.

### 구현 승인 후 외부 쓰기0회

1. 기존 Node/pnpm/node_modules 재사용. 새 테스트 프레임워크/설치 없음.
2. 먼저 loopback 전용 Node 내장 HTTP mock transport(후보 scripts/shinhan-beta-local-mock.mjs)를 준비한다. 기존 consents/sessions/applications/current/concerns를 최신 DTO 합성 응답으로 처리한다. localhost 외 upstream/알림/시트 접근 차단, 알 수 없는 요청은 실패. 운영 env 복사 없이 프로세스별 로컬 설정 사용.
3. 분석은 같은 계약의 로컬 collector stub으로만 연결. 운영 Apps Script 중복 구현이 아닌 모의 수신함. 서버가 connection_test/simulation 강제.
4. 합성 신청 ID/연락처는 UI mock 경계에만 두고 분석 자료/저장소/로그와 분리. 로컬 mock은 sessions=1.0.0, consents/concerns=2.0.0 및 X-Shinhan-App-Env: local을 따른다. remote sessions/bootstrap=1.1.0은 별도 합성 경계 검증/참고용이다. 테스트 편의로 기존 BFF를 수정하지 않고 과거 optionalConsent 예시도 복사하지 않는다.
5. dev server와 전용 테스트 브라우저로 기존 네 흐름 확인. 신청/걱정/소개서 요청은 로컬 모의만. 주소검색 등 외부 경계도 모킹/차단하며 기존 UI의 합성 선택으로 검증. 도구가 모킹을 지원하지 않는 경계는 실제 호출로 우회하지 않음.
6. 변경 경계만 검증: 첫 유효 입력·자동값 제외, 호스트 후속 없는 완료, 게스트 결과만/빈 안내 미완료→기존 카드 완료, 저장 실패, 분석 timeout에도 고객 진행.
7. 동일 event/의미중복/응답 유실/다중탭/새로고침 빈 상태/재조회/다른 흐름 확인. 가짜 시각으로24h 전후·늦은완료·KST 경계.
8. UTM6조합, 최초A/최근B/기존시도A, 내부/직접 보존, 미승인값 제거 확인.
9. 변경 범위 린트/타입 검사를 마지막에 한 번 묶어 수행. 새 변경/실패 없으면 반복하지 않음. 기존 종합 신청·알림·운영 연동 검증 재실행 없음.

### 실제 분석 연결은 별도

대상 문서/탭/배포 URL·모드·정확한 건수·기간을 제시하고 별도 지시 후 진행한다. 공통 합성 원장이나 추가 사례를 그대로 업로드하지 않는다. 검증 목적 실제 신청·걱정·소개서·알림·기존 접수 탭 쓰기는 하지 않는다.

## 7. 설치된 프레임워크 가이드

node_modules/next/dist/docs의 route.md, 05-server-and-client-components.md, environment-variables.md 관련 절 확인. 얇은 route, 작은 Client 경계, 직렬화 props, server-only 비밀값 경계를 따른다. 실제 프레임워크 코드 변경 직전 설치 버전/관련 guide를 대조한다. 이번 앱 변경 없음.


## draft.3 문서 작업과 개발 재개 경계

이번 요청은 공통 새 버전·합성 자료·관리자 재검토·동일 버전 합의 확인까지다. 고객과 관리자 앱/수집기 개발은 중단되어 있다. 기존 미완성 코드·의존성·캐시·작업 브랜치를 보존하고 새 worktree·설치·코드 변경을 하지 않는다.

사용자가 개발 재개를 별도로 지시하면, 현재 미완성 코드와 draft.3의 차이를 먼저 확인한다. 새로운 일반방문 정책·재체험·만료·기간/공개 규약을 코드에 반영하는 작업은 그 이후다. 이번 합의가 운영 연결·공개·배포·push/merge를 승인하지 않는다.
