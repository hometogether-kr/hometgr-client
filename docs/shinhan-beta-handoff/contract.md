# 홈투게더 × 신한 베타 공통 계약 초안

- 계약/이벤트 schema 버전: `0.1.0-draft.3`
- 집계 정의 버전: `shinhan_beta_metrics_draft_v2`
- 작성: 2026-10-27 Asia/Seoul. 소유: 고객 대화창.
- 상태: **관리자 재검토용 초안. 기술 계약 합의와 앱 구현/운영 승인은 별개.**
- 고객 기준: `codex/shinhan-beta-tracking`, `9f314521e444da9b0e63efeb2d80fcea1a89da8b`.
- 이 문서와 fixtures는 계약 검토 자료다. 실제 이벤트 전송·시트 저장·배포를 실행하지 않았다.
- 모든 수치 예시는 합성 데이터다. 실제 고객, 사람 수, 신청 수, 사용량 또는 성과가 아니다.

## 1. 확정 범위와 기술 규약의 경계

### 사용자 확정

기존 /shinhan 화면의 모든 유입을 일반 방문으로 기록한다. 별도 베타 전용 링크나 참여자 구분을 만들지 않는다. 기존 UTM은 출처 구분에만 사용한다. 종료일 없는 상시 수집이며 실제 수집·공개 시작은 별도 실행 정보다.

기존 화면·입력·신청·이동·결과 흐름에 진입·시작·완료 기록만 추가한다. 시작은 첫 유효 입력·선택이며 CTA 클릭·화면 표시·자동 기본값을 시작으로 세지 않는다. 진입 이벤트명 landing_view는 기존 의미를 재사용한다.

| 흐름 | 완료 조건 |
| --- | --- |
| HOST_ESTIMATE | 기존 예상 월세 결과 표시 |
| HOST_REGISTRATION | 기존 방 등록 완료 화면 표시 |
| GUEST_BUDGET | 선택한 기존 흐름의 결과·완료와 기존 걱정 안내 확인 |
| GUEST_DEMAND | 선택한 기존 흐름의 결과·완료와 기존 걱정 안내 확인 |

자기 역할의 두 흐름을 모두 수행할 필요는 없다. 호스트의 걱정·소개서·알림 신청은 완료 조건이 아니다. 시작 후 24시간 이상 미완료는 분석상 중단이다. 새 가상 체험 모드·안내 연결·확인 버튼·안내문·고객 동선을 추가하지 않는다.

| 운영 항목 | 사용자 확정 |
| --- | --- |
| 새로고침·결과 재조회 | 진입·시작·완료 중복 증가 없음 |
| 진행 중 이어하기 | 기존 시도 유지. 24시간 경과만으로 새 시도 생성 없음 |
| 완료 후 실제 재체험 | 새 시도. 이전 완료 표식을 이어 붙이지 않음 |
| 원장 보관 | 개별 기록의 최초 수집부터 90일. 중복 전송으로 연장 없음 |
| 브라우저 분석 상태 | 이번 분석용 출처·시도 등 상태 최대 90일. 공용 식별자/다른 고객 저장소 임의 삭제 없음 |
| 미전송 기록 | 최초 발생부터 최대 7일. 재시도로 연장 없음 |
| 기본 집계 기간 | 한국시간 오늘 포함 최근 달력 30일. 오늘은 as_of까지의 부분 집계 |
| 내부 집계 | 5분 갱신. as_of에서 15분 초과 시 오래됨 |
| 공개 집계 | KST 매일 09시 갱신. as_of에서 36시간 초과 시 오래됨 |
| 공개 소수 보호 | 서로 다른 브라우저 1~4개가 뒷받침하는 수치와 관련 비율·합계·행 간/시점 간 역산 가능한 값 보호. 숨긴 값을 0으로 표시하지 않음 |

익명 기록을 신청 정보와 연결하지 않는다. 전화·주소·예산·자산·신청 원문·신청 ID·신청 멱등키·세션·쿠키·비밀값·전체 URL/referrer·기기 지문·원 IP를 기록하지 않는다. 대응표도 만들지 않는다. 기록 실패로 고객 행동을 막지 않는다.

고객은 계측·UTM·중복 처리·분석 전용 BFF 및 공통 계약을 소유한다. 관리자는 단일 수집기·집계 연결과 대시보드를 소유한다. 고객이 Apps Script를 중복 작성하거나 상대 저장소를 수정하지 않는다.

### 이번 기술 규약과 실제 실행 정보

위 표는 사용자 확정 정책이다. 아래의 정확한 이벤트명·DTO·시도 관찰 바인딩·시간 경계·서명·큐 개수·공개 보호의 충분조건은 이 정책을 구현하기 위한 **draft.3 기술 검토안**이다. 관리자와 동일 버전으로 검토·고정해도 앱 개발 재개나 운영 연결 승인이 되지 않는다.

미정인 것은 수집/공개 시작 시점, 운영 계정·키·정리/장애 담당, 검증 대상·요청/신규 행 건수 및 배포 대상이라는 실행 정보다. 이미 확정한 참여 범위·기간·보관·갱신 정책을 다시 미정으로 묻지 않는다. 수집·공개는 실제 활성화 지시 전 비활성을 유지한다. beta=1 같은 링크나 임의 30분 세션 기준을 추가하지 않는다.

## 2. 브라우저 → 고객 BFF

후보 경로: `POST /api/beta/events`. 기존 /api/shinhan 신청 allowlist와 /api/marketing/attribution 계약은 그대로 둔다.

요청:
```json
{
  "context_id": "synthetic-context-v1",
  "event": {
    "schema_version": "0.1.0-draft.3",
    "event_id": "00000000-0000-4000-8000-000000001001",
    "attempt_id": "00000000-0000-4000-8000-000000000101",
    "anonymous_id": "00000000-0000-4000-8000-000000000001",
    "event_name": "landing_view",
    "role": "unselected",
    "occurred_at": "2026-10-25T15:00:00.000Z",
    "utm_source": "apartment",
    "utm_medium": "qr",
    "utm_campaign": "host_acq_2026q4",
    "utm_content": "ad_01",
    "flow_id": "",
    "completion_basis": ""
  }
}
```

이 예시는 합성이다. context_id는 모든 방문 브라우저가 공유하는 **공개 설정 버전**이며 개인/탭/세션 ID나 비밀값이 아니다. 서버가 활성 context에 run·dataset·mission을 매핑한다. run_id는 상시 수집의 배포/자료 범위를 식별하며 날짜·최근 30일 구간·재방문마다 회전하지 않는다. context는 schema/수집 모드/정책 등 매핑 의미가 바뀔 때 변경하고, 큐의 이전 context를 새 run으로 재라벨링하지 않는다. 최근 30일의 날짜가 바뀌는 것만으로 context를 바꾸지 않는다. context 제공은 얇은 서버 구성에서 직렬화 가능한 값만 전달한다.

