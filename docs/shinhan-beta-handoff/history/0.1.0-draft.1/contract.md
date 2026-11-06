# 홈투게더 × 신한 베타 공통 계약 초안

- 계약/이벤트 schema 버전: `0.1.0-draft.1`
- 집계 정의 버전: `shinhan_beta_metrics_draft_v1`
- 작성: 2026-10-27 Asia/Seoul. 소유: 고객 대화창.
- 상태: **검토용 초안. 사용자 구현 승인 및 관리자 동일 버전 검토 전.**
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
    "schema_version": "0.1.0-draft.1",
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

다중 탭 제안: 공유 UUID 생성과 흐름별 시도 생성/단계 이벤트 할당/큐 갱신을 origin 단위 Web Lock 안에서 처리하고 localStorage를 잠금 후 다시 읽는다. 이벤트 발생 시각/ID도 최초 할당값을 재사용한다. Web Lock 또는 안정 저장소를 사용할 수 없으면 개인정보 대체 식별이나 임의 새 ID 반복 발급 없이 베타 계측을 생략한다. 지원 범위/누락은 검증 보고에 남긴다. 다른 기기·origin 간 병합은 하지 않는다.

완료 관찰:
- HOST_ESTIMATE: 실제 saved application의 result 분기가 표시된 후.
- HOST_REGISTRATION: 실제 saved application의 complete 분기가 표시된 후.
- 게스트: 같은 시도의 resultSeen 및 기존 guide 단계의 안내 카드가 1개 이상 표시된 후라는 **관찰 기준 제안**. 걱정 선택 단계만 표시하거나 '선택한 걱정이 없어요' 빈 상태만 표시한 경우는 미완료. 기존 '전체 확인 사항 보기'로 카드가 표시되면 충족한다. 읽기/이해를 입증하는 지표는 아니다.
- 기존 다음 버튼·프로필·알림 동작을 완료 필수 조건으로 추가하지 않는다.
- 개발용 example/followup 화면을 운영 완료로 세지 않는다. 새로고침으로 현재 신청이 없어지면 분석 때문에 복원 API/신청을 새로 만들지 않는다.
- 기록 도입 전 신청/결과 또는 누락된 선행 기록에서 가짜 entry/start를 소급 생성하지 않는다.

유일성:
1. 전송키는 (run_id, dataset, event_id). 동일 키·동일 정규화 16필드면 duplicate. 한 필드라도 다르면 EVENT_ID_CONFLICT.
2. 의미키는 (run_id, dataset, mission_id, attempt_id, event_name). 다른 event_id여도 나머지 16필드 중 event_id 제외 값이 모두 같으면 duplicate. 발생 시각/역할/출처/flow 등 다르면 SEMANTIC_CONFLICT. 최초 행/시각을 변경하지 않는다.
3. 시도 anonymous_id/UTM/mission은 entry에 고정한다. unselected entry→첫 start 결합만 예외이며 원장은 불변. start와 complete의 role/flow는 같아야 한다.
4. entry→start→complete 순서. 선행 없음은 MISSING_PREDECESSOR, 가짜 행을 만들지 않는다. 서로 다른 흐름·브라우저 결합은 ATTEMPT_CONFLICT.
5. 관리자의 단일 writer에서 lock + 원장 검증/append. 캐시만으로 중복을 판단하지 않는다. append 뒤 snapshot 실패는 accepted + dirty이며 원장을 다시 읽어 복구한다. ScriptLock만으로 모든 장애에서 exactly-once를 보장한다고 주장하지 않는다.

브라우저 큐 제안: 최소 필드만 최대 30개, 최초 생성부터 7일 TTL, 한 전송 회차 최대 5회(0/1/3/10/30초+jitter), 요청 timeout 1.5초. 실패 후 다음 online/방문에서 회차를 재개하되 만료/한도 초과 시 유실로 취급한다. 값은 운영 보관 정책 검토 대상이다. 네트워크를 기다려 고객 화면을 막지 않는다. permanent 오류는 재생성하지 않는다. 선행 permanent 실패/유실 시 후행도 중단하고 가짜 성공을 만들지 않는다.

## 5. 수집 응답·오류

모든 응답은 no-store. HTTP 성공만으로 수락으로 보지 않고 body 계약도 검증한다.

