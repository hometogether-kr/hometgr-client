# 고객 분석 연결 준비

> 최신 전송 구현은 [기존 신한 서버 전환 기록](./server-transport-readiness.md)을 따른다. 아래 Apps Script 연결 설명은 당시 이력이며 현재 고객 BFF는 BETA_TRACKING_API_URL의 서버 RPC만 사용한다. 동결 DTO·운영 정책은 유지한다.

작성일: 2026-10-27 (Asia/Seoul). 이 문서는 동결 계약을 바꾸지 않는 운영 연결 준비 기록이다. 아래 검증 수치는 **합성 데이터의 예상값**이며 실제 베타 성과나 실행 결과가 아니다.

## 현재 상태와 근거 범위

공통 계약은 `0.1.0-draft.3`, 집계 정의는 `shinhan_beta_metrics_draft_v2`다. 고객·관리자의 동일 버전 및 계약/manifest 해시 일치 확인은 [구현 검증 기록](./implementation-verification.md)을 따른다. 확정된 일반 유입 상시 수집·보관·집계·공개 보호 정책을 다시 미정으로 돌리지 않는다.

읽기 조사 당시 관리자 [구현 현황](C:/Users/PC/Documents/GitHub/shinhan-beta-dashboard/docs/shinhan-beta-handoff/implementation-status.md)과 [Apps Script README](C:/Users/PC/Documents/GitHub/shinhan-beta-dashboard/integrations/beta-apps-script/README.md)는 실제 웹앱 배포·키 공급·트리거 생성·분석 연결을 미실행으로 기록하고 있었다. 이는 **문서를 읽은 시점의 기록**이며 진행 중인 연결 작업의 실시간 상태를 뜻하지 않는다.

이 고객 채팅에서 관리자 채팅의 사용자 **“구글 로그인했고 신한슈퍼SOL 시트 열어뒀어. 이제 Apps Script 연결 진행해줘.”** 지시를 확인했다. 관리자 측 Apps Script 연결 작업이 진행 중이다. 이미 그 채팅에서 승인된 연결 작업을 이 문서 때문에 다시 승인받도록 되돌리지 않는다. 최종 배포 URL·설정 적용·키 공급·검증 결과는 관리자 작업의 완료 보고로 갱신한다. 이 문서 작성 과정에서는 웹앱 배포·시트/Script Properties 쓰기·실제 분석 연결 검증을 실행하지 않았다.

최신 서버 인계는 [customer-web-handoff.md](C:/Users/PC/Documents/GitHub/shinhan-runtime-split/docs/customer-web-handoff.md) **1.8.0**, [고객 ingress 계약](C:/Users/PC/Documents/GitHub/shinhan-runtime-split/docs/customer-production-ingress-contract-v1.md) **1.1.0**다. 과거 인계의 배포 권한 오류와 초기 미완료 기록은 해당 문서의 최신 0절보다 우선하지 않는다.

이전 상태 확인(관리자 turn 01a17acc-36f2-7e62-a182-1374c0809c7d): 관리자는 전체 코드를 하나의 Code.gs로 준비하고 사용자에게 새 베타 프로젝트의 코드·manifest 저장을 안내했다. 당시 키 공급과 웹앱 배포는 다음 단계로 남아 있었다. 이후 확인한 최신 배포 응답 상태는 아래 절을 따른다. 이 문서는 관리자 채팅의 저장/배포 절차를 중복 실행하지 않는다.

## 웹앱 URL 인계 — GET 응답만 확인

2026-10-27 관리자 인계와 [관리자 연결 상태](C:/Users/PC/Documents/GitHub/shinhan-beta-dashboard/docs/shinhan-beta-handoff/connection-status.md)를 읽기 대조했다.