기존 경로·탭·필드의 beta 명칭과 dataset=beta는 호환을 위한 운영 자료 코드다. 모든 일반 방문 수집을 뜻하며 베타 참여자 분류가 아니다. connection_test는 합성 검증 자료로 운영 beta와 엄격히 분리한다.

- 외부 입력은 Zod strict 검증. 필수 키 누락, 여분 키, 비승인 코드/UTM 조합은 거부한다.
- 브라우저는 run_id·dataset·mission_id·received_at을 보내지 않는다. 임의 추가하면 거부한다.
- UUID는 무작위 v4, 시각은 밀리초 포함 UTC ISO 문자열. 빈 값은 JSON null/키 누락 대신 `""`로 통일한다.
- event_name은 landing_view / beta_mission_start / beta_mission_complete.
- start/complete는 host 또는 guest 및 해당 네 flow 중 하나가 필수. role/flow 짝을 검증한다.
- landing_view는 unselected + 빈 flow 또는 이미 선택된 역할/flow를 허용한다. 첫 start가 미선택 entry의 분석상 역할/flow를 고정한다. 원본 entry 행은 수정하지 않는다.
- complete만 completion_basis가 필요하다. 검증 context는 simulation, 운영 beta는 saved_response만 허용한다. 나머지 이벤트는 빈 값이다.
- saved_response는 브라우저가 검증된 저장 결과 화면을 관찰했다는 뜻이며, 독립 서버 접수 증명이나 신청 건수가 아니다.
- 요청 최대 4 KiB, application/json, 정확한 같은 Origin/Host·HTTPS(로컬 예외 명시)·Fetch Metadata 검증 제안. fetch는 credentials: omit으로 분석 경계에 신청 쿠키를 보내지 않는다. BFF도 쿠키를 읽거나 upstream으로 전달하지 않는다.
- 수집기 주소/키는 서버 전용. Origin 검사는 참가자 신원 인증이나 봇 방지를 보장하지 않는다.
- 현재 Cloudflare ingress는 /api/shinhan 경계를 위한 것이다. 새 /api/beta 경로에 자동 적용된다고 가정하지 않는다. 운영 보호/요청 제한은 인프라·서버 담당과 확인 후 활성화한다. 기존 가드를 해제하지 않는다.

## 3. 원장 17열과 소유권

기존 베타_사용기록 A:Q 열 순서를 유지한다. 빈 셀은 빈 문자열. 헤더/탭 불일치 시 쓰기를 중단한다. 기존 접수 탭·추가 attempts/aggregate 탭에 쓰지 않는다.

| 순서 | 열 | 값/생성 책임 |
| --- | --- | --- |
| 1 | schema_version | 브라우저 고정 리터럴, BFF/수집기 같은 버전 검증 |
| 2 | run_id | BFF 서버 설정. 브라우저 입력 불가 |
| 3 | dataset | BFF 서버 설정 beta 또는 connection_test |
| 4 | mission_id | BFF 고정 shinhan_existing_flow_mission_v1 |
| 5 | event_id | 브라우저 이벤트 UUID, 재전송 불변 |
| 6 | attempt_id | 신청과 무관한 브라우저 시도 UUID |
| 7 | anonymous_id | 기존 hometogether:marketing:anonymous-id의 검증된 UUID |
| 8 | event_name | 브라우저 관찰한 세 코드 중 하나 |
| 9 | role | 브라우저 unselected/host/guest, 시도 결합 검증 |
| 10 | occurred_at | 브라우저 최초 관찰 시각, 재전송 불변 |
| 11 | received_at | 수집기 최초 원장 수락 UTC 시각, 중복 때 유지 |
| 12 | utm_source | 시도 진입 시 snapshot |
| 13 | utm_medium | 같은 snapshot |
| 14 | utm_campaign | 같은 snapshot |
| 15 | utm_content | 같은 snapshot |
| 16 | flow_id | 네 고정 흐름 또는 미선택 진입의 빈 값 |
| 17 | completion_basis | complete에서만 simulation/saved_response |

BFF→수집기 업무 payload는 위 17열 중 received_at을 제외한 16필드다. 수집기는 서버간 인증 뒤 run/dataset/mission 허용 조합을 다시 검증한다. 요청으로 spreadsheet ID·탭·범위·수식·외부 URL을 받지 않는다.

## 4. 시도·완료·중복과 보관

### 4.1 시도와 관찰 바인딩

집계 단위는 사람/접수 대신 흐름별 시도다. 같은 origin·브라우저·run·mission·dataset·flow에서 **진행 중인 시도**는 새로고침·다른 탭·재유입·이어하기에 재사용한다. 다른 flow는 별도 시도다. 완료한 흐름을 실제로 다시 체험하면 새 attempt를 만든다. 결과 재표시·새로고침·재조회만으로 새 attempt를 만들지 않는다. 24시간 중단은 분석 분류이며 시도 삭제/리셋 규칙이 아니다.

첫 /shinhan의 미선택 entry를 첫 유효 start 흐름에 연결한다. 다른 흐름은 별도 entry를 갖는다. 최초 진입과 기존 진행 중 시도 재사용에는 이전 관찰 규칙을 유지한다. **완료 후 재체험**의 새로운 entry/start는 기존 입력 화면에 다시 진입/전환한 뒤 첫 유효 입력·선택이 실제로 발생할 때 함께 할당하고 entry부터 전송한다. 단순 폼 표시·CTA·기본값은 재체험을 시작하지 않는다. 분석을 위한 새 고객 UI는 없다.

기술 관찰 바인딩:

1. 기존 폼이 새 입력을 받을 수 있는 상태로 진입/전환할 때 해당 flow의 현재 attempt를 메모리에 고정한다. 진행 중이면 그 시도에 묶는다. 완료 상태이면 그 완료 attempt를 재체험 후보의 predecessor로만 캡처한다.
2. 후보의 첫 유효 입력에서 origin 단위 Web Lock을 잡고 localStorage를 다시 읽는다. predecessor가 여전히 현재 완료 시도이면 새 attempt·새 entry/start를 한 번만 만들고 결과/안내 표식은 false로 시작한다.
3. 같은 predecessor로 시작한 다른 탭이 이미 새 진행 중 시도를 만들었다면 그 시도에 합류한다. 그 다음 시도까지 이미 완료됐다면 오래된 후보만으로 또 새 시도를 만들지 않는다. 새 입력 화면 진입/전환 관찰이 필요하다.
4. 완료 전에 열린 기존 폼 탭이 다른 탭의 완료를 뒤늦게 알게 된 경우 자동으로 재체험 후보가 되지 않는다. 이전 바인딩에 남고 새 시도를 만들지 않는다.
5. 결과/걱정 안내 observer도 그 입력 흐름의 메모리 attempt 바인딩을 유지한다. 현재 공유 저장소의 최신 attempt로 과거 결과를 재해석하지 않는다. 안전하게 결합할 수 없는 결과는 계측을 생략한다.
6. 이 바인딩은 고정 flow와 분석 attempt UUID만 사용한다. 신청 ID·draftGeneration·신청 멱등키·세션·입력값을 키나 대응표에 넣지 않는다. 페이지 생명주기 안의 메모리 연결이며 요청/17열에 새 필드를 넣지 않는다.

