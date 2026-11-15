# 홈투게더 아파트 A4 광고지 QR 성과 측정

기준 소스는 `hometogether-kr/hometgr-client`의 `5333a15d46600aa6f1a1c5f0478293d13d6911df`입니다. Vercel `welcome-web` 운영 배포가 가리키는 커밋과 일치합니다. 아래 인쇄 주소로 운영 페이지를 조회해 HTTP 200, 리다이렉트 0회, 호스트 소개 화면과 UTM 유지 여부를 확인했습니다. 코드는 별도 작업 사본에 적용했습니다. [인쇄된 QR 주소](https://hometogether.kr/intro/host?utm_source=apartment_flyer&utm_medium=print&utm_campaign=host_a4_202611&utm_content=general) · [기준 커밋](https://github.com/hometogether-kr/hometgr-client/commit/5333a15d46600aa6f1a1c5f0478293d13d6911df)

## 실행

패치 파일을 받은 경우 기준 커밋의 깨끗한 작업 사본에서 먼저 적용 여부를 확인합니다. Node.js 22.18 이상과 pnpm을 사용합니다.

```sh
git apply --check /path/to/host-flyer-qr.patch
git apply /path/to/host-flyer-qr.patch
pnpm install --frozen-lockfile --ignore-scripts
pnpm exec playwright install chromium
pnpm verify:host-flyer
pnpm exec tsc --noEmit
```

검수 스크립트는 루프백 주소에 프런트엔드와 가상 API를 실행합니다. 테스트용 Google 태그 응답으로 브라우저의 이벤트 전달 내용을 검사합니다. 앱만 실행할 때는 기존 개발 설정인 `API_BASE_URL`, `APP_BASE_URL`을 설정하고 `pnpm dev`를 실행합니다.

| 환경변수                            | 적용 범위와 값                                                                                                                                                          |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_HOST_FLYER_GA4_ID`     | 빌드 전에 설정할 웹 스트림의 실제 `G-…` 측정 ID입니다. 비워 두면 광고지 분석과 동의 UI가 비활성화됩니다. Preview와 Production에는 각각 해당하는 스트림 값을 사용합니다. |
| `HOST_FLYER_CRM_FORWARDING_ENABLED` | BFF의 서버 환경변수입니다. 기본값은 꺼짐입니다. 백엔드에서 아래 헤더 계약과 저장을 구현하고 검증한 뒤에만 `true`로 설정합니다.                                          |

## 수집 규칙

웹 스트림 측정 ID가 있고 방문자가 호스트 소개 화면에서 통계 수집을 허용한 경우에 수집합니다. 같은 탭의 내부 이동과 새로고침에는 약 30분의 활동 기준으로 출처를 이어갑니다. 다른 외부 유입이나 다른 캠페인 파라미터가 들어오면 기존 출처를 지웁니다. 탭을 닫거나 통계 수집을 중지하면 이후 이벤트에 기존 출처가 붙지 않습니다. 카카오 로그인 시작과 콜백에서 같은 탭의 임시 참조값을 전달합니다. 참조값은 복귀 화면에서 지우고 방문 시각과 출처는 같은 탭의 세션에서 이어갑니다.

모든 맞춤 이벤트에는 허용한 `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `landing_path`가 들어갑니다. URL은 등록 단계 경로 또는 유효한 캠페인 쿼리로 조립합니다. 폼 값, 임의 쿼리, 전화·채팅 주소, 초안 ID와 접수 ID는 분석 페이로드에서 제외됩니다. 최근에 처리한 접수 참조는 중복 방지를 위해 같은 탭의 출처 세션에만 잠시 보관합니다.

| 이벤트              | 집계 단위                                                                                       | 주요 매개변수                        |
| ------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------ |
| `host_landing_view` | 동의한 출처 세션의 호스트 소개 화면 진입당 한 번. 새로고침은 새 화면 진입입니다.                | `campaign_code`                      |
| `host_scroll_depth` | 전경 탭에서 실제로 이동한 스크롤 가능 거리의 25·50·75·90·100% 도달을 화면 진입당 단계별로 한 번 | `percent`                            |
| `host_section_view` | 섹션 제목이 고정 헤더 아래 화면에 들어온 첫 순간을 화면 진입당 한 번                            | `section_id`, `section_order`        |
| `host_cta_click`    | 상담 열기, 방 등록 띠 배너와 고정 버튼, 푸터 전화와 카카오톡 선택                               | `cta_id`, `cta_position`, `cta_type` |
| `host_faq_open`     | 방문자가 닫힌 질문을 열 때마다 한 번                                                            | `faq_id`                             |
| `host_form_start`   | 상담 또는 방 등록에서 첫 유효한 입력·선택을 폼별로 출처 세션당 한 번                            | `form_id`                            |
| `generate_lead`     | 상담 접수 또는 방 등록의 유효한 성공 응답을 받은 뒤 접수 건당 한 번                             | `form_id`, `lead_type`               |

섹션 순서는 `hero` 소개, `benefits` 혜택, `process` 진행 과정, `community` 커뮤니티, `history` 연혁, `partners` 함께하는 기관, `guide` 가이드, `registration` 방 등록 안내, `top_questions` 대표 질문, `faq` 자주 묻는 질문, `customer_service` 고객센터입니다. 전화와 카카오톡 지표는 버튼 클릭 수입니다. 통화·상담 성사와 텍스트 읽기 여부는 각각 별도 데이터가 필요합니다.

## GA4 연결과 수신 확인

1. GA4 **관리 → 데이터 스트림 → 웹**에서 수집 대상 속성과 웹 스트림을 확인합니다. 이 구현으로 새 태그를 사용하는 경우 해당 스트림의 향상된 측정을 끕니다. 기본 GA4 자동 이벤트는 유지되며, 브라우저 경로 변경에 따른 자동 페이지뷰와 자동 폼·아웃바운드·90% 스크롤 이벤트는 제외됩니다. 코드가 직접 초기화한 태그는 `send_page_view: false`로 시작해 호스트 화면에서만 표준 `page_view`를 수동 전송합니다. [페이지뷰 설정](https://developers.google.com/analytics/devguides/collection/ga4/views?hl=en) · [향상된 측정 항목](https://support.google.com/analytics/answer/9216061?hl=en)
2. 사이트에 Google 태그가 새로 연결된 경우 기존 태그의 측정 ID, 동의 UI 및 수동 이벤트 라우팅을 먼저 확인합니다. 기존 `gtag`가 있으면 해당 태그에 지정한 ID로 맞춤 이벤트를 보내고 페이지뷰 초기화는 기존 설정을 따릅니다. GTM만 있고 `gtag`를 제공하지 않으면 두 번째 태그를 추가하지 않습니다. 그때는 GTM에서 동일한 이벤트 계약을 연결해야 합니다.
3. 운영 활성화 전에 분석 목적, Google Analytics 이용, 쿠키 및 보유 기간, 동의 철회 방법을 서비스의 안내와 맞춥니다. GTM 연결 시 기존 동의 설정도 확인합니다. 새로 초기화한 태그는 광고 관련 저장과 개인화를 끄고 통계 수집 동의 후에만 로드됩니다. [Google 태그 동의 설정](https://developers.google.com/tag-platform/security/guides/consent)
4. Preview에 테스트 웹 스트림을 설정해 빌드합니다. Tag Assistant로 디버그 모드를 켜고 광고지 URL로 접속합니다. 동의 전·거부·철회 화면과, 동의 후 랜딩·스크롤·CTA·제출을 각각 확인합니다. GA4 **관리 → DebugView**, **보고서 → 실시간**에서 `host_landing_view`, `generate_lead` 및 나머지 이벤트의 매개변수를 열어 확인합니다. 테스트 리드는 테스트 API에만 보냅니다. [DebugView 사용법](https://support.google.com/analytics/answer/7201382?hl=en)
5. 개인정보가 없는지 전송 URL과 이벤트 매개변수도 확인하고, 표준 페이지뷰가 화면 진입당 한 번인지 봅니다. 수신 확인 후 **관리 → 이벤트**에서 `generate_lead`를 주요 이벤트로 지정합니다. 코드와 태그에서 별도 제출 전환을 동시에 설정하면 중복되므로 이 이벤트를 기준으로 삼습니다.

## ‘아파트 광고지 성과’ 탐색 보고서

**관리 → 데이터 표시 → 맞춤 정의 → 맞춤 측정기준 만들기**에서 범위를 모두 **이벤트**로 설정합니다. 이름은 한글로 지정할 수 있고, 이벤트 매개변수는 코드와 동일하게 입력합니다.

| 표시 이름 예시     | 매개변수                             |
| ------------------ | ------------------------------------ |
| 광고지 캠페인·버전 | `campaign_code`, `utm_content`       |
| 스크롤 도달 단계   | `percent`                            |
| 섹션과 순서        | `section_id`, `section_order`        |
| 버튼·위치·유형     | `cta_id`, `cta_position`, `cta_type` |
| 질문·폼·접수 유형  | `faq_id`, `form_id`, `lead_type`     |

`percent`와 `section_order`는 순서·단계 구분용으로 등록합니다. 맞춤 측정항목에서 합계를 내면 도달률이 왜곡됩니다. 이벤트 수신과 맞춤 정의 생성 후 탐색 데이터 반영에 24~48시간이 걸릴 수 있습니다. [맞춤 측정기준 등록](https://support.google.com/analytics/answer/14239696?hl=en)

1. **탐색 → 자유 형식 → 아파트 광고지 성과**를 만들고 기간을 설정합니다. 유입 표에는 **세션 수동 소스** `apartment_flyer`, **세션 수동 매체** `print`, **세션 수동 캠페인 이름** `host_a4_202611`을 적용합니다. 행은 날짜와 **세션 수동 광고 콘텐츠**로 두고 값에 **세션, 총 사용자, 신규 사용자, 참여 세션**을 넣습니다. 콘텐츠에서 `general`, `apt001`, `flyer_v2`를 선택할 수 있습니다. [세션 수동 캠페인 측정기준](https://support.google.com/analytics/answer/14264492?hl=en)
2. 정확한 광고지별 전환율은 **세션 세그먼트** 두 개로 계산합니다. 분모는 같은 이벤트 안에서 `host_landing_view`와 해당 `utm_content`가 일치한 세션입니다. 분자는 그 조건에 더해, 같은 세션에 `generate_lead`와 동일한 `utm_content`가 일치한 이벤트도 있는 세션입니다. 두 이벤트는 각자 조건 그룹으로 만들고 그룹 간 AND를 사용합니다. 기간과 코드를 동일하게 두고 **분자 세션 ÷ 분모 세션 × 100**을 계산합니다. 분모가 0이면 빈 값으로 표시합니다. 한 세션이 상담과 등록을 모두 완료해도 전체 전환율에서는 한 번, 유형별 표에서는 각각 한 번으로 집계합니다. [세션 세그먼트와 조건 범위](https://support.google.com/analytics/answer/9304353?hl=en)
3. 도달률 표는 분자의 `generate_lead` 조건을 `host_scroll_depth`와 각 `percent`, 또는 `host_section_view`와 각 `section_id`로 바꿉니다. 도달한 **세션 수·총 사용자 수**와 유입 세션·사용자 대비 비율을 각각 확인합니다. 행의 `section_order`로 화면 순서를 재현할 수 있습니다. 버튼·폼 표에서는 이벤트 이름과 `cta_id`, `cta_position`, `form_id`, `lead_type`으로 나눠 **이벤트 수**와 **해당 이벤트가 있는 세션 수**를 함께 봅니다.
4. GA4의 세션 수동 광고 콘텐츠는 세션 시작 시점의 값입니다. 같은 GA4 세션에서 서로 다른 광고지 URL을 연 경우에는 전환율 세그먼트에서 이벤트의 `utm_content`로 각 코드를 일치시킵니다. 코드별 세션 수를 더하면 같은 세션이 중복될 수 있으므로 전체에는 콘텐츠 조건을 뺀 별도 세션 세그먼트를 사용합니다.

지표명은 **QR 주소 랜딩 세션**, **추정 사용자**, **스크롤 도달률**, **전화/카카오톡 클릭**, **접수 완료**로 사용합니다. 집계는 QR 주소가 열린 브라우저를 기준으로 하며 카메라 스캔 횟수를 알 수 없습니다. 동의 거부, 광고 차단, 기기 중복, 표본화 및 GA4의 사용자 추정 방식이 수치에 영향을 줍니다. 실제 접수 총수의 원천은 운영 CRM입니다. 보고서는 GA4 속성 접근 권한이 있는 사람에게만 공유합니다.

## CRM 저장 계약

공개 개발 OpenAPI의 상담 요청 DTO와 방 등록 제출 DTO에는 마케팅 출처 입력 필드가 없습니다. 브라우저가 방문자가 동의한 유입 출처와 최초 방문 시각(`first_landed_at`)을 `X-Host-Flyer-Attribution`에 담습니다. BFF는 서버 플래그를 켰을 때만 값의 구조와 허용 목록을 재검증하고 아래 두 POST 경로에 전달합니다. 현재 API의 JSON 본문 형식은 유지됩니다. [개발 OpenAPI](https://dev-api.hometogether.kr/docs-json)

| 엔드포인트                                 | 연결할 기존 레코드             |
| ------------------------------------------ | ------------------------------ |
| `POST /host-consultation-requests`         | 성공 응답 `id`의 상담 요청     |
| `POST /host/rooms/drafts/{draftId}/submit` | 성공 응답 `roomId`의 등록 요청 |

백엔드에서 JSON 헤더의 여섯 키를 동일하게 검증하고, 기존 상담 행 생성 또는 등록 상태 변경과 같은 트랜잭션에서 출처를 저장합니다. 신규 컬럼이 필요한 경우 기존 행을 유지하는 nullable 저장 구조를 추가하고, 기존 중복 처리와 초안 버전 확인을 이어갑니다. 같은 접수를 재시도했을 때 먼저 기록한 출처가 덮어쓰이지 않도록 하고, 기존 레코드 ID로 조회해 값을 확인합니다. 헤더는 사용자가 바꿔 보낼 수 있는 마케팅 힌트로만 허용하며 인증이나 권한에는 사용하지 않습니다. CRM 저장과 관리자 도구 노출은 백엔드 소스·DB 권한이 필요한 후속 작업입니다.

## 다음 인쇄분의 QR 생성

설명·수량·배포일은 예시 파일 형식에 맞춰 계획값을 입력합니다. 수량과 날짜가 미정이면 `null`을 입력합니다. 설명에는 개인 이름, 전화번호 등을 넣지 않습니다.

```json
[
  { "code": "apt001", "description": "배포 장소 A", "quantity": null, "distribution_date": null },
  {
    "code": "flyer_v2",
    "description": "A4 문구 개정판",
    "quantity": null,
    "distribution_date": null
  }
]
```

```sh
pnpm qr:host-flyer ./distribution.json ./host-flyer-qr-output
```

아직 없는 출력 폴더를 지정합니다. 허용 코드는 `general`, `apt`에 숫자 3~~6자리, `flyer_v`에 1~~999입니다. 같은 코드의 중복 입력을 거절합니다. 각 코드의 PNG와 벡터 SVG는 검정·흰색과 사방 4모듈 여백으로 출력하며, UTF-8 CSV에는 코드·설명·수량·배포일·파일명·목적지가 들어갑니다. 예시 산출물은 `general`의 인쇄 주소를 재현합니다. 인쇄업체 편집 파일에서는 여백을 유지합니다.

## 검수 결과와 남은 작업

| 검사               | 결과                                                                                                                                                                                                                   |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 운영 QR URL        | HTTP 200. 리다이렉트 없이 호스트 소개가 열리고 URL의 UTM이 유지됐습니다.                                                                                                                                               |
| 모바일 Chromium    | 390 × 844 화면에서 랜딩과 표준 페이지뷰 각 1회, 화면에 들어온 섹션 제목, 스크롤 5단계, 상담·등록·전화·카카오톡 버튼과 FAQ 펼치기를 확인했습니다.                                                                       |
| 상담 접수          | 빈 폼, 닫기, 409, 500, 잘못된 200 응답에서 전환 0회였습니다. 유효한 201 응답에서만 전환 1회였습니다. 같은 접수 응답을 다시 받거나 새로고침 후 재현해도 추가 전환이 없었습니다.                                         |
| 방 등록            | 로그인으로의 내부 이동과 새로고침에서 출처가 유지됐습니다. 가상 로그인 세션과 초안을 사용해 실제 최종 등록 화면에서 500과 201을 재현했습니다. 신청 전 및 오류 때 전환 0회, 성공 응답에서 전환 1회였습니다.             |
| 동의·출처·개인정보 | 미동의·거부·철회, 비활성 상태로 전환한 탭, 다른 캠페인으로 같은 화면 이동, 중복 UTM, 아파트 코드와 임의 개인정보 쿼리를 검증했습니다. 기존 Google 태그를 재사용하는 조건에서 추가 초기화와 표준 페이지뷰가 없었습니다. |
| 기존 폼과 BFF      | 측정 ID가 없을 때 상담 접수가 정상 동작했습니다. 가상 API에서 허용한 출처 헤더와 두 제출 경로, 플래그 기본 꺼짐, 허용 목록 밖 필드와 값 차단을 확인했습니다.                                                           |
| QR                 | PNG와 렌더링한 SVG를 각각 읽어 공통 인쇄 주소와 일치함을 확인했습니다. `apt001`과 `flyer_v2`도 읽었으며 PNG의 흰 여백 4모듈과 중복 코드·허용 범위 밖 코드·잘못된 날짜 거절을 확인했습니다.                             |
| 빌드와 검사        | Next.js 프로덕션 빌드와 TypeScript, 변경 파일 ESLint 및 패치 공백 검사를 통과했습니다. 상담 버튼 파일에 기존 외부 폰트 로드 관련 ESLint 경고 1건이 있습니다.                                                           |

브라우저의 이벤트 전달은 가상 GA 태그로 확인했습니다. 실제 카카오 계정으로 OAuth 전체 흐름을 완료하는 검수는 남아 있습니다. 실제 GA4 속성에 로그가 도착하는지 확인하려면 웹 스트림의 측정 ID와 GA4 접근 권한이 필요합니다. 운영 활성화는 Vercel의 환경변수와 배포 권한, 분석 안내 검토가 필요합니다. CRM에서 실제 접수 출처를 조회하려면 백엔드 구현과 승인된 테스트 레코드가 필요합니다. 이번 작업으로 운영 코드, 데이터, 설정을 변경한 내역은 없습니다.

## 수정 파일

- `docs/host-flyer-qr-analytics.md`
- `package.json`
- `pnpm-lock.yaml`
- `scripts/generate-host-flyer-qr.mjs`
- `scripts/verify-host-flyer.mjs`
- `src/app/api/bff/[...path]/route.ts`
- `src/app/layout.tsx`
- `src/domains/marketing-attribution/host-flyer-browser.ts`
- `src/domains/marketing-attribution/host-flyer.ts`
- `src/domains/marketing-attribution/model/host-flyer-campaign.ts`
- `src/domains/marketing-attribution/model/host-flyer-session.ts`
- `src/domains/marketing-attribution/model/host-flyer-tracking.ts`
- `src/features/request-host-consultation/api/request-consultation.api.ts`
- `src/features/request-host-consultation/ui/host-consultation-button.tsx`
- `src/features/request-host-consultation/ui/host-consultation-form.tsx`
- `src/features/save-listing-draft/api/draft-command.api.ts`
- `src/features/track-host-flyer/host-flyer.tsx`
- `src/features/track-host-flyer/index.ts`
- `src/pages-layer/host-home/host-home-page.tsx`
- `src/pages-layer/host-home/ui/host-benefits.tsx`
- `src/pages-layer/host-home/ui/host-community.tsx`
- `src/pages-layer/host-home/ui/host-guide.tsx`
- `src/pages-layer/host-home/ui/host-hero.tsx`
- `src/pages-layer/host-home/ui/host-history.tsx`
- `src/pages-layer/host-home/ui/host-partners.tsx`
- `src/pages-layer/host-home/ui/host-process.tsx`
- `src/pages-layer/host-home/ui/host-questions.tsx`
- `src/pages-layer/listing-step-10-confirm/listing-step-10-page.tsx`
- `src/shared/api/http-client.ts`
- `src/widgets/footer/footer.tsx`
- `src/widgets/site-layout/site-layout.tsx`
