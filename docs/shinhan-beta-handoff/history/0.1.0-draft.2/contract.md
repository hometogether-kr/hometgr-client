# 홈투게더 × 신한 베타 공통 계약 초안

- 계약/이벤트 schema 버전: `0.1.0-draft.2`
- 집계 정의 버전: `shinhan_beta_metrics_draft_v1`
- 작성: 2026-10-27 Asia/Seoul. 소유: 고객 대화창.
- 상태: **관리자 재검토용 초안. 기술 계약 합의와 앱 구현/운영 승인은 별개.**
- 고객 기준: `codex/shinhan-beta-tracking`, `9f314521e444da9b0e63efeb2d80fcea1a89da8b`.
- 이 문서와 fixtures는 계약 검토 자료다. 실제 이벤트 전송·시트 저장·배포를 실행하지 않았다.
- 모든 수치 예시는 합성 데이터다. 실제 고객, 사람 수, 신청 수, 사용량 또는 성과가 아니다.

## 1. 확정 범위와 제안의 경계

### 사용자 확정

기존 /shinhan 화면·입력·신청·이동·결과 흐름에 사용 기록만 추가한다. 기본 종류는 진입·시작·완료다. 의미가 같은 기존 landing_view 이름을 재사용한다. 시작은 최초 유효 입력·선택을 기준으로 검토하며 CTA 클릭·화면 표시·자동 기본값을 시작으로 세지 않는다.

| 흐름 | 완료 조건 |
| --- | --- |
| HOST_ESTIMATE | 기존 예상 월세 결과 표시 |
| HOST_REGISTRATION | 기존 방 등록 완료 화면 표시 |
| GUEST_BUDGET | 선택한 기존 흐름의 결과·완료와 기존 걱정 안내 확인 |
| GUEST_DEMAND | 선택한 기존 흐름의 결과·완료와 기존 걱정 안내 확인 |

자기 역할의 두 흐름을 모두 수행할 필요는 없다. 호스트의 걱정·소개서·알림 신청은 완료 조건이 아니다. 시작 후 24시간 미완료는 분석상 중단이다. 새 가상 체험 모드·안내 연결·확인 버튼·안내문·고객 동선을 추가하지 않는다.

익명 기록을 신청 정보와 연결하지 않는다. 전화·주소·예산·자산·신청 원문·신청 ID·신청 멱등키·세션·쿠키·비밀값·전체 URL/referrer·기기 지문·원 IP를 기록하지 않는다. 대응표도 만들지 않는다. 기록 실패로 고객 행동을 막지 않는다.

고객은 계측·UTM·중복 처리·분석 전용 BFF 및 공통 초안을 소유한다. 관리자는 베타 수집·집계 연결과 대시보드를 소유한다. 고객은 Apps Script를 따로 작성하지 않는다. 상대 저장소를 수정하지 않는다.

### 이번 기술 제안

이하의 정확한 이벤트명, 요청/응답 키, 상태 코드, 시도 수명, 시간 계산, HMAC 규약, 큐 한도는 **이 버전의 검토 제안**이다. 기존 문서의 제안을 사용자 승인 사실로 승격하지 않는다. 양쪽이 이 버전을 검토·고정하면 로컬 모의 응답 기반 병행 개발이 가능하다.

미확정 운영 정책: 참여 구분 방식, 실제 run·베타 기간, 수집 종료 후 유예, 저장소·원장 보관 기간/담당, 공개 소수 집계 및 갱신 주기, 배포 위치/신한 링크 규격. 생산 수집은 기본 비활성, 공개도 기본 비활성이다. beta=1 등을 승인 없이 링크에 추가하지 않는다.

## 2. 브라우저 → 고객 BFF

후보 경로: `POST /api/beta/events`. 기존 /api/shinhan 신청 allowlist와 /api/marketing/attribution 계약은 그대로 둔다.