공유 UUID 생성·시도 생성·단계 ID/시각 할당·큐 갱신은 origin 단위 Web Lock 안에서 저장소를 다시 읽어 처리한다. Web Lock 또는 안정 저장소가 없으면 임의 ID 반복 발급이나 개인정보 대체 식별 없이 계측을 생략한다. 다른 기기·origin을 병합하지 않는다.

다른 flow 두 탭이 미선택 entry를 동시에 claim하면 먼저 잠금을 얻은 flow가 기존 entry를 결합한다. 두 번째는 잠금 후 자기 flow의 기존 진행 중 시도를 재사용하거나 별도 entry/start를 만든다. 두 flow·두 attempt·E2/S2이며 원본 미선택 entry는 수정하지 않는다. resultSeen/guideSeen은 attempt별로 저장하고 다른 시도에 복사하지 않는다.

### 4.2 완료 관찰

- HOST_ESTIMATE: 실제 saved application의 result 분기가 표시된 후.
- HOST_REGISTRATION: 실제 saved application의 complete 분기가 표시된 후.
- 게스트: 같은 시도의 resultSeen과 기존 guide 단계 안내 카드가 1개 이상 표시된 후. 걱정 선택 단계 또는 '선택한 걱정이 없어요' 빈 상태만 표시하면 미완료. 기존 '전체 확인 사항 보기'로 카드가 표시되면 충족한다. 표시 관찰은 읽기/이해를 증명하지 않는다.
- 기존 다음 버튼·프로필·알림 동작을 완료 필수 조건으로 추가하지 않는다.
- 개발용 example/followup을 운영 완료로 세지 않는다. 새로고침으로 신청 상태가 없어져도 분석 때문에 복원 API/신청을 만들지 않는다.
- 기록 도입 전 결과·만료된 시도·누락된 선행 기록에 가짜 entry/start를 소급 생성하지 않는다.

### 4.3 유일성과 실패

1. 전송키는 (run_id, dataset, event_id). 보관 중인 canonical 원장 행의 동일 키·동일 정규화 16필드는 duplicate, 하나라도 다르면 EVENT_ID_CONFLICT.
2. 의미키는 (run_id, dataset, mission_id, attempt_id, event_name). 다른 event_id라도 나머지 16필드 중 event_id 제외 값이 같으면 duplicate. 시각/역할/출처/flow 등이 다르면 SEMANTIC_CONFLICT. 최초 행/received_at을 변경하지 않는다. append=0인 별칭 request_event_id는 별도 원장에 저장하지 않으며 그 ID의 영속 충돌을 보장하지 않는다. 브라우저는 ID를 다른 사건에 재사용하지 않는다.
3. 시도 anonymous_id/UTM/mission은 entry에 고정한다. unselected entry→첫 start 역할/flow 결합만 예외이며 원장은 불변. start/complete의 역할/flow는 같아야 한다.
4. entry→start→complete 순서다. 선행 없음은 MISSING_PREDECESSOR, 다른 흐름·브라우저 결합은 ATTEMPT_CONFLICT. 선행이 브라우저에서 영구 실패·유실·만료됐으면 후행도 전송 종료한다.
5. 단일 writer가 lock+원장 검증/append를 담당한다. 캐시만으로 중복을 판단하지 않는다. append 뒤 snapshot 실패는 accepted+dirty이며 원장 재조회로 복구한다. 모든 장애에서 exactly-once를 보장한다고 주장하지 않는다.
6. canonical 충돌/중복 보장은 원장 보관 기간 안의 행에 한정한다. 90일 뒤 삭제된 ID를 영구 기억하는 저장소를 추가하지 않는다. 정직한 브라우저는 최초 발생+7일 이후 같은 이벤트를 전송하지 않으며, 만료 이벤트를 새 ID로 재생성하지 않는다.

### 4.4 고정 만료와 큐

90일=7776000000ms, 7일=604800000ms. 다음은 사용자 최대 보관 정책을 적용하는 **기술 기산점/경계**다.

- 원장: 행별 최초 received_at+90일에서 만료한다. now>=expires_at이면 집계·중복 판단의 유효 원본으로 사용하지 않으며 만료 정리 대상이다. duplicate/재집계/조회로 기한을 연장하지 않는다. 물리 정리의 담당·배포 스케줄은 실제 운영 실행 정보다.
- 이번 분석이 추가한 시도/완료/전송종료 표식: 최초 생성 시각+90일을 고정한다. 접근·재방문·재시도로 다시 90일을 부여하지 않는다. 만료된 표식을 후행 이벤트나 가짜 선행 생성에 사용하지 않는다.
- 최초/최근 외부 출처: 한 분석 상태 묶음의 최초 created_at+90일을 고정한다. 유효한 새 외부 출처B는 latest만 갱신하며 기존 first와 만료시각을 늘리지 않는다. 내부 이동·직접 재방문·단순 읽기도 연장하지 않는다. 만료 시 first/latest를 함께 제거하며, 이후 실제로 관찰한 유효 외부 출처만 새 상태의 first/latest가 될 수 있다. 만료된 기억을 직접 방문에서 복원하지 않는다.
- 미전송 이벤트: 최초 occurred_at/동시에 기록한 생성 시각+7일에서 종료한다. now>=expires_at이면 삭제/전송 종료하고 같은 ID나 새 ID로 되살리지 않는다. 서버 시간 계산은 계속 received_at 기준이며 브라우저 occurred_at은 신뢰 가능한 실제 행동 시각의 증명이 아니다.
- 기존 공유 hometogether:marketing:anonymous-id 자체의 수명을 이번 정책으로 변경·삭제·회전하지 않는다. 이번 분석이 보관한 사본·연결 상태만 책임 범위와 고정 기한을 갖는다.
- 선행 실패/유실/만료의 terminal 표식은 해당 시도의 원래 90일 만료 안에서만 유지한다. 만료된 과거 폼/결과 observer는 이전 바인딩을 재사용하지 않는다. 이후 실제 새 입력 화면의 새 관찰은 새 시도일 수 있으나 과거 결과를 복원하지 않는다.

