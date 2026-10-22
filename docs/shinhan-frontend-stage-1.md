# 신한 고객 프론트 1단계 — 착수 조사

작성일: 2026-10-22 (Asia/Seoul)

이번 단계는 기획·계약·Figma·기존 구현 조사와 작업 브랜치 준비까지다. 사용자의 단계별 진행 요청에 따라 화면·전송 계층 구현은 다음 단계로 나눈다. 이 문서는 구현 완료나 API 연결 완료 보고가 아니다.

## 작업 기준과 보존 상태

- 저장소: `C:\Users\PC\Documents\GitHub\hometgr-client`
- 작업 브랜치: `codex/shinhan-customer-frontend`
- 시작 커밋: `a3984dc` (`docs/visit-reservation-plan`에서 분기)
- 기준 기획서: `docs/shinhan-planning.md`, 수정일 2026-10-22. 원문은 변경하지 않았다.
- 기존 미추적 문서 `docs/shinhan-planning.md`, `docs/shinhan-planning.html`, `docs/utm-admin-integration-plan.md`, `docs/utm-admin-development-plan.html`을 보존한다.
- 기존 설치와 캐시를 사용한다. 조사 시 C 드라이브 여유 공간 약 18.05GB. 삭제·재설치 없음.
- 서버·DB·관리자 저장소는 읽기만 수행했다. 배포·외부 메시지·운영 시트 호출 없음.

읽은 개발 기준은 루트 `AGENTS.md`와 설치된 Next.js 16.2.10의 다음 가이드다.

- `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`

route는 페이지 조합을 렌더링하는 얇은 진입점으로 유지한다. 정적 소개·본문은 Server Component, 메뉴·폼·달력 등 상호작용만 작은 Client Component로 나눈다. 신청 상태 provider가 필요하면 해당 흐름 가까이에 둔다. 상세 BFF 구현 시 cookies·Route Handler API 가이드도 다시 확인한다.

## 확인한 API 계약

서버 담당 채팅 **신한 서버·DB 기반 구현 시작**의 보고와 로컬 원본을 대조했다.

| 항목              | 확인값                                                             |
| ----------------- | ------------------------------------------------------------------ |
| 원본 경로         | `C:\Users\PC\Documents\GitHub\shinhan\docs\api-contract-v1.md`     |
| 계약 버전         | **1.0.0**, 2026-10-22, 로컬 구현 기준                              |
| 확인 시 서버 HEAD | `822cb8a838533e68fc0300104af06e0dae08b328`                         |
| 계약 파일 SHA-256 | `7AD40347C392D35AC5C4BDB151329D9A35E8C09F9974F02CE5C7B72FA98905B5` |
| 로컬 origin       | `http://localhost:3100`                                            |
| 서버 API prefix   | `/api/v1`                                                          |
| 브라우저 경계     | 고객 프론트의 동일 출처 `/api/shinhan/*` BFF                       |
| 응답 버전         | `X-Contract-Version: 1.0.0`                                        |

계약 원본을 고객 저장소에 복사하거나 별도 DTO 계약으로 확정하지 않는다. 후속 단계 시작 시 원본 버전·변경사항을 재확인한다. 계약에 나온 dev/운영 주소는 배포 완료를 뜻하지 않는다.

프론트 구현에 직접 적용할 조건:

- 세션 발급 완료 후 제출한다. 익명 세션은 2시간 고정이며 BFF의 HttpOnly 쿠키로 관리한다. bridge secret·bearer는 브라우저 JSON, URL, localStorage, 분석 로그에 노출하지 않는다.
- BFF는 지정된 공개 경로만 제공한다. Origin·CSRF·Sec-Fetch-Site·JSON·16KiB 제한, 세션 초기화 직렬화, 세션 발급의 IP HMAC 전달을 구현해야 한다. 일반 서비스 API나 관리자 경로로 전달하지 않는다.
- 네 신청 생성은 `POST /applications`, 현재 내역은 `GET /applications/:id/current`, 소개서 신청은 `POST /applications/:id/introduction`, 걱정 응답은 `PUT /applications/:id/concerns`다.
- 변경 요청의 UUID 멱등키와 본문을 함께 보존한다. 응답 유실·네트워크 실패에는 동일 요청을 재시도하고, 조건을 바꿔 제출하는 새 견적만 새 키를 사용한다.
- 실제 저장 성공 응답을 검증한 뒤에만 접수 완료를 표시한다. 호스트 견적 금액도 저장 성공 뒤 서버 스냅샷으로 공개한다. 계산 애니메이션·사진 예시·mock 응답을 실제 접수로 취급하지 않는다.
- 전화번호는 공백·하이픈만 제거한 `010` + 8자리다. 입력 예산은 원 단위 정수 200000~1000000, 10000 배수다. 날짜는 Asia/Seoul 기준 오늘 이상의 `YYYY-MM-DD`다.
- 계약기간은 `MONTH_1`~`MONTH_12`와 `MONTHS_12_PLUS`를 구분한다. 자유 위치 입력과 카카오 선택 주소를 서로 대체하지 않는다.
- 방 등록·게스트 접수에는 일반 수정 API가 없다. 접수 후 입력은 조회 전용이다. 호스트 재견적은 기존 기록을 수정하지 않고 새 신청을 생성한다.
- `SKIPPED`는 기존 걱정 선택 삭제·선택 동의 철회까지 포함한다. 단순 전체 가이드 열람에는 API를 호출하지 않는다. 화면에서 건너뛰기·철회를 어떤 행동으로 연결할지는 해당 구현 단계에서 구분해야 한다.
- 접수 성공과 알림톡 전달 성공은 별개다. `ACCEPTED`를 `DELIVERED`로 표시하지 않는다.