요청:
```json
{
  "context_id": "synthetic-context-v1",
  "event": {
    "schema_version": "0.1.0-draft.2",
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

이 예시는 합성이다. context_id는 모든 참여 브라우저가 공유하는 **공개 설정 버전**이며 개인/탭/세션 ID나 비밀값이 아니다. 서버가 제공한 활성 context에 run·dataset·mission을 매핑한다. 기간/모드 변경 시 context를 변경한다. 큐에도 context를 보존하고 이전 context 이벤트를 새 run으로 재라벨링하지 않는다. context 제공은 얇은 서버 구성에서 직렬화 가능한 값만 전달하는 방식으로 계획한다. 참여 구분 방법은 별도 미확정이다.

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

## 4. 시도·완료·중복

제안 단위는 사람/접수 대신 흐름별 시도다. 같은 origin·브라우저·run·mission·dataset·flow는 새로고침/다른 탭/재유입/재조회/기존 견적 재계산에도 하나의 attempt를 유지한다. 다른 flow는 다른 attempt. 같은 흐름의 명시적 새 시도 정책은 미확정이며 이번 버전에서는 임의 증가시키지 않는다.

첫 /shinhan의 미선택 entry를 첫 유효 start 흐름에 연결한다. 다른 흐름에서는 별도 entry를 만든다. 기존 시도를 24시간에 삭제하지 않는다. resultSeen/guideSeen은 분석 UUID와 고정 flow에만 보관한다. 신청 ID·draftGeneration·신청 멱등키·세션을 시도 키 또는 대응표로 쓰지 않는다.

다중 탭 제안: 공유 UUID 생성과 흐름별 시도 생성/단계 이벤트 할당/큐 갱신을 origin 단위 Web Lock 안에서 처리하고 localStorage를 잠금 후 다시 읽는다. 이벤트 발생 시각/ID도 최초 할당값을 재사용한다. Web Lock 또는 안정 저장소를 사용할 수 없으면 개인정보 대체 식별이나 임의 새 ID 반복 발급 없이 베타 계측을 생략한다. 지원 범위/누락은 검증 보고에 남긴다. 다른 기기·origin 간 병합은 하지 않는다. 두 탭이 미선택 entry를 서로 다른 flow로 동시에 claim하면 잠금을 먼저 얻은 flow가 기존 entry를 결합한다. 두 번째는 잠금 후 다시 읽어 자기 flow의 기존 시도를 재사용하거나 별도 entry/start를 만든다. 기대값은 두 flow·두 attempt·E2/S2이며 원본 미선택 entry는 수정하지 않는다.

완료 관찰:
- HOST_ESTIMATE: 실제 saved application의 result 분기가 표시된 후.
- HOST_REGISTRATION: 실제 saved application의 complete 분기가 표시된 후.
- 게스트: 같은 시도의 resultSeen 및 기존 guide 단계의 안내 카드가 1개 이상 표시된 후라는 **관찰 기준 제안**. 걱정 선택 단계만 표시하거나 '선택한 걱정이 없어요' 빈 상태만 표시한 경우는 미완료. 기존 '전체 확인 사항 보기'로 카드가 표시되면 충족한다. 읽기/이해를 입증하는 지표는 아니다.
- 기존 다음 버튼·프로필·알림 동작을 완료 필수 조건으로 추가하지 않는다.
- 개발용 example/followup 화면을 운영 완료로 세지 않는다. 새로고침으로 현재 신청이 없어지면 분석 때문에 복원 API/신청을 새로 만들지 않는다.
- 기록 도입 전 신청/결과 또는 누락된 선행 기록에서 가짜 entry/start를 소급 생성하지 않는다.

유일성:
1. 전송키는 (run_id, dataset, event_id). 원장에 저장된 canonical event_id에 대해 동일 키·동일 정규화 16필드면 duplicate. 한 필드라도 다르면 EVENT_ID_CONFLICT.
2. 의미키는 (run_id, dataset, mission_id, attempt_id, event_name). 다른 event_id여도 나머지 16필드 중 event_id 제외 값이 모두 같으면 duplicate. 발생 시각/역할/출처/flow 등 다르면 SEMANTIC_CONFLICT. 최초 행/시각을 변경하지 않는다. append=0인 의미중복 request_event_id는 별칭 원장에 저장하지 않는다. 이 별칭을 다른 사건에 재사용한 경우까지 영속 EVENT_ID_CONFLICT를 보장하지 않는다. 브라우저는 모든 event_id를 다른 사건에 재사용하지 않아야 한다. 별도 alias 저장소·열·탭은 추가하지 않는다.
3. 시도 anonymous_id/UTM/mission은 entry에 고정한다. unselected entry→첫 start 결합만 예외이며 원장은 불변. start와 complete의 role/flow는 같아야 한다.
4. entry→start→complete 순서. 선행 없음은 MISSING_PREDECESSOR, 가짜 행을 만들지 않는다. 서로 다른 흐름·브라우저 결합은 ATTEMPT_CONFLICT.
5. 관리자의 단일 writer에서 lock + 원장 검증/append. 캐시만으로 중복을 판단하지 않는다. append 뒤 snapshot 실패는 accepted + dirty이며 원장을 다시 읽어 복구한다. ScriptLock만으로 모든 장애에서 exactly-once를 보장한다고 주장하지 않는다.

브라우저 큐 제안: 최소 필드만 최대 30개, 최초 생성부터 7일 TTL, 한 전송 회차 최대 5회(0/1/3/10/30초+jitter), 요청 timeout 1.5초. 실패 후 다음 online/방문에서 회차를 재개하되 만료/한도 초과 시 유실로 취급한다. 값은 운영 보관 정책 검토 대상이다. 네트워크를 기다려 고객 화면을 막지 않는다. permanent 오류는 재생성하지 않는다. 선행 permanent 실패/유실 시 후행도 중단하고 가짜 성공을 만들지 않는다.

## 5. 수집 응답·오류

이 절의 no-store, accepted=201/duplicate=200 및 오류 HTTP 표는 **고객/관리자 BFF→브라우저** 응답 의무다. 수집기는 JSON 업무 결과를 반환하고 BFF가 상태/헤더를 정규화한다. Apps Script의 HTTP 200이나 redirect만으로 수락으로 보지 않는다.

성공 공통 형태:
```json
{
  "ok": true,
  "contract_version": "0.1.0-draft.2",
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
{"ok":false,"contract_version":"0.1.0-draft.2","error":{"code":"MISSING_PREDECESSOR","retryable":true,"retry_after_ms":1000}}
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
contract_version: "0.1.0-draft.2"
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

제안: 시도 entry 당시 최근 유효 외부 출처 snapshot을 entry/start/complete에 고정한다. 이후 외부 B 유입은 공통 최근만 B로 바꾸고 기존 시도 A 귀속은 유지한다. 최초도 지우지 않는다. 새 흐름의 시도는 그때 최근 출처를 사용한다. 브라우저/기기/서브도메인 간 ID/출처 연결은 하지 않는다. 보관 90일은 과거 제안이며 미확정이다.

기존 코드의 source 분류와 UTM source는 별개다. 현재 kakao-attribution 전송은 전체 URL·세션을 포함하므로 베타에서 호출하지 않는다. 같은 UUID 키를 재사용하되 기존 값도 UUID 검증한다.

## 8. 집계 정의

아래는 합성 fixture 계산에 사용하는 **제안 정의**다. 사용자 확정은 '시작 후 24시간 미완료=분석상 중단'이며, 최초 received_at 사용/늦은 완료 제거는 구현 검토 대상이다.

- UTC 저장, 표시/일 경계 Asia/Seoul.
- 기간은 entry.received_at의 [from, until). from 포함, until 제외.
- as_of는 관찰 마감 시각. received_at <= as_of인 entry/start/complete만 사용.
- 같은 cohort의 이후 start/complete를 as_of까지 연결한다. 일자 변경으로 분모를 옮기지 않는다.
- E=중복 제거된 진입 시도, S=E 중 유효 시작, C=S 중 유효 완료.
- not_started=E-S; incomplete=S-C.
- abandoned_24h=미완료 중 as_of-start.received_at >= 24h.
- in_progress=미완료 중 24h 미만. incomplete=in_progress+abandoned_24h.
- 늦은 완료가 as_of에 포함되면 C로 이동하고 미완료/현재 중단에서 제외한다. '한 번이라도 24h를 넘긴 수'와 다른 지표다.
- 시작률 S/E, 전체 완료율 C/E, 시작 대비 완료율 C/S. 분모 0이면 value=null. 원래 numerator/denominator도 응답.
- 단위는 flow_attempt. anonymous_browsers는 E의 distinct UUID이며 실제 사람 수가 아니다. 그룹별 distinct를 더해 전체 distinct를 만들지 않는다.
- 역할/flow는 as_of 이전 첫 start에서 entry에 결합한다. start가 없으면 entry의 역할/flow를 유지하고 미선택은 따로 둔다.
- 채널 그룹은 entry의 네 UTM tuple. 미확인 빈 조합 별도.
- dataset/run/definition 엄격 분리. connection_test는 beta에 절대 포함하지 않는다. complete는 basis별로 별도 합계 제공.
- occurred_at은 브라우저 시계 참고값이며 시간 계산의 기준이 아니다. 오프라인 지연으로 실제 행동 경과와 차이 가능.
- 비정상 행은 숨겨 보정하거나 가짜 시작/진입을 만들지 않고 quality에 표시한다. 원장 append 성공과 집계 갱신 성공을 구분한다.

## 9. 관리자/공개 집계 요청·응답

### 9.1 운영 조회와 계산 입력의 분리

운영 get_admin_aggregates payload는 다음 strict object만 받는다:
```json
{"contract_version":"0.1.0-draft.2","run_id":"synthetic-run-v1","dataset":"connection_test","definition_version":"shinhan_beta_metrics_draft_v1","view":"latest"}
```
이 run/dataset은 합성 예시다. 실제 값/베타 기간은 미정이다. 운영은 서버 설정 run 기간의 최신 snapshot 한 개만 조회한다. 서버가 실제 period={from,until,timezone}를 결정한다. 임의 날짜·과거시각·교차필터 UI를 추가하지 않는다.

fixtures/aggregate-query.synthetic.json의 period/as_of는 **순수 계산 입력**이다. 이벤트를 기간/cohort에 연결하는 계산 예시이며 운영 RPC에 그대로 보내지 않는다. 기존 admin-aggregate*.expected는 그 계산 결과다. 운영 조회 사례는 admin-snapshot-cases.synthetic.json을 따른다.

- 지원하지 않는 version/run/dataset/definition/view, 또는 period/as_of 등 여분 조회 필드: BFF HTTP422 / UNSUPPORTED_AGGREGATE_QUERY / retryable=false / retry_after_ms=null.
- 지원 scope이고 수집 연결 자체가 아직 없으면 ok=true, data={status:"not_connected",totals:null}.
- 연결된 지원 scope에 snapshot이 없거나 유효한 fallback이 없으면 HTTP503 / AGGREGATE_UNAVAILABLE / retryable=true. 0건 응답을 만들지 않는다.
- snapshot 후보의 run_id·dataset·definition_version·실제 period(from/until/timezone)가 전부 요청/서버 설정과 같아야 한다. 같은 조건의 마지막 정상 snapshot만 stale fallback 가능하다. 다른 run·검증dataset·다른기간의 마지막 값을 대신 반환하지 않는다.
- 조회 요청 자체가 원장 쓰기·고객 신청·worker 실행·원장 전체 재계산을 유발하지 않는다. 관리자 수집기 담당이 별도 주기 갱신/원장 watermark 복구를 수행한다. 이벤트가 없어도 24h 중단 값은 시간 경과로 바뀌므로 주기 갱신이 필요하다.
- 관리자 인증은 기존 인증을 사용한다. 브라우저는 수집기 URL/키를 받거나 수집기를 직접 호출하지 않는다.

### 9.2 관리자 응답과 최신성

정상/마지막 정상 snapshot 응답은 {ok:true,contract_version,data}.
data는 status, run_id, dataset, definition_version, period, as_of, generated_at, unit, observation_basis, abandonment_hours, collection_state, snapshot_state, freshness, totals, by_flow, by_channel, completions_by_basis, quality.
metrics는 entered, started, completed, not_started, incomplete, in_progress, abandoned_24h, anonymous_browsers, rates(분자/분모/value)다. 비율은 0..1 또는 null, 건수는 음수 없는 정수.

- status=ready 또는 stale. ready의 실제 0건은 정상 count0·분모0 비율null이다.
- snapshot_state=current|dirty는 원장 반영 상태이며 시간 최신성과 다르다. current는 처리할 원장 변경이 없다는 뜻이지 fresh 보증이 아니다.
- freshness={status:fresh|stale,evaluated_at:UTC ISO,reasons:배열}. reasons 허용값은 age_exceeded / dirty / refresh_failed이며 순서는 위 순서로 고정한다. fresh면 빈 배열, stale면 하나 이상.
- as_of <= generated_at <= evaluated_at을 검증한다. 미래 시각/역전은 유효 snapshot이 아니며 그대로 반환하거나 조용히 시각을 보정하지 않는다.
- evaluated_at - as_of > configured_max_age_ms 이면 새 이벤트가 없어 current/clean이어도 stale. 경계가 같으면 나이만으로 stale이 되지는 않는다. generated_at만으로 판단하면 오래된 관찰시각을 방금 재생성해 fresh로 보일 수 있으므로 금지한다.
- dirty 또는 갱신 실패를 확인한 경우 나이와 별도로 stale 원인을 표시한다. 오래된 값은 0으로 바꾸지 않고 실제 period/as_of/generated_at/값을 유지한다. 조회 시각을 generated_at에 덮어쓰지 않는다.
- 최신성 한도·갱신 주기의 실제 수치는 운영 결정 대기. fixture의 300000ms는 합성 규칙 예시일 뿐 운영 5분 확정이 아니다. 운영 설정이 없으면 수집/대시보드 활성화를 준비 완료로 표시하지 않는다.
- collection_state=enabled|disabled|not_connected|synthetic_fixture. quality={status:valid|degraded,rejected_attempts:정수}. 원본/UUID/시트 링크는 집계 응답에 포함하지 않는다.
- AGGREGATE_UNAVAILABLE은 조회 실패이며 정상 0건과 구별한다. snapshot 없는 dirty도 실패다.

### 9.3 utm_source별 내부 mapper

내부 by_channel은 기존 네 UTM tuple별 집계를 유지한다. 기본 화면의 source표는 같은 utm_source를 묶어 entered와 completed를 각각 합산한 뒤 completion_from_entry={numerator:합산C,denominator:합산E,value:C/E 또는 null}를 다시 계산한다.
mapper 출력은 {utm_source,entered,completed,completion_from_entry}[]로 제한한다. tuple 비율의 평균이나 anonymous_browsers의 합산은 금지한다. source별 고유 브라우저가 필요해지면 원장에서 distinct를 새로 계산하는 별도 계약이 필요하며 현재 화면에는 추가하지 않는다.

source-mapping.synthetic.json: 동일 kakao의 host tuple E3/C1, guest tuple E1/C1 → source E4/C2, 완료율0.5. (1/3+1)/2는 잘못된 값이다. 이는 별도 합성 mapper 사례이며 기존 원장20행/기대 E7을 변경하지 않는다.

### 9.4 공개 요청과 보호된 값

운영 get_public_aggregates payload는 {contract_version,snapshot_key}만 허용한다. 서버가 snapshot_key를 승인된 run/dataset/definition/period와 현재 privacy_policy_version에 매핑한다. 공개 설정은 beta만 허용한다. connection_test 공개 사례는 로컬 합성 검증 전용으로 실제 공개 경로에서는 거부한다. 임의 조회 기간·역할·UTM 필터를 받지 않는다. 지원하지 않는 key/필드는 공개 BFF에서 일반 AGGREGATE_UNAVAILABLE로 정규화하고 내부 scope를 노출하지 않는다.

공개 DTO는 관리자 DTO에서 브라우저가 감추는 방식이 아닌 별도 allowlist 투영이다:
```text
{ok:true,contract_version,data:{
  status: disabled|not_connected|ready|stale|suppressed,
  reason: POLICY_UNCONFIRMED|NOT_CONNECTED|PRIVACY_POLICY|POLICY_CHANGED|null,
  unit:"flow_attempt", period:Period|null,
  as_of:UTC|null, generated_at:UTC|null, privacy_policy_version:string|null,
  freshness:{status:fresh|stale,evaluated_at:UTC}|null,
  counts:PublicCounts|null, rates:PublicRates|null, by_source:PublicSource[]
}}
Count = {status:"visible",value:정수} | {status:"suppressed",value:null}
Rate = {status:"visible",numerator:정수,denominator:양수,value:0..1}
     | {status:"not_applicable",numerator:0,denominator:0,value:null}
     | {status:"suppressed",numerator:null,denominator:null,value:null}
PublicCounts = {entered:Count,started:Count,completed:Count,incomplete:Count,abandoned_24h:Count}
PublicRates = {start:Rate,completion_from_entry:Rate,completion_from_start:Rate}
PublicSource = {utm_source:고정source,counts:{entered:Count,completed:Count},rates:{completion_from_entry:Rate}}
```

source표의 고정 순서는 apartment / kakao / everytime / instagram / google / naver / 빈문자열이다. 기존 확정 채널/자연검색 기획/출처미확인 표현만 사용한다. 해당 source가 0이어도 snapshot이 있으면 행을 임의 제거하지 않는다. 빈문자열의 UI 표시는 직접/출처 확인 불가다. 새 채널이나 자연검색 자동구현을 뜻하지 않는다.

공개는 원장에서 source 단위로 먼저 묶고 **총합·비율의 분자/분모·미완료·중단·source표 전체에 같은 보호정책과 보완 억제를 적용한 뒤** 반환한다. 보호된 tuple을 브라우저에서 합치지 않는다. 하나의 숨긴 수치가 S-C, C/E, source 합, 다른 시각 snapshot 차분으로 역산되지 않도록 정책이 보장해야 한다. 공개 필터/갱신 제한도 그 정책의 일부다.

원본·anonymous/attempt/event ID·고유 브라우저 수·campaign/content tuple·시트 링크·키·내부 quality/오류·계획문서 원문은 공개 DTO에 없다. 상단6칸은 기존 안전한 정적 설명으로 관리하며 이 응답에 내부 문서를 넣지 않는다.

### 9.5 공개 상태와 정책 변경

| status | 값/메타데이터 |
| --- | --- |
| disabled | POLICY_UNCONFIRMED. counts/rates=null, by_source=[], period/as_of/generated_at/privacy_policy_version/freshness=null |
| not_connected | 현재 승인 정책은 있으나 수집 미연결. NOT_CONNECTED. counts/rates=null, by_source=[], period는 설정기간, as_of/generated_at/freshness=null |
| ready | 현재 정책에 맞고 fresh. 실제0은 visible0, 비율not_applicable |
| stale | 현재 정책에 맞지만 오래됨. 마지막 값과 실제 as_of/generated_at 유지, freshness=stale |
| suppressed | 일부/전체 보호. Count/Rate의 보호값은 null. fresh/stale는 freshness에서 별도로 표현 |
| 조회 실패 | ok=false / AGGREGATE_UNAVAILABLE. data나 내부 오류·0건을 내리지 않음 |

snapshot이 있는 상태의 우선순위는 보호 필요→suppressed, 그 외 오래됨→stale, 그 외 ready다. 공개에는 내부 stale 원인 배열은 내리지 않는다. 정책 미확정 disabled가 최우선이며 미확정 상태에서 정상0으로 위장하지 않는다.

공개 fallback은 동일 snapshot_key·매핑 run/dataset/definition/period·**현재 privacy_policy_version** 전체 일치에 한정한다. 정책이 바뀌면 옛 정책으로 만든 숫자를 stale로 재공개하지 않는다. 새 정책에 맞는 snapshot이 준비되기 전에는 suppressed/POLICY_CHANGED로 counts/rates의 모든 숫자·분자·분모=null, by_source=[], as_of/generated_at/freshness=null을 반환한다. 현재 승인 정책이 사라졌으면 disabled다.

공개 5브라우저/하루1회 및 관리자5분은 기존 제안이며 확정하지 않는다. public-cases의 합성 정책은 형식 검증 전용이고 운영 승인/실제 공개를 뜻하지 않는다. 공개 운영 기본값은 계속 disabled다.

## 10. 합성 예시

fixtures의 metadata는 테스트 포장이다. 실제 요청에는 metadata/synthetic/warning을 넣지 않는다.

| 합성 관찰 시각 | E | S | C | 미완료 | 진행 중 | 24h 중단 | 고유 브라우저 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-10-27 12:00 KST | 7 | 6 | 3 | 3 | 1 | 2 | 6 |
| 2026-10-27 13:00 KST | 7 | 6 | 4 | 2 | 1 | 1 | 6 |

두 시각 차이는 G의 늦은 완료 1개다. A/B는 같은 합성 브라우저의 서로 다른 흐름이다. D는 첫 관찰 시각에 정확히 24시간 경계다. H는 기간 시작 전, I는 종료 경계, J는 다른 run이므로 제외된다. 전부 connection_test라 beta query는 정상 0건이다.

원장 합성 행은 20개. duplicate/conflict 예시는 별도 요청 사례이며 이 원장에 추가 저장된 행이 아니다. 모든 완료는 simulation. 기간·run은 합성 예시이며 실제 베타 일정이 아니다.

## 11. 환경변수 이름 제안과 담당

| 담당 | 후보 이름 |
| --- | --- |
| 고객 서버 | BETA_TRACKING_ENABLED, BETA_RUN_ID, BETA_START_AT, BETA_END_AT, BETA_TRACKING_ALLOWED_ORIGINS, BETA_TRACKING_WEB_APP_URL, BETA_EVENT_WRITE_SECRET |
| 고객 서버 추가 검토 | BETA_DATASET, BETA_TRACKING_CONTEXT_ID (서버 모드/공개 설정 버전; 실제 값 미정) |
| 관리자 서버 | BETA_AGGREGATE_WEB_APP_URL, BETA_AGGREGATE_READ_SECRET, BETA_PUBLIC_AGGREGATE_READ_SECRET, BETA_DASHBOARD_ENABLED, BETA_PUBLIC_ENABLED |
| 관리자 수집기 설정 | BETA_SPREADSHEET_ID, BETA_SHEET_ID, BETA_SHEET_TITLE, 위 세 동작별 키, 허용 run/schema/기간 |

이름만 공유하며 등록 완료를 뜻하지 않는다. 비밀값은 NEXT_PUBLIC·번들·문서·Git·로그·브라우저 저장소·시트에 넣지 않는다. 기존 인증/DB/공통 신청 API는 변경 대상이 아니다. 필요 발생 시 서버 담당 요청 사항으로 넘긴다.

## 12. 관리자 리뷰와 병행 준비 기준

관리자 리뷰 위치:
C:/Users/PC/Documents/GitHub/shinhan-beta-dashboard/docs/shinhan-beta-handoff/contract-review.md

리뷰에서 참조 버전, 요청/응답 키, 17열, 중복 충돌, role/flow 결합, 서명 vector, 기간/24h/늦은 완료, 예상 집계 일치, 공개 비활성, 환경변수/ingress 담당을 확인한다. 이견은 고객 소유 초안에서 다음 버전으로 반영하며 한쪽만 형식을 바꾸지 않는다.

병행 준비 완료 조건: 양쪽이 **동일 계약 버전 + 동일 합성 요청/응답/집계 fixture**의 기술적 호환성을 검토하여 진행 가능하다고 기록한 상태. 앱 구현 시작은 그와 별도로 사용자 지시를 받아야 한다. 실제 Apps Script 배포·키 등록·시트 저장 완료는 선행 조건이 아니다. 이번 단계는 자료/계획 작성 후 애플리케이션 코드 수정 전에 멈춘다.

## 13. 근거

- C:/Users/PC/Documents/GitHub/shinhan-beta-dashboard/beta_card.md
- 같은 폴더 tracking.md (17열 114~130행, 중복 207~213행, 집계 219~238행)
- 같은 폴더 utm_links.md (확정 조합 20~27행), dashboard.md (권한 분리 111~117행, 공개 제안 195~200행), onboarding_check.md
- C:/Users/PC/Documents/GitHub/shinhan-runtime-split/docs/customer-web-handoff.md: 최신 1.8.0 / 2026-10-26. 과거 Git/배포 이력을 이번 고객 기준으로 사용하지 않음.
- 같은 서버 폴더 docs/decisions.md, docs/api-contract-v1.md, docs/customer-production-ingress-contract-v1.md
- 고객 최신 main의 실제 코드 근거/수정 후보는 implementation-plan.md 참조.

변경 이력: draft.1 최초 작성. draft.2는 admin-review-1 C1~C7 반영: 공개 count/rate/source DTO, source 합산, latest 조회와 동일 scope fallback, as_of 기반 최신성, BFF HTTP 경계, canonical event_id 보장 범위, 다른 flow 다중 탭 및 nonce 끝초 경계. 기존 초안은 history/0.1.0-draft.1/에 보존한다. 관리자 동일 버전 판정과 고객의 합의 확인은 agreement.md에 별도 기록하며 계약/manifest 해시를 동결한다.