큐의 개수/전송 기법은 사용자 정책과 구분하는 기술값이다: 최소 필드 최대 30개, 한 회차 최대 5회(0/1/3/10/30초+jitter), timeout 1.5초. online/방문에서 새 회차를 재개해도 최초 7일 TTL은 고정한다. 큐 한도·실패·만료로 선행을 잃으면 후행도 중단한다. permanent 오류는 새 ID로 우회하지 않는다. 고객 행동은 네트워크를 기다리지 않는다.

## 5. 수집 응답·오류

이 절의 no-store, accepted=201/duplicate=200 및 오류 HTTP 표는 **고객/관리자 BFF→브라우저** 응답 의무다. 수집기는 JSON 업무 결과를 반환하고 BFF가 상태/헤더를 정규화한다. Apps Script의 HTTP 200이나 redirect만으로 수락으로 보지 않는다.

성공 공통 형태:
```json
{
  "ok": true,
  "contract_version": "0.1.0-draft.3",
  "data": {
    "status": "accepted",
    "request_event_id": "00000000-0000-4000-8000-000000001001",
    "event_id": "00000000-0000-4000-8000-000000001001",
    "received_at": "2026-10-25T15:00:00.000Z",
    "projection_state": "current"
  }
}
```
accepted=201, duplicate=200. duplicate의 event_id/received_at은 원장의 최초 값, request_event_id는 이번 요청값이다. projection_state는 current|dirty. dirty도 기록은 수락됐으므로 새 이벤트를 만들지 않는다.

오류 공통 형태:
```json
{"ok":false,"contract_version":"0.1.0-draft.3","error":{"code":"MISSING_PREDECESSOR","retryable":true,"retry_after_ms":1000}}
```

| HTTP | code | 처리 |
| --- | --- | --- |
| 400 | INVALID_JSON | 재시도 불가 |
| 403 | ORIGIN_REJECTED / SIGNATURE_REJECTED | 재시도 불가; 서명 원문/비밀값 노출 금지 |
| 404 | TRACKING_DISABLED | 수집 비활성, 재시도 불가 |
| 409 | CONTEXT_MISMATCH / EVENT_ID_CONFLICT / SEMANTIC_CONFLICT / ATTEMPT_CONFLICT | 재시도 불가; 새 ID로 우회 금지 |
| 409 | MISSING_PREDECESSOR | 선행 이벤트부터 같은 ID로 재시도 |
| 409 | REPLAYED_ENVELOPE / SIGNATURE_EXPIRED | 서버만 새 envelope로 제한 재시도 |
| 413 | PAYLOAD_TOO_LARGE | 재시도 불가 |
| 415 | UNSUPPORTED_MEDIA_TYPE | 재시도 불가 |
| 422 | INVALID_EVENT / UNSUPPORTED_VERSION | 재시도 불가 |
| 429 | RATE_LIMITED | retry_after_ms 및 제한 재시도 |
| 503 | COLLECTOR_UNAVAILABLE / INGRESS_UNAVAILABLE | 제한 재시도 |
| 503 | AGGREGATE_UNAVAILABLE | 집계 실패; 0건으로 치환 금지 |

retry_after_ms는 재시도 가능 시 0..60000 정수 또는 null, 불가 시 null. 코드만 고정 노출하고 입력값·본문·URL·스택·서명·upstream 로그인 HTML은 반환/로그하지 않는다. Apps Script의 HTTP 상태 표현 제약이 있으면 JSON body를 기준으로 고객/관리자 BFF가 위 상태로 정규화한다.

## 6. BFF ↔ 관리자 소유 수집기 서명 초안

세 고정 action: record_event / get_admin_aggregates / get_public_aggregates. dashboard.md의 세 권한 분리를 사용하며 tracking.md의 과거 2동작 제안을 구체화한다. 각 action의 전용 키를 사용한다. 사용자/신청/bridge 키와 분리한다.

envelope는 JSON object이며 Apps Script e.postData.contents에서 읽는다:
```text
contract_version: "0.1.0-draft.3"
action: 고정 action
timestamp: UTC Unix 초의 10진 정수 문자열
nonce: 새 UUID v4
payload_json: 업무 payload의 compact JSON 문자열
signature: 아래 HMAC의 소문자 hex 64자
```

서명 바이트는 UTF-8의 다음 문자열이다(구분자는 LF 0x0a, 마지막 줄바꿈 없음):
```text
contract_version + "\n" + action + "\n" + timestamp + "\n" + nonce + "\n" + payload_json
```

HMAC-SHA256(key의 UTF-8 바이트, 위 바이트). payload_json은 서명 당시 문자열 그대로 검증하고 재직렬화한 문자열을 검증하지 않는다. 서명 검사 후 JSON parse/strict 검증. 필드 순서가 다른 요청도 원래 문자열로 검증 가능하다. 비교는 고정 길이 상수 시간 비교. fixture에 정확한 payload_json, signing_input_utf8, 예상 hex를 제공한다.

- 허용 시계 오차 ±300초(양끝 포함), (action, nonce) 재사용 차단 제안. nonce는 server_now_seconds > signed_timestamp + 300이 된 뒤에만 삭제할 수 있다. 최초 수신 T에 timestamp=T+300이면 T+600에도 서명이 유효하므로 정확히 600초 후 삭제하지 않는다(보수적 최초 수락 후 601초 보관 가능). nonce 검사는 인증 후 잠금 경계에서 원자적으로 기록/조회하며 Cache만으로 보장하지 않는다. 기록 실패·용량 초과 시 보호를 생략하지 않고 요청을 거부한다. 저장소 할당량/정리는 관리자 구현 검토 대상이다.
- retry는 새 timestamp/nonce/signature, 같은 이벤트 payload를 사용한다.
- envelope 최대 8 KiB 제안, 임의 추가 키 불허.
- 허용 배포 /exec 주소와 예상 Google 응답 redirect만 서버에서 처리한다. HTML 로그인/잘못된 JSON/비승인 redirect는 오류다.
- HTTP header가 Apps Script에 그대로 전달된다고 가정하지 않는다. 키 자체는 envelope/URL/행에 넣지 않는다.
- fixture 키는 공개 합성 test vector 문자열이다. 실제 credential이 아니며 운영 설정에 사용하지 않는다.

## 7. UTM 계약

최초·최근 외부 출처를 보존한다. 내부 이동·직접 재방문·역할 변경은 덮어쓰지 않는다. 원본 전체 URL/referrer는 저장하지 않고 로컬 메모리에서 승인 태그/외부 여부 판단에 필요한 부분만 해석한다.