성공 공통 형태:
```json
{
  "ok": true,
  "contract_version": "0.1.0-draft.1",
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
{"ok":false,"contract_version":"0.1.0-draft.1","error":{"code":"MISSING_PREDECESSOR","retryable":true,"retry_after_ms":1000}}
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
contract_version: "0.1.0-draft.1"
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

- 허용 시계 오차 ±300초, (action, nonce) 재사용 600초 차단 제안. nonce 검사는 단일 writer 경계에서 원자적으로 수행하며 저장소 할당량/정리는 관리자 구현 검토 대상이다.
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

### 관리자

get_admin_aggregates의 payload:
`{contract_version, run_id, dataset, definition_version, period:{from,until,timezone}, as_of}`.
임의 SQL·시트·범위·개인/이벤트/시도 조회 인자는 불허한다. 관리자 인증 후 관리자 BFF가 요청한다. 조회 허용 run/기간/as_of 및 반환 크기 제한은 서버 검증. 브라우저에서 수집기 직접 접근 금지.

정상 응답: `{ok:true,contract_version,data}`.
data는 status, run_id, dataset, definition_version, period, as_of, generated_at, unit, observation_basis, abandonment_hours, collection_state, snapshot_state, totals, by_flow, by_channel, completions_by_basis, quality.
metrics는 entered, started, completed, not_started, incomplete, in_progress, abandoned_24h, anonymous_browsers, rates(분자/분모/value)다. 값은 음수 없는 정수, 비율 value는 0..1 또는 null. 정확한 예시는 fixtures/admin-aggregate*.json.

status=ready는 실제 연결된 0건도 표현한다. status=stale는 마지막 snapshot 시각/기간과 기존 값을 그대로 반환하고 dirty로 표시한다. 요청 as_of까지 계산되지 않았는데 as_of를 새 값으로 덮어쓰지 않는다.
미연결은 `data:{status:"not_connected",totals:null}`만 반환하는 별도 union.
실패는 ok=false/AGGREGATE_UNAVAILABLE. dirty인데 snapshot이 없으면 실패 상태이며 0을 만들지 않는다.
collection_state는 enabled/disabled/not_connected/synthetic_fixture; snapshot_state는 current/dirty.
quality={status:valid|degraded,rejected_attempts:정수}; 차원 충돌 시도는 격리하고 실제 제외 수를 표시하는 안이다.

### 공개

get_public_aggregates payload는 `{contract_version,snapshot_key}`만 허용한다. snapshot_key는 사전 승인된 공개 기간/차원/정책에 매핑하는 공통 코드이며 익명/시도 식별자가 아니다. 임의 시간·역할·UTM 교차필터는 허용하지 않는다.

공개 DTO: `{ok:true,contract_version,data:{status,reason,unit,period,as_of,generated_at,privacy_policy_version,cards}}`.
카드: `{metric:entered|started|completed,status:visible|suppressed,value:정수|null}`.
status=disabled이면 reason=POLICY_UNCONFIRMED, 기간/시각/정책은 null, cards=[].
status=suppressed이면 보호 대상 value=null. 0이나 1~4 같은 범위를 넣지 않는다. 공개 정책 결정 후에만 ready 카드 제공.
원본/익명·시도·이벤트 ID/시트 링크/키/관리자 quality 상세/채널 교차 집계를 내려주지 않는다. 분모·합계·차분으로 소수가 역산되지 않도록 보완 억제도 정책에 포함한다.
5브라우저/하루1회 공개 및 관리자5분 갱신은 기존 미확정 제안이다. 이번 초안에서 숫자를 확정하지 않는다. 공개 집계 수치 fixture는 만들지 않고 비활성 및 완전 억제 형태만 제공한다.

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

병행 준비 완료 조건: 양쪽이 **동일 계약 버전 + 동일 합성 요청/응답/집계 fixture**를 검토하여 진행 가능하다고 기록하고 사용자가 구현을 승인한 상태. 실제 Apps Script 배포·키 등록·시트 저장 완료는 선행 조건이 아니다. 이번 단계는 자료/계획 작성 후 애플리케이션 코드 수정 전에 멈춘다.

## 13. 근거

- C:/Users/PC/Documents/GitHub/shinhan-beta-dashboard/beta_card.md
- 같은 폴더 tracking.md (17열 114~130행, 중복 207~213행, 집계 219~238행)
- 같은 폴더 utm_links.md (확정 조합 20~27행), dashboard.md (권한 분리 111~117행, 공개 제안 195~200행), onboarding_check.md
- C:/Users/PC/Documents/GitHub/shinhan-runtime-split/docs/customer-web-handoff.md: 최신 1.8.0 / 2026-10-26. 과거 Git/배포 이력을 이번 고객 기준으로 사용하지 않음.
- 같은 서버 폴더 docs/decisions.md, docs/api-contract-v1.md, docs/customer-production-ingress-contract-v1.md
- 고객 최신 main의 실제 코드 근거/수정 후보는 implementation-plan.md 참조.

변경 이력: draft.1 최초 작성. 관리자 제안 메시지의 서버 소유 필드·세 권한·dirty 응답·동일 버전 병행 기준을 검토 초안에 반영. 관리자 최종 수락은 아직 기록되지 않았다.