동의 전문 API는 `GET /consents`다. 현재 버전은 `LOCAL_ONLY_REQUIRED_V1`, `LOCAL_ONLY_OPTIONAL_V1`이며 운영 승인본이 아니다. 전문 UI에는 실제 표시한 서버 버전을 연결해야 한다. Figma의 문구를 임의로 운영 승인본으로 등록하지 않는다.

## Figma 조사 범위

파일 키: `bDb6mnswp2gh0cmHKi13uU`. 이번에는 원본을 수정하지 않았다.

| 화면        | 노드                                                                              | 이번 확인                                                                                                    |
| ----------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 역할 선택   | [381:2292](https://www.figma.com/design/bDb6mnswp2gh0cmHKi13uU/?node-id=381-2292) | 디자인 컨텍스트·렌더 이미지·에셋 슬롯 확인. PC 사진 2열, 공동 브랜드, 호스트/게스트 CTA, 회사 정보·문의 푸터 |
| 호스트 메인 | [80:582](https://www.figma.com/design/bDb6mnswp2gh0cmHKi13uU/?node-id=80-582)     | 전체 렌더로 긴 섹션 순서·이미지 구성 확인. 개별 섹션의 고해상도 수치·에셋 대조는 구현 단계에 수행            |
| 게스트 메인 | [32:501](https://www.figma.com/design/bDb6mnswp2gh0cmHKi13uU/?node-id=32-501)     | 기획서의 최종 기준 노드 확인. 예산 배너·공간 사진·지역 카드·FAQ 구성 확인                                    |
| 개인정보    | [591:5063](https://www.figma.com/design/bDb6mnswp2gh0cmHKi13uU/?node-id=591-5063) | 전문 화면·표·복귀 버튼 확인. 현재 시안의 홈 복귀 및 일반 메뉴는 사용자 확정 사항에 맞춰 바꿔야 함            |

역할 선택 원본은 1920px 기준이며 헤더 88px, 본문 896px, 양쪽 사진 영역 각 960px다. 제목 Pretendard Bold 64/80px, CTA 22/32px를 확인했다. 이 고정 치수를 모바일에 그대로 적용하지 않는다.

모바일은 기획서 9.1을 기준으로 호스트→게스트 세로 카드, 소개 섹션 1열, 작은 하단 CTA, 폼 하단 제출, 개인방→거실·주방 사진 순서를 유지한다. 390px 중심으로 360~430px를 검증하며 세부 여백·폰트 수치는 시각 검증 대상이다.

각 신청·완료·걱정·가이드 화면의 상세 디자인 컨텍스트는 해당 단계에 추가 조회한다. 이번 전체 렌더 확인을 모든 화면의 시각 검증 완료로 해석하지 않는다. Figma 임시 에셋 URL을 소스에 넣지 않았고 에셋을 내려받지도 않았다.

## 재사용 후보와 차이

| 대상            | 기존 파일/디렉터리                                                                                                               | 적용 판단                                                                                                                        |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 카카오 주소검색 | `src/shared/ui/address-search-dialog/address-search-dialog.tsx`, `src/shared/lib/kakao-postcode/kakao-postcode.ts`               | 선택 결과와 sido·sigungu를 제공하고 SDK 응답 검증 있음. 호스트 견적에 재사용하며 계약 필드만 매핑                                |
| 날짜            | `src/shared/ui/calendar/calendar.tsx`                                                                                            | DayPicker 기반 Calendar 재사용. UTC 문자열 변환으로 날짜가 바뀌지 않게 처리. `date-field`의 네이티브 날짜 입력으로 대체하지 않음 |
| 입력/행동 UI    | `src/shared/ui/{text-field,checkbox,radio,select-tile,dropdown,btn-cta,modal}`                                                   | 외형·접근성 확인 후 조합. BtnCta의 loading/disabled, Modal의 포커스 제어 참고                                                    |
| 폰트·토큰       | `src/app/globals.css`, `src/app/layout.tsx`, `public/tokens/tokens.json`                                                         | Pretendard와 기존 토큰 재사용                                                                                                    |
| 소개 조합       | `src/pages-layer/host-home/host-home-page.tsx`, `src/pages-layer/guest-home/guest-home-page.tsx`                                 | 서버 조합 패턴 참고. 동일 layer의 페이지를 직접 import하지 않음                                                                  |
| 사진·일러스트   | `public/images/host-landing/`, `public/images/guest-landing/`, `public/images/landing/`, `public/images/logos/`, `public/figma/` | 기존 179개 public 파일 조사. 신한 로고·역할 사진·공통 예시 사진과 원본 일치 여부는 아직 미확정                                   |

그대로 재사용하면 요구와 달라지는 부분:

- `src/shared/api/http-client.ts`는 기존 `/api/bff`, `src/shared/api/server/backend-client.server.ts`는 기존 `API_BASE_URL`을 사용한다. 신한 경로·오류 DTO·세션을 별도로 구현해야 한다.
- `src/shared/lib/korean-phone.ts`는 +82 변환, 비숫자 삭제, 11자리 절삭이 있어 신한 계약 검증에 그대로 사용하면 안 된다.
- `widgets/site-layout`과 `widgets/responsive-header`는 일반 Navigation에 결합돼 있다. 신한 메뉴·공동 브랜드를 별도 구성해야 한다.
- 기존 게스트 소개 페이지는 Noto Sans KR·실매물 조회·회원 기능을 포함한다. 신한의 Pretendard·공통 예시 사진과 다르다.
- 기존 회원 약관 모달과 매물 초안 저장 기능은 신한 전문·네 신청의 단계 보존 요구를 그대로 충족하지 않는다. 개인정보 열람·복귀를 위한 흐름 상태가 필요하다.
- `scripts/sync-figma-assets.mjs`는 소스 전체의 임시 에셋 URL을 교체할 수 있다. 신규 에셋 작업에서 무조건 실행하지 않고 변경 대상을 확인한다.

## 미정 사항과 계약으로 정리된 사항

현재 확정된 공개 URL은 `/shinhan`, `/shinhan/host`, `/shinhan/guest`다. 신청·결과·전문의 세부 URL은 아직 제안이며 이번 단계에서 확정하지 않았다.

걱정 미동의·무응답 시 진행 버튼의 정확한 동작, 걱정 저장 실패 후 미저장 진행 UI, 예산 초기값 등 제안·후보 상태를 유지한다. 개인정보 열람 후 단계·입력·선택 유지 자체는 확정이며, 새로고침·새 탭·브라우저 재시작 후 초안 복원은 추가하지 않는다.

기획서의 기술 제안 중 익명 세션 2시간·HttpOnly 쿠키·BFF·멱등성·걱정 상태의 API 의미는 서버 계약 1.0.0으로 구체화됐다. 특히 기획서 3.8의 전체 가이드 열람에 대한 ‘건너뛰기 상태 기록안’은 현 계약의 ‘API 호출 없음’과 다르므로 그대로 구현하지 않는다. 화면 동작을 바꿔야 하는 추가 충돌은 별도로 확인한다.

## 다음 단계와 검증 단위

한 단계씩 구현·검증한 뒤 결과를 보고한다. 아래는 작업 분할안이며 신청 화면의 미정 동작을 확정하는 문서가 아니다.

1. **역할 선택 한 화면**: `/shinhan`, 공동 브랜드·푸터, 원본 사진, 모바일 세로 카드. 에셋 원본 대조 후 PC 1920/1440 및 모바일 390/360/430에서 확인한다. 호스트/게스트 목적지의 구현 여부를 보고에 명시한다.
2. **메인 소개**: `/shinhan/host`, `/shinhan/guest`를 한 화면씩 구현한다. 기존 섹션·에셋을 대조하고 확정 메뉴·모바일 CTA를 검증한다.
3. **신청 공통 기반**: 실제 계약 DTO/Zod, BFF·세션·멱등성·동의문, 신청 상태와 개인정보 복귀를 구현한다. 개발 예시 모드는 명시적으로 구분하고 운영 사용을 차단한다.
4. **네 신청을 하나씩**: 방 등록 → 호스트 견적·소개서 → 게스트 예산 → 게스트 수요 순서를 제안한다. 각 단위에서 저장 실패·재시도·완료·조회 전용·개인정보 복귀를 확인한다.
5. **공통 후속 및 연결 검증**: 걱정·가이드·신청 직후 내역을 완성하고 실제 로컬 신한 API로 전체 흐름을 확인한다. 예시 응답 검증과 실제 저장 검증을 구분해 보고한다.

이번 검증은 문서·버전·기존 코드·Figma 조사와 브랜치 상태 확인이다. 애플리케이션 코드를 변경하지 않았으므로 dev 서버 실행·PC/모바일 브라우저 검증·lint·타입 검사·빌드·API 호출은 수행하지 않았다. 첫 화면을 구현하는 다음 단계부터 개발 서버 검증을 수행한다. 운영 배포는 별도 지시 전 실행하지 않는다.