utm_links.md의 확정 조합만 유지한다:

| source | medium | campaign | content |
| --- | --- | --- | --- |
| apartment | qr | host_acq_2026q4 | ad_01 |
| kakao | social | host_acq_2026q4 | host |
| everytime | referral | guest_acq_2026q4 | seoultech |
| everytime | referral | guest_acq_2026q4 | union |
| instagram | social | guest_acq_2026q4 | profile |
| kakao | social | guest_acq_2026q4 | guest |

구글/네이버 자연검색 분류는 google|naver / organic / 빈 campaign / 빈 content라는 기존 기획을 유지한다. 배포 UTM 링크를 만들지 않는다. 자동 판별은 현재 미구현이다. 실제 외부 검색 referrer hostname을 검증할 수 있을 때만 도출하는 방법을 별도 검토하며 숨겨진 referrer를 추정하지 않는다. 현재 fixtures는 자동 분류 구현을 주장하지 않는다.

승인 외/개인정보 가능 태그는 원문 저장하지 않는다. 새 유효 출처가 없으면 기존 최초/최근를 유지하고, 출처 자체가 없으면 네 필드를 모두 빈 값으로 보낸다. source=beta/direct/unknown 등 값을 광고 태그에 임의 삽입하지 않는다. 조합 전체로 검증하여 허용값을 섞은 잘못된 조합도 거부한다.

시도 entry 당시 최근 유효 외부 출처 snapshot을 entry/start/complete에 고정한다. 이후 외부 B 유입은 공통 최근만 B로 바꾸고 기존 시도 A 귀속은 유지한다. 만료 전 최초 출처는 지우지 않는다. 새 흐름 또는 완료 후 새 체험은 그때 최신 유효 출처를 새 시도에 고정한다. 브라우저/기기/서브도메인 간 ID/출처 연결은 하지 않는다. 출처 상태 최대90일의 고정 만료는 §4.4를 따른다.

기존 코드의 source 분류와 UTM source는 별개다. 현재 kakao-attribution 전송은 전체 URL·세션을 포함하므로 베타에서 호출하지 않는다. 같은 UUID 키를 재사용하되 기존 값도 UUID 검증한다.

## 8. 집계 정의

사용자 운영 정책에 대응하는 기술 정의 버전은 shinhan_beta_metrics_draft_v2다. 단위·분모·첫 received_at·늦은 완료 연결은 이전 기술 합의를 유지하고, 재체험과 이동하는 30일 기간을 반영한다.

- UTC 저장, 표시/일 경계 Asia/Seoul. 기간 정책 이름 kst_calendar_30d_v1은 definition_v2에 고정하며 DTO에 새 필드를 추가하지 않는다.
- as_of가 속한 KST 날짜를 D라 하면 period.from=D-29일 00:00 KST, period.until=D+1일 00:00 KST. timezone=Asia/Seoul. 오늘 포함 달력 30일이며 정확히 720시간 이동 구간이 아니다.
- 기간은 entry.received_at의 [from, until). from 포함, until 제외. 추가로 received_at<=as_of인 entry/start/complete만 관찰한다. 오늘은 as_of까지의 부분 집계다.
- 같은 cohort의 이후 start/complete를 as_of까지 연결한다. 일자가 바뀌어도 시도의 entry 분모를 옮기지 않는다. 30일 밖 entry에 대한 늦은 완료는 현재 cohort에 소급 진입하지 않는다.
- E=중복 제거된 진입 시도, S=E 중 유효 시작, C=S 중 유효 완료. 완료 후 새 체험은 다른 attempt여서 새 E/S/C가 될 수 있다.
- not_started=E-S; incomplete=S-C.
- abandoned_24h=미완료 중 as_of-start.received_at>=24시간. in_progress는 24시간 미만이며 incomplete=in_progress+abandoned_24h.
- 늦은 완료가 as_of에 포함되면 C로 이동하고 현재 미완료/중단에서 제외한다. '과거 한 번이라도 24시간을 넘긴 수'와 다른 지표다.
- 시작률 S/E, 전체 완료율 C/E, 시작 대비 완료율 C/S. 분모0이면 value=null이며 numerator/denominator를 유지한다.
- unit=flow_attempt. anonymous_browsers는 E의 distinct UUID이며 사람 수가 아니다. 한 브라우저가 40회 재체험해도 distinct는 1이다. 그룹별 distinct를 더해 전체 distinct를 만들지 않는다.
- 역할/flow는 as_of 이전 첫 start에서 entry에 결합한다. start가 없으면 entry 역할/flow를 유지한다. 미선택은 별도다.
- 채널 그룹은 entry의 네 UTM tuple. 빈 조합 별도. 새 재체험의 entry는 그때 최신 유효 출처를 고정하며 이전 시도 귀속은 바꾸지 않는다.
- run/dataset/definition을 엄격히 분리한다. connection_test는 운영 beta에 포함하지 않는다. complete는 basis별 합계를 제공한다.
- occurred_at은 브라우저 시계 참고값이며 집계·24시간 판단의 기준이 아니다. 오프라인 지연으로 실제 행동 경과와 차이가 날 수 있다.
- 만료 원본·비정상 선행은 가짜 행으로 보정하지 않는다. 남아 있는 후행만으로 시도를 집계하지 않고 quality에 제외 사실을 표시한다. 원장 수락과 snapshot 성공은 별도다.

## 9. 관리자/공개 집계 요청·응답

### 9.1 운영 조회와 이동 기간

운영 get_admin_aggregates payload는 기존 5필드 strict object만 받는다:
```json
{"contract_version":"0.1.0-draft.3","run_id":"synthetic-run-v1","dataset":"connection_test","definition_version":"shinhan_beta_metrics_draft_v2","view":"latest"}
```
run/dataset은 합성 예시다. 운영 서버가 설정된 상시 scope의 최신 snapshot 하나를 조회하고, snapshot 계산 시각 as_of로 §8의 실제 period를 결정한다. 임의 날짜·과거시각·교차필터 UI를 추가하지 않는다. fixtures/aggregate-query.synthetic.json의 period/as_of는 순수 계산 입력이며 운영 RPC에 보내지 않는다.