- 인계 URL: [베타 Apps Script 웹앱](https://script.google.com/macros/s/AKfycbz3mb9tuf1QfbeM3Jo491zz4gA-xXIu465k7dqevzqzOpo_g6gD035jm0Hi3iGxTovo/exec).
- 관리자 확인 범위: 인증정보 없는 GET 2회(script.google.com 302 → script.googleusercontent.com 200). application/json의 contract_version=0.1.0-draft.3 / INVALID_EVENT가 doGet의 예상 정적 응답과 일치했다.
- 해당 확인의 이벤트 POST·시트 쓰기·집계 실행은 각각0회다. 이 고객 문서 동기화에서는 GET을 반복하지 않았으며 외부 요청0회다.
- 정적 응답은 원격 코드 원문, 실행 계정·접근 정책, HMAC 키, 시트 읽기/쓰기 또는 전체 수집 연결을 검증하지 않는다.
- 프로젝트 편집 URL/Script ID, 원격 속성, 키 공급, run/context·최초 시작시각·허용 Origin, /api/beta ingress 보호는 확인·공급 전이다. 웹앱 배포 ID를 Script ID로 대신 쓰지 않는다.

URL은 인계 자료에만 기록했다. 고객 환경변수에 적용하거나 수집을 활성화하지 않았다. 관리자 측이 프로젝트 식별자와 비밀값을 노출하지 않는 키 공급 경로를 준비하며, 고객은 동일 키의 안전한 공급 및 나머지 적용 증거를 기다린다.

## 고정 대상과 역할

| 항목 | 확정된 경계 |
| --- | --- |
| 문서 | 신한슈퍼SOL, spreadsheet ID `1hwoacG7c-WqWRTw0hJBCaY2EqhAL5fJUTZkQj9oHsQI` |
| 탭 | `베타_사용기록`, sheetId `1161026001` |
| 원장 | A:Q의 기존 17열. A1:Q1 헤더·탭 ID·제목 불일치 시 중단 |
| 고객 담당 | 기존 화면 계측·UTM·시도/중복·재시도·분석 전용 `POST /api/beta/events` BFF |
| 관리자 담당 | 하나의 Apps Script 수집기, 집계·대시보드·설정·배포 결과 인계 |
| 서버·인프라 담당 | `/api/beta` ingress 보호·호출 빈도 제한·배포 환경의 비밀 설정 경계 |

운영 접수 탭 네 개·새 탭·다른 파일로 쓰기 대상을 바꾸지 않는다. 실제 고객 신청·걱정·소개서·알림을 분석 검증 수단으로 사용하지 않는다. 고객 저장소에서 운영 Apps Script를 중복 작성하지 않는다.

## 적용값과 공급 책임

키 값은 채팅·문서·Git·로그·브라우저에 넣지 않는다. 문서에는 변수 이름과 적용 여부·담당만 기록한다. 운영 연결 담당은 관리자 채팅에서 진행 중인 실제 계정/배포 범위를 확인하고, 비밀값을 해당 서버 환경 또는 Script Properties로 직접 공급한다. 고객에게 관리자 읽기 키를 전달하지 않는다.

| 설정 | 적용 위치·공급 책임 | 아직 필요한 실행 증거 |
| --- | --- | --- |
| `BETA_TRACKING_WEB_APP_URL` | 위 `/exec` URL 인계 및 관리자 GET 응답 확인 완료. 고객 BFF 환경에는 미적용 | 원격 배포 버전·실행자·접근 정책 확인, 실제 서명 연결 검증 |
| `BETA_EVENT_WRITE_SECRET` | 고객 서버 환경과 Apps Script에 같은 전용 쓰기 키 공급 | 양쪽 등록 여부만 확인. 32~256자, 다른 두 읽기 키와 분리 |
| `BETA_AGGREGATE_READ_SECRET` | 관리자 서버와 Apps Script에만 공급 | 내부 읽기 경계 적용 여부 |
| `BETA_PUBLIC_AGGREGATE_READ_SECRET` | 관리자 공개 집계 서버와 Apps Script에만 공급 | 공개 읽기 경계 적용 여부. 공급이 공개 개시를 뜻하지 않음 |
| `BETA_TRACKING_CONTEXT_ID`, `BETA_RUN_ID`, `BETA_DATASET`, `BETA_START_AT` | 고객·관리자 연결 담당이 같은 적용 범위 확인 | 검증용 run/context·`connection_test`와 운영 `beta` 구분. 달력 기간 변경으로 run/context 교체 금지 |
| `BETA_TRACKING_ALLOWED_ORIGINS`, `BETA_TRACKING_MODE` | 고객·서버/인프라 담당 | 승인된 검증 HTTPS Origin과 배포 대상. 현재 코드의 production 모드는 production 런타임·HTTPS Origin·Google `/exec`만 허용 |
| 쓰기·내부 집계·공개·물리 정리 플래그 | 각 운영 책임자 | 실제 적용 시점과 범위. 검증 동안 공개와 물리 정리는 비활성 |

상시 수집과 90일 보관 정책은 확정되어 있다. 실제 시작 시각·트리거·물리 정리 담당·장애 담당의 등록 여부는 운영 실행 항목이다. 관리자 어댑터의 보수적 처리 한도는 원장 5,000행·활성 nonce 1,000개·공개 proof 8KiB·전체 Properties 400KiB다. 실제 규모/실행시간 검증 완료를 의미하지 않는다.

## 서버·인프라 담당 요청

현재 고객 BFF는 Origin/Host/Sec-Fetch-Site, JSON 형식과 4KiB 본문 제한, 엄격한 이벤트 필드, HMAC 서명, 수집기 응답 검증을 수행한다. 그러나 이 경로의 전용 ingress 인증과 호출 빈도 제한은 아직 구현·적용 완료로 확인되지 않았다.

기존 Cloudflare 규칙은 `/api/shinhan` 전용이다. `/api/beta`에 자동 적용된다고 가정하거나 기존 신청 세션·bridge·쿠키를 분석 식별/인증 수단으로 가져오지 않는다. 실제 분석 수집 활성화 전에 다음 사항을 서버·인프라 담당 작업으로 정리한다.

1. 대상 호스트와 정확한 `/api/beta/events` 경로, 검증/운영 배포 범위를 확정한다. 기존 `/api/shinhan` 및 다른 서비스 규칙을 바꾸지 않는다.
2. 정상 ingress와 직접 origin 접근의 구분 방식, 위조/중복 헤더 제거·주입 순서, BFF 검증 위치를 문서화한다. 기존 보안 가드 해제로 연결하지 않는다. 비밀 헤더/원 IP를 분석 원장이나 브라우저 응답에 전달하지 않는다.
3. 요청 제한의 적용 계층, 분류 키·한도·시간창·`429`/`Retry-After` 전달 방식을 정한다. 수치는 서버 담당의 실행안으로 확정하며 임의 승인값을 적지 않는다. 신청 세션을 분석 기록과 연결하지 않는다.
4. 정상 허용 경로, 누락/위조/중복 ingress, 잘못된 Host/Origin, 직접 Vercel 접근, 제한 초과의 바뀐 경계만 검증한다. 거부 요청은 수집기 호출·원장 append가 0회여야 한다.

완료 기준은 **규칙/배포 범위와 제한값의 기록, 고객 BFF 적용 여부, 정상 요청 통과, 거부/제한 요청의 수집기 호출 0회, 비밀값 미노출, 기존 신청 경계 보존**이다. 기존 인증·DB·공통 신청 API 계약의 변경 요청은 현재 없다. 필요성이 생기면 서버 담당 요청으로 추가하고 고객 측에서 임의 변경하지 않는다.

## 최소 실제 연결 검증안 — 제안·미실행

이 절은 아직 실행 승인된 시험 기록이 아니다. 관리자 연결 작업의 승인 범위를 존중하되, 실제 이벤트를 보내기 전에는 **아래 대상·상한·예상 신규 행 수가 실행 범위로 확정됐는지** 확인한다. 이미 확정된 운영 정책을 다시 묻는 과정은 아니다.

### 실행 전 채울 항목

- 승인된 검증용 HTTPS 고객 BFF URL/Origin 및 그 배포 버전: 미확인.
- 관리자 Apps Script `/exec` URL: 위 인계 URL 확보. 원격 배포 버전·실행 계정·접근 범위·서명 연결은 확인 대기.
- 검증 전용 고정 run/context와 최초 시작 시각: 적용값 미확인.
- 자료 범위: `dataset=connection_test`, 공개 비활성, 위 고정 베타 탭만 사용.
- 고객 BFF로 보내는 이벤트 POST 상한: **4회**. 예상 신규 원장: **3행, A:Q 51셀**. 기존 행/헤더 변경 0회.
- BFF→Apps Script 서명 요청: 정상4회. 현재 BFF가 REPLAYED_ENVELOPE/SIGNATURE_EXPIRED에 한해 같은 본문을 새 nonce로 1회 더 보낼 수 있어 이론상 최대8회다. 이벤트 ID·원장 신규행 상한은 늘지 않는다. 두 계층의 실제 요청 수를 구분해 기록한다.
- 별도 집계 작업: **수동 내부 집계 갱신 1회, 내부 집계 조회 1회**. 공개 게시·이력 초기화·삭제 0회.
- 실행/확인 담당 및 실제 요청·행 수를 기록할 위치: 연결 담당 확인 필요.

### 시험 순서와 예상값

1. 읽기로 문서/탭/헤더·검증 scope·기존 행 수를 확인한다. 대상 불일치나 운영 scope 혼합이 있으면 쓰기 전에 중단한다.
2. 실제 신청과 무관한 합성 브라우저 UUID·시도 UUID·이벤트 UUID를 준비한다. 승인된 UTM 조합 하나를 사용한다. 예산·주소·전화·신청 ID·세션·전체 URL은 만들거나 넣지 않는다.
3. 한 `HOST_ESTIMATE` 시도에 `landing_view → beta_mission_start → beta_mission_complete`를 각 1회 보낸다. 역할은 host, 완료 근거는 `simulation`이다. 같은 시도의 식별자/UTM을 유지한다. **예상 accepted 3회, 신규3행.**
4. 완료 이벤트의 같은 event ID·본문·occurred_at을 한 번 더 보낸다. 서버간 서명 nonce만 새로 만든다. **예상 duplicate 1회, 추가 행0.** 최초 received_at과 canonical event ID를 유지한다.
5. 내부 집계를 한 번 갱신하고 한 번 조회한다. 이 검증 run/dataset의 **예상 E1/S1/C1, 합성 브라우저1, 미완료0, 24시간 중단0**을 확인한다. 별도 `beta` 운영 집계와 공개 숫자를 변경하지 않는다.
6. 실제 전송 수·accepted/duplicate·원장 증가·집계 관찰 시각·오류를 기록한다. 이 계획의 합성 이벤트가 고객 행동 측정 결과인 것처럼 보고하지 않는다.

전송은 4회 상한의 명시적 요청으로 수행하며 브라우저 자동 재시도로 건수를 늘리지 않는다. 중간 실패·응답 유실이 생기면 다음 단계 전송을 멈추고 동일 ID의 수락 여부를 확인한다. 새로운 ID로 우회하거나 자동 추가 요청/삭제를 실행하지 않는다. 고객 BFF의 수집기 제한 시간은 1.2초이므로 Apps Script cold start·응답 지연과 이미 저장된 이벤트의 재조회/중복 판단도 실제 결과에 구분하여 기록한다.

시험 뒤 합성 행을 자동 삭제하지 않는다. 대상 UUID·최초 received_at과 실제 행 수를 남기고 후속 정리 지시가 있을 때 해당 범위만 다룬다. 트리거·공개 수집·운영 배포·main 병합/push는 이 최소 검증안의 실행 항목이 아니다.

## 다음 진행 순서

고객 구현은 f45192049300d6a33af588c3389bd05062966900으로 커밋했고, 남은 HOST_ESTIMATE도 기존 주소 검색부터 로컬 합성 결과 표시·중복 제외까지 확인했다. 관리자 채팅의 Apps Script 연결 결과를 받아 위 적용값/담당 목록을 갱신한다. `/api/beta` ingress·요청 제한 요청은 서버 담당에게 전달할 수 있도록 위에 구체화했다. 승인된 검증 대상과 건수가 구체화된 뒤에만 위 제한된 분석 연결 검증을 실행한다. 동결 계약·합성 예시와 이미 통과한 테스트를 변경 없이 다시 작성하거나 반복하지 않는다.