- 지원하지 않는 version/run/dataset/definition/view 또는 period/as_of 등 여분 필드: BFF HTTP422 / UNSUPPORTED_AGGREGATE_QUERY / retryable=false / retry_after_ms=null.
- 지원 scope이지만 수집 연결 자체가 없으면 ok=true, data={status:"not_connected",totals:null}.
- 연결된 scope에 유효 snapshot/fallback이 없으면 HTTP503 / AGGREGATE_UNAVAILABLE / retryable=true. 0건을 만들지 않는다.
- snapshot은 요청과 같은 run/dataset/definition이고, 자신의 period가 calendar30(as_of)와 정확히 맞아야 한다. as_of<=generated_at<=evaluated_at이며 미래/역전/다른 기간 정책은 거부한다.
- 날짜가 바뀌면 최신 정상 snapshot의 period가 현재 기대 기간과 달라도 같은 scope/definition/기간 정책의 **과거 snapshot**을 fallback으로 제공할 수 있다. 실제 period/as_of/generated_at/값을 그대로 내리고 period_behind로 오래됨을 표시한다. 이전 숫자에 오늘의 기간이나 현재 조회 시각을 붙이지 않는다.
- 미래 period, 다른 run/dataset/definition 또는 임의 기간 snapshot은 fallback이 아니다. 마지막 정상값이 없으면 실패다.
- 조회는 원장 쓰기·신청·worker 실행·전체 재계산을 유발하지 않는다. 별도 내부 5분 갱신 작업이 이벤트가 없는 동안에도 24시간 상태를 갱신한다. 5분 주기는 매 조회 요청의 재계산 지시가 아니다.
- 기존 관리자 인증을 유지한다. 브라우저에 수집기 URL/키를 전달하지 않는다.

### 9.2 관리자 응답과 최신성

정상/마지막 정상 응답은 {ok:true,contract_version,data}.
data는 status,run_id,dataset,definition_version,period,as_of,generated_at,unit,observation_basis,abandonment_hours,collection_state,snapshot_state,freshness,totals,by_flow,by_channel,completions_by_basis,quality다. 기존 DTO 필드를 유지한다.

metrics는 entered,started,completed,not_started,incomplete,in_progress,abandoned_24h,anonymous_browsers,rates(분자/분모/value)다. 비율은 0..1 또는 null, 건수는 음수 없는 정수다.

- status=ready|stale. 실제0은 count0와 분모0 비율null이다.
- snapshot_state=current|dirty는 원장 반영 상태이며 시간 최신성과 다르다.
- freshness={status:fresh|stale,evaluated_at:UTC ISO,reasons:배열}. 허용 reason과 고정 순서는 age_exceeded / period_behind / dirty / refresh_failed. fresh면 [], stale면 하나 이상이다.
- 내부는 evaluated_at-as_of>900000ms일 때 age_exceeded. 정확히15분이면 나이만으로 stale이 아니다. generated_at으로 관찰 시각의 나이를 대신 계산하지 않는다.
- snapshot의 period가 evaluated_at의 KST 날짜로 기대되는 calendar30과 다르면 period_behind다. 자정 직후 age<15분이라도 전날 period를 현재 기간처럼 표시하지 않는다.
- dirty/갱신 실패는 나이와 별도의 stale 사유다. 현재 원장 미반영 상태나 시각을 조회 때 조용히 보정하지 않는다.
- 내부 5분 갱신(300000ms)과 최신성 한도15분(900000ms)은 서로 다른 확정값이다.
- collection_state=enabled|disabled|not_connected|synthetic_fixture. quality={status:valid|degraded,rejected_attempts:정수}. 원본/UUID/시트 링크는 응답에 없다.
- snapshot 없는 dirty/조회 실패는 AGGREGATE_UNAVAILABLE이며 정상0과 구별한다.

### 9.3 utm_source별 내부 mapper

내부 by_channel은 네 UTM tuple별 집계를 유지한다. 기본 화면은 같은 utm_source의 entered/completed를 각각 합산한 뒤 completion_from_entry={numerator:합산C,denominator:합산E,value:C/E 또는 null}로 다시 계산한다. mapper 출력은 {utm_source,entered,completed,completion_from_entry}[]다.

tuple 비율 평균이나 anonymous_browsers 합산은 금지한다. source distinct가 필요하면 원장에서 계산하며 화면 계약에 임의 추가하지 않는다. source-mapping 합성 사례의 kakao E3/C1+E1/C1은 E4/C2·0.5다.

### 9.4 공개 요청과 DTO

get_public_aggregates payload는 {contract_version,snapshot_key}만 허용한다. 서버는 key를 승인된 run/dataset/definition/기간 정책·현재 privacy_policy_version에 매핑한다. 날짜마다 임의 key나 필터를 만들지 않는다. 운영 공개는 dataset=beta만 허용하며 connection_test 공개 사례는 로컬 합성 검증 전용이다.

지원하지 않는 key/필드는 공개 BFF에서 일반 AGGREGATE_UNAVAILABLE로 정규화한다. 관리자 DTO를 브라우저에서 감추는 방식 대신 별도 allowlist로 투영한다:
```text
{ok:true,contract_version,data:{
  status:disabled|not_connected|ready|stale|suppressed,
  reason:NOT_ENABLED|POLICY_UNCONFIRMED|NOT_CONNECTED|PRIVACY_POLICY|POLICY_CHANGED|null,
  unit:"flow_attempt",period:Period|null,
  as_of:UTC|null,generated_at:UTC|null,privacy_policy_version:string|null,
  freshness:{status:fresh|stale,evaluated_at:UTC}|null,
  counts:PublicCounts|null,rates:PublicRates|null,by_source:PublicSource[]
}}
Count={status:"visible",value:정수}|{status:"suppressed",value:null}
Rate={status:"visible",numerator:정수,denominator:양수,value:0..1}
    |{status:"not_applicable",numerator:0,denominator:0,value:null}
    |{status:"suppressed",numerator:null,denominator:null,value:null}
PublicCounts={entered:Count,started:Count,completed:Count,incomplete:Count,abandoned_24h:Count}
PublicRates={start:Rate,completion_from_entry:Rate,completion_from_start:Rate}
PublicSource={utm_source:고정source,counts:{entered:Count,completed:Count},rates:{completion_from_entry:Rate}}
```

source의 고정 순서는 apartment/kakao/everytime/instagram/google/naver/빈문자열이다. 빈문자열 UI 표시는 직접/출처 확인 불가다. 실제 snapshot이 있으면 source가0이어도 행을 임의 제거하지 않는다. 새 채널이나 자연검색 자동구현 승인을 뜻하지 않는다.

원본·anonymous/attempt/event ID·고유 브라우저 수·campaign/content tuple·시트 링크·키·내부 quality/오류·계획문서 원문은 공개 DTO에 없다. 상단6칸은 기존 안전한 정적 설명으로 유지한다.

### 9.5 공개 보호의 기술 충분조건

사용자 정책은 서로 다른 브라우저1~4개 보호와 비율·합계·행 간·이전 공개값 역산 방지다. 5개 이상이 자동 공개 가능하다는 뜻이 아니다. draft.3은 이를 만족하기 위한 **보수적인 전체 공개/전체 수치 억제 방식**을 기술안으로 사용하며 관리자 재검토 대상이다.

1. 원장에서 source 단위로 묶은 뒤 총계5종과 source별 E/C를 기본 숫자 열로 삼는다. 비율·분자·분모는 이 숫자들의 함수이므로 함께 판정한다. 같은 브라우저의 반복시도는 그 브라우저의 정수 기여량으로 합쳐 distinct1로 판단한다.
2. 후보 숫자와 **과거 실제로 숫자를 공개한 모든 snapshot의 숫자**를 함께 고려한다. 각 브라우저가 각 숫자에 기여한 정수 벡터를 만들고, 같은 벡터를 가진 브라우저 동치집합을 구성한다. 모든 열에0만 기여한 브라우저는 지지자가 아니므로 보호 계산의 수를 부풀리지 않는다.
3. 0이 아닌 기여가 있는 모든 동치집합에 서로 다른 브라우저가 최소5개인 경우만 이 버전의 공개 충분조건을 통과한다. 해당 열의 단순 지지자수만5인지 또는 직전 한 snapshot 차분만 안전한지 검사하는 것은 부족하다.
4. 어느 집합이1~4개이거나 과거 공개 이력/기여 관계를 충분히 증명할 수 없으면 **전체** counts·rates·by_source의 숫자/분자/분모를 null로 억제한다. source 행 구조는 유지한다. reason=PRIVACY_POLICY, status=suppressed다. 0이나 일부 합계를 남겨 보호값을 역산하게 하지 않는다.
5. 이전 공개값은 회수됐다고 가정하지 않는다. 공개 이력의 브라우저 관계 자료를 분석 상태/원장90일보다 길게 보관하여 증명을 우회하지 않는다. 증명 자료 만료·유실·범위 변경 등으로 충분조건 확인이 안 되면 전체 억제한다. 이 버전은 별도의 무기한 이력 저장소나 새 시트/집계 탭을 승인하지 않는다.
6. 후보의 모든 값이0이라도 이전 공개 이력과의 결합 안전성을 통과해야 visible0를 낸다. 새 범위에 과거 공개 이력이 전혀 없고 이를 확실히 아는 경우, 빈 기여 집합은 실제0로 공개할 수 있다.
7. 증명 과정의 UUID·기여 벡터·집합 크기·내부 사유는 공개하지 않는다. 검증은 매 공개 시점에 수행한다. 하루 한 번 공개만으로 역산 보호를 보장한다고 주장하지 않는다.

이 충분조건의 식별자는 shinhan_public_contribution_guard_v1이다. 많은 항목을 보수적으로 가릴 수 있으며, 공개 이력의 증명 자료가 만료되면 일부 또는 전체 수치의 억제가 장기간 지속될 수 있다. 새 snapshot_key/run/policy 이름으로 과거 공개 이력을 없던 일로 만들거나 무기한 ID 이력을 저장하여 우회하지 않는다. 공개 숫자가 필요하다는 이유로 증명 실패를 무시하거나 보호값을 0으로 치환하지 않는다. 다른 완화 기법은 별도 기술 계약 변경·재검토 대상이다.

### 9.6 공개 상태·주기·정책 변경

| status | 값/메타데이터 |
| --- | --- |
| disabled | 명시적 공개 비활성/개시 전이면 NOT_ENABLED, 유효 정책 부재이면 POLICY_UNCONFIRMED. counts/rates=null,by_source=[],period/as_of/generated_at/privacy_policy_version/freshness=null |
| not_connected | 현재 정책과 공개 설정은 있으나 수집 미연결. NOT_CONNECTED. counts/rates=null,by_source=[],as_of/generated_at/freshness=null. period는 evaluated_at 기준 기대 기간 |
| ready | 보호 충분조건을 통과하고 fresh. 실제0은 visible0, 비율not_applicable |
| stale | 현재 정책에 안전한 마지막 공개값이며 오래됨. 실제 period/as_of/generated_at을 유지 |
| suppressed | 전체 숫자 보호. Count/Rate의 값·분자·분모null. fresh/stale는 freshness로 별도 표현 |
| 조회 실패 | ok=false/AGGREGATE_UNAVAILABLE. data·내부 오류·0건을 내리지 않음 |

명시적 공개 비활성 또는 정책부재 disabled가 최우선이다. snapshot이 있으면 보호 필요→suppressed, 그 외 오래됨→stale, 그 외ready 순이다. 공개에는 내부 freshness 사유 배열을 노출하지 않는다.

- 공개 갱신은 KST 매일09시 한 번이다. snapshot은 실제 계산 as_of의 calendar30 기간을 가진다. 재조회가 원장 재계산·재공개를 유발하지 않는다.
- evaluated_at-as_of>129600000ms일 때 공개 나이 기준 stale. 정확히36시간은 나이만으로 stale이 아니다. 내부15분을 공개에 적용하지 않는다.
- 공개는 매일09시 발행 간격이므로 날짜가 바뀌었다는 이유만으로 period_behind를 적용하지 않는다. 이전 발행 snapshot의 실제 period/as_of를 계속 표시하며 자정에 숫자의 기간/시각을 새것으로 바꾸지 않는다. 공개 freshness는36시간 초과 또는 확인된 갱신 실패/원장 미반영 등으로 판단하고, 공개에는 내부 이유 배열을 내리지 않는다. 내부5분 latest의 period_behind와 구분한다.
- fallback은 동일 snapshot_key·run/dataset/definition/기간 정책·현재 privacy_policy_version을 만족하는 안전한 과거 공개 snapshot에 한정한다. 미래 시각/기간은 금지한다.
- 정책이 바뀌면 옛 정책 숫자를 stale로 재공개하지 않는다. 새 정책의 안전한 snapshot 전에는 suppressed/POLICY_CHANGED로 모든 숫자·분자·분모=null,by_source=[],as_of/generated_at/freshness=null을 반환한다. 정책이 사라졌으면 disabled다.
- 수집과 공개의 실제 시작 시점은 별도다. 정책이 사용자에게 확정됐어도 공개 활성화·배포는 이번 계약 작업에 포함되지 않는다.

## 10. 합성 예시

fixtures의 metadata는 테스트 포장이다. 실제 요청에는 metadata/synthetic/warning을 넣지 않는다.

| 합성 관찰 시각 | E | S | C | 미완료 | 진행 중 | 24h 중단 | 고유 브라우저 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-10-27 12:00 KST | 7 | 6 | 3 | 3 | 1 | 2 | 6 |
| 2026-10-27 13:00 KST | 7 | 6 | 4 | 2 | 1 | 1 | 6 |
| 2026-10-28 00:00 KST | 8 | 6 | 4 | 2 | 1 | 1 | 7 |

12시→13시 차이는 G의 늦은 완료1개다. A/B는 같은 합성 브라우저의 서로 다른 흐름이다. D는12시에 정확히24시간 경계다. H는10월27일KST30일 시작보다1ms 전이며 제외된다. I는10월28일00시까지 미래 사건이라 앞선 두 관찰에서 제외되지만, 자정의 이동한30일 기간/as_of에는 포함되어 E8·미시작2·브라우저7이 된다. J는 다른 run이라 제외한다. 전부 connection_test라 같은범위 beta 계산은 정상0건이다.

기본 원장 합성 행은20개다. duplicate/conflict·재체험6행·공개 기여벡터는 별도 사례이며 기본 원장에 합산하지 않는다. 모든 완료는 simulation. 기간/run은 합성 예시이며 실제 수집 일정이 아니다.

추가 사례는 attempt-retention-cases.synthetic.json(같은 브라우저/flow 재체험·이어하기·90일/7일·탭 바인딩)과 operation-policy-aggregate-cases.synthetic.json(30일·최신성·공개1/4/5·반복40회·이전공개값 역산)을 따른다. 정책 수치는 승인된 값이지만 사건/UUID/기대 건수는 전부 합성이다.

## 11. 환경 설정 이름과 담당

| 담당 | 이름/규칙 |
| --- | --- |
| 고객 서버 | BETA_TRACKING_ENABLED,BETA_RUN_ID,BETA_START_AT,BETA_TRACKING_ALLOWED_ORIGINS,BETA_TRACKING_WEB_APP_URL,BETA_EVENT_WRITE_SECRET |
| 고객 서버 자료 범위 | BETA_DATASET,BETA_TRACKING_CONTEXT_ID. dataset=beta는 모든 일반방문 운영 자료, connection_test는 합성 검증 |
| 관리자 서버 | BETA_AGGREGATE_WEB_APP_URL,BETA_AGGREGATE_READ_SECRET,BETA_PUBLIC_AGGREGATE_READ_SECRET,BETA_DASHBOARD_ENABLED,BETA_PUBLIC_ENABLED |
| 관리자 수집기 | BETA_SPREADSHEET_ID,BETA_SHEET_ID,BETA_SHEET_TITLE,세 동작별 키,허용 run/schema/definition 및 고정 기간 정책 |
| 확정 스케줄/보관 | 내부300000ms/최신성900000ms,공개KST09시/최신성129600000ms,원장90일/분석상태최대90일/미전송최대7일 |

상시 수집 시작 시각 BETA_START_AT은 실제 활성화 전에 설정한다. BETA_END_AT은 더 이상 필수 종료일이나 활성화 판정 조건이 아니다. 종료를 위한 임의 미래 날짜를 만들지 않는다. 수집 중지에는 명시적 enabled 설정을 사용한다. run/context를 일별/30일별로 회전하지 않는다.

이름 공유는 실제 등록 완료가 아니다. 현재 작성 중인 앱 코드가 draft.3 설정을 이미 지원한다고 표시하지 않는다. 실제 값·URL·키·운영 계정·보관 정리/장애 담당·연결 검증 대상과 건수는 실행 전에 확인한다. 비밀값을 NEXT_PUBLIC·번들·문서·Git·로그·브라우저 저장소·시트에 넣지 않는다.

기존 인증/DB/공통 신청 API는 변경 대상이 아니다. 새 분석 경로 ingress·요청 제한이 필요하면 서버·인프라 담당 요청으로 정리하며 기존 가드를 해제하지 않는다.

## 12. 관리자 리뷰와 병행 준비 기준

관리자 리뷰 위치:
C:/Users/PC/Documents/GitHub/shinhan-beta-dashboard/docs/shinhan-beta-handoff/contract-review.md

리뷰에서 참조 버전, 요청/응답 키, 17열, 중복 충돌, role/flow 결합, 서명 vector, 기간/24h/늦은 완료, 예상 집계 일치, 공개 비활성, 환경변수/ingress 담당을 확인한다. 이견은 고객 소유 초안에서 다음 버전으로 반영하며 한쪽만 형식을 바꾸지 않는다.

병행 준비 완료 조건: 양쪽이 **동일 계약 버전 + 동일 합성 요청/응답/집계 fixture**의 기술적 호환성을 검토하여 진행 가능하다고 기록한 상태. 앱 구현 시작은 그와 별도로 사용자 지시를 받아야 한다. 실제 Apps Script 배포·키 등록·시트 저장 완료는 선행 조건이 아니다. 이번 단계는 새 계약·합성 예시의 관리자 재검토와 동일 버전 합의 확인까지다. 기존 미완성 코드와 중단 상태를 보존하며 앱 개발을 재개하지 않는다.

## 13. 근거

- C:/Users/PC/Documents/GitHub/shinhan-beta-dashboard/beta_card.md
- 같은 폴더 tracking.md (17열 114~130행, 중복 207~213행, 집계 219~238행)
- 같은 폴더 utm_links.md (확정 조합 20~27행), dashboard.md (권한 분리 111~117행, 공개 제안 195~200행), onboarding_check.md
- C:/Users/PC/Documents/GitHub/shinhan-runtime-split/docs/customer-web-handoff.md: 최신 1.8.0 / 2026-10-26. 과거 Git/배포 이력을 이번 고객 기준으로 사용하지 않음.
- 같은 서버 폴더 docs/decisions.md, docs/api-contract-v1.md, docs/customer-production-ingress-contract-v1.md
- 고객 최신 main의 실제 코드 근거/수정 후보는 implementation-plan.md 참조.
- operating-decisions.md 및 관리자 operating-policy-decisions.md의 사용자 확정 운영 기준, admin-review-3-policy P1~P6.

변경 이력: draft.1 최초 작성. draft.2는 admin-review-1 C1~C7을 반영한 기술 합의였다. history/0.1.0-draft.1/ 및 history/0.1.0-draft.2/에 이전 문서·예시·합의 기록을 보존한다. draft.3은 사용자 운영 확정과 admin-review-3-policy P1~P6에 따라 모든 일반방문 상시 수집, 실제 재체험의 새 시도, KST 오늘 포함30일, 고정90일/7일 보관, 내부5분/15분·공개09시/36시간, 공개 소수·역산 보호를 반영한다. 요청17열과 기존 고객 동선은 유지한다. 관리자 동일 버전 판정과 고객 확인은 agreement.md에서 계약/manifest/리뷰 해시를 참조한다. 앱 개발은 별도 재개 지시 전 계속 중단한다.
