# 신한 고객 웹 운영 연결 브랜치

2026-10-26 · `codex/shinhan-production-only` · 최초 main PR #40 반영 이후 연결 보완 작업.

현재 상태는 마지막 **Cloudflare 연결 코드 보완** 절을 따른다. 앞의 준비·차단 기록은 당시 이력이다.

## 선별 기준

- 운영/main 기준: `6067ffe1943dc195794784c9ea00a2243fa1a61e`.
- dev 참조: `2c1d2ca5c874e9cee599c6d2b8145c1b114bf866`.
- `86c4f731575a007ec74be088c688b69f991e4def`는 신한 소스 40개와 관련 결과 문서 4개만 선별한 커밋이다. dev 전체 병합이 아니다.
- 실행 코드 출처: `afb0b13`, `b91c9cd`, `3400d37`, `0cb50ff`, `4722e01`. 네 신청 유형의 기존 검증 기록을 보존한다.
- 일반 홈투게더 페이지·UTM·계정·매물·일반 BFF·전역 CSS·공유 의존성은 포함하지 않는다. 신한에서 쓰는 카카오 주소의 address/sido/sigungu, 모달 옵션과 이미지는 main에 이미 있어 공통 파일을 추가 수정하지 않았다.
- 원본 dev의 미추적 기획서 2개와 UTM 문서 2개는 그대로 두고 이 브랜치에 포함하지 않았다.

## 추가한 운영 연결 코드

- `SHINHAN_APP_ENV=production`은 Vercel Production과 `https://shinhan-api.hometogether.kr`에만 연결한다. dev는 Vercel Preview와 dev API에만 연결하며 서로 자동 대체하지 않는다.
- 원격 세션 응답은 dev/production 모두 bootstrap 계약 `1.1.0`을 사용한다. 필수 동의·걱정은 `2.0.0`, 신청·현재 내역·소개서는 `1.0.0`을 유지한다.
- 서버가 확인한 연결 가능 상태를 작은 Provider로 전달해 소개 화면의 신청·검색·지역 선택 버튼을 활성화한다. 설정이 없거나 허용되지 않은 호스트에서는 버튼을 비활성화하고 신청 경로를 공개하지 않는다.
- 실사용 경로는 `/shinhan/host/estimate`, `/shinhan/host/register`, `/shinhan/guest/budget`, `/shinhan/guest/demand`, `/shinhan/application`이다. 기존 `/shinhan/dev/*` 실제 신청 경로와 개인정보 전문 복귀 경로도 유지한다.
- 원격에서는 준비되지 않은 서버 동의 전문을 개발용 전문으로 대체하지 않는다. 개발 예시 화면·결과는 계속 개발 환경에 한정한다.
- 실제 저장 성공 후에만 결과·접수 화면으로 이동한다. 접수와 안내 메시지 전달은 구분하며 조회·가이드·걱정 저장으로 신규 신청을 만들지 않는다.

## 운영 설정의 범위와 남은 연결 조건

기준은 서버 인계 `C:/Users/PC/Documents/GitHub/shinhan-runtime-split/docs/customer-web-handoff.md` 1.6.0, 원격 세션 문서 1.1.1/bootstrap 1.1.0, 동의·걱정 2.0.0, 신청 1.0.0, 런타임 분리 1.0.2다. 인계에서 운영 API 배포는 확인했으며 고객이 재배포하거나 DB를 변경하지 않았다.

같은 인계에는 서버 담당이 2026-10-25 23:14:40 KST 검증 신청 6건과 종속 작업 16건을 정리했다는 기록이 있다. 기존 dev 결과 문서의 ID·작업 수는 과거 검증 근거이며 현재 DB 상태로 재해석하지 않는다. 고객 작업에서 데이터를 삭제하거나 DB를 재조회하지 않았다.

이 브랜치는 **현재 확정된 Vercel 직접 연결 계약**만 지원한다. `hometogether.kr`와 `www.hometogether.kr`는 2026-10-26 00:16 KST 읽기 확인에서 Cloudflare 경유였다. 이 도메인을 `vercel-direct`로 잘못 등록하면 연결을 거절한다. CF 헤더 신뢰, DNS/프록시 변경, 도메인 자동 이동을 임의로 추가하지 않았다. 기존 도메인을 사용할 경우 서버 담당의 ingress 계약 보완과 해당 경계 검증이 필요하다. 직접 연결된 운영 Vercel origin을 사용하는 선택도 배포 단계에서 명시적으로 확정해야 한다.

`welcome-web` Production에 필요한 변수는 다음과 같다. 이번 브랜치 작업에서는 등록·변경하지 않았다. Preview/dev의 기존 변수와 키도 유지한다.

| 변수 | 운영 설정 |
| --- | --- |
| `SHINHAN_APP_ENV` | `production` |
| `SHINHAN_API_ORIGIN` | `https://shinhan-api.hometogether.kr` |
| `SHINHAN_CLIENT_IP_MODE` | 현재 계약은 `vercel-direct`만 지원 |
| `SHINHAN_ALLOWED_ORIGINS` | 직접 연결을 검증한 정확한 운영 HTTPS Vercel origin만 지정 |
| `SHINHAN_BRIDGE_SECRET` | 서버 담당이 운영 public bridge를 안전하게 공급 |
| `SHINHAN_CLIENT_IP_HMAC_SECRET` | 고객 운영 IP HMAC 전용 독립 키 |
| `SHINHAN_BFF_STATE_SECRET` | 고객 운영 쿠키/CSRF 전용 독립 키 |

세 비밀값은 서로 달라야 하며 dev·관리자·DB·NHN 키를 재사용하지 않는다. 키 공급은 실제 배포 범위가 확정된 후 서버 담당에게 요청한다. 토큰·키를 채팅·문서·Git에 복사하지 않는다. **운영 API 연결 코드 준비와 실제 운영 접수 활성화는 별개**이며, 이 브랜치를 합치는 것만으로 누락된 설정이 자동 생성되지는 않는다.

## 이번 변경 검증

- 운영 BFF 변경 경계 모의 검사 31/31 통과. Production/Preview/API 조합, 잘못된 설정, 환경별 쿠키·HMAC, Origin·CSRF, bootstrap 응답 버전, 잘못된 upstream 환경/버전과 개발용 동의 응답 거절을 확인했다.
- 위 검사는 합성 값과 모의 fetch 5회만 사용했고 실제 API·DB 요청은 0회다. 실제 운영 비밀값의 출처·독립성과 운영 저장 성공을 검증한 결과가 아니다.
- 기존 네 신청 유형의 실제 저장·재시도·전체 화면 검사는 반복하지 않았다.
- 변경한 TypeScript 파일 ESLint와 타입 검사 통과. 기존 의존성을 재사용한 `next build --webpack` 1회가 성공했고 신규 실사용 경로 5개와 기존 경로가 빌드 목록에 포함됐다. 로컬 상위 디렉터리의 추가 lockfile로 인한 workspace-root 경고는 있었으며 공통 Next 설정·lockfile은 변경하지 않았다.
- main 기준 최종 변경은 신한 경로 66개(소스 61개·문서 5개)이며 공통 파일·의존성·일반 서비스의 추가 diff는 0개다. `git diff --check` 통과, 원본 dev와 미커밋 문서 4개 보존을 확인했다.
- 로컬 개발 서버에서 `/shinhan/guest`의 SSR 200을 확인했다. 브라우저 자동화 CDP 응답 시간 초과로 새 버튼 클릭·새 URL의 개인정보 왕복·PC/모바일 시각 확인은 완료로 기록하지 않는다. 기존 UI 검증 완료 이력과 구분한다. 이번 확인용 개발 서버만 종료하고 기존 도구·의존성·캐시는 유지했다.

위 브랜치 준비 단계에서는 PR 생성·main 병합·운영 배포·환경변수 등록·서버 인증/DB/계약 변경·worker 실행·실제 알림톡/시트 쓰기를 수행하지 않았다.

## 후속 운영 활성화 작업 — 2026-10-26

- 이후 사용자 PR #40이 main `9a292dc9413858c65db6665f13e59aa3238ecd84`로 반영되었고, Vercel Production `dpl_8SQAhxTazapqfMACc49xxSF1Tuma`는 READY다. 앞의 준비 단계와 구분한다.
- 사용자 후속 지시로 신청 버튼 비활성 문제를 해결하는 중이다. 확인 당시 신한 연결 변수 7개는 Preview/dev에만 있었고 Production에는 없었다. 알림톡 심사 상태가 버튼을 비활성화한 원인은 아니다.
- 고객 담당은 `welcome-web` Production에 비밀 아닌 `SHINHAN_APP_ENV=production`, `SHINHAN_API_ORIGIN=https://shinhan-api.hometogether.kr` 두 변수를 등록했다. Preview/dev와 일반 서비스 변수는 변경하지 않았다.
- 운영 bridge·고객 IP HMAC·쿠키 상태 HMAC은 서버 담당에게 안전한 공급을 요청했다. 최초 요청 당시 서버 담당은 관리자 주소 연결에 집중하며 이 작업을 보류했다. 이후 등록 완료 상태는 아래 최신 인계를 따른다. 키 값은 이 문서·Git·채팅에 기록하지 않는다.
- 현재 본 도메인은 Cloudflare 경유이므로 기존 `vercel-direct` 설정만으로 활성화하지 않는다. 서버 담당에게 신한 경로 한정 인증 ingress 계약을 요청했다. 현재 Cloudflare 연결에는 Transform Rules·Zone Settings·Workers Routes 권한이 없어 조회가 403으로 거절됐으며 사용자에게 필요한 권한 추가를 요청했다. DNS·프록시·기존 규칙은 변경하지 않았다.
- 아직 운영 신청 활성화·신규 재배포 완료가 아니다. 계약을 추측한 고객 실행 코드 변경도 하지 않았다. 계약·키·접근 권한이 준비되면 고객 BFF 연결 경계만 확인한다. 이미 완료된 네 유형 저장 검증은 반복하지 않으며, worker·실제 알림톡·시트 실행은 계속 이번 작업 범위 밖이다.

## Cloudflare 연결 코드 보완 — 2026-10-26

### 기준과 외부 준비 상태

- 서버 계약: `C:/Users/PC/Documents/GitHub/shinhan-runtime-split/docs/customer-production-ingress-contract-v1.md` **1.0.0**.
- 서버 인계: 같은 디렉터리의 `customer-web-handoff.md` **1.7.0**, 최신 0절 우선. 원격 세션 문서 1.1.1/bootstrap 1.1.0, 동의·걱정 2.0.0, 신청·조회 1.0.0 유지.
- 사용자와 서버 인계에 따르면 welcome-web Production 기본 변수 7개는 등록 완료다. 운영 bridge 동의 GET 200 및 외부 연동 차단 확인은 **서버 담당의 결과**이며 고객이 다시 실행하지 않았다.
- 여덟 번째 서버 전용 변수 `SHINHAN_CF_INGRESS_SECRET`과 CF 규칙은 아직 미완료다. 이 키가 없으면 새 코드도 화면 unavailable/API 503을 유지한다.

### 고객 코드 변경

- `cloudflare-vercel`을 production의 정확한 API·Vercel Production·두 HTTPS 본도메인에만 허용한다. ingress/IP HMAC/상태 키는 각각 64자리 소문자 hex이고 기존 bridge 포함 네 값은 서로 달라야 한다. 기존 local/vercel-direct 환경 조건은 유지한다.
- SSR 준비 상태는 환경변수·설정된 Host·단일 프로토콜을 확인한다. 원격은 Vercel의 `x-forwarded-proto`가 정확히 `https`여야 하며 local은 설정된 loopback origin의 프로토콜과 일치해야 한다. SSR은 요청의 ingress key·visitor IP·CF-Worker를 인증하지 않는다. 필수 설정을 갖춘 HTML/RSC 요청은 비밀 헤더 없이 remote가 된다.
- 모든 허용된 `/api/shinhan/*` 동작은 메타데이터 검사 다음, 본문·쿠키·세션 재사용·upstream 처리 전에 Cloudflare 검사를 수행한다. 동의 조회·세션 생성/재사용/reset·current·신청·소개서·걱정 저장을 포함한다.
- 요청 proof는 64자리 소문자 hex 그대로 ASCII Buffer/timingSafeEqual로 비교한다. 공백·대문자·중복 결합을 보정하지 않는다. CF-Worker는 빈 값도 존재하면 거절한다. 검증된 `x-shinhan-visitor-ip`만 기존 IPv4/IPv6 정규화와 UTF-8 키 기반 HMAC에 사용하며 다른 IP 헤더로 대체하지 않는다.
- ingress 실패는 TEMPORARILY_UNAVAILABLE 503/no-store이며 upstream·쿠키 변경이 없다. 기존 Origin/CSRF의 403, HttpOnly 쿠키·고정 만료·멱등 키와 재시도 본문은 유지한다. ingress 비밀·방문자 IP는 AWS/브라우저 응답에 전달하지 않는다.

### 검증 및 남은 단계

- 변경 경계 모의 검사 **63/63 통과**(2026-10-26 11:24 KST). SSR/API 분리, 모든 API action의 키 누락·오류·중복 차단, 유효 세션 재사용 우회 방지, 잘못된 host/protocol, 빈 CF-Worker 포함 거절, IPv4/IPv6/IPv4-mapped IPv6와 다른 IP 헤더 fallback 금지, 기존 Origin/CSRF 403, dev/local 최소 호환 검사 4개를 확인했다.
- 거절 요청은 본문 소비·새 쿠키·쿠키 삭제·upstream 호출 모두 0회였다. 모의 fetch 총 9회이고 실제 네트워크·API·DB 쓰기는 **0회**다. 합성 fixture는 현재 Zod 응답 스키마로 확인했고 실행 전후 소스 hash가 일치했다.
- Web Headers가 제거할 수 있는 원시 공백은 검사 함수의 get/has 대역으로 따로 검증했다. 실제 네트워크에서 이미 정규화된 원시 헤더까지 관측했다는 뜻은 아니다.
- 재현 스크립트: `C:/Users/PC/.codex/visualizations/2026/10/22/01a16209-7b74-77d0-8d98-02e59f6e504a/shinhan-production-ingress-check.cjs`. 같은 디렉터리의 `shinhan-production-ingress-report.json`에 항목과 소스 hash를 기록했다. 새 테스트 프레임워크나 의존성을 추가하지 않았다.
- 변경 TypeScript 4개 파일 ESLint, `tsc --noEmit --incremental`, `git diff --check` 통과. 첫 타입 검사에서는 worktree 캐시 쓰기 권한 오류가 있어 동일 검사를 쓰기 가능한 실행으로 마쳤다. 독립 읽기 리뷰에서도 계약과 충돌하는 문제를 찾지 못했다.
- 변경은 신한 BFF 소스 4개와 이 기록 1개뿐이다. 원본 dev의 미추적 기획서·UTM 문서 4개는 보존했다. 로컬 커밋만 준비하며 원격 푸시·배포는 수행하지 않는다.
- 이전 네 유형 저장·계산·전체 UI 검사와 이전 전체 BFF 검사는 반복하지 않았다. 이번 결과는 실제 브라우저·Cloudflare 경유 또는 운영 API 연결 검증을 대신하지 않는다.

실제 CF 규칙/순서·cache bypass·TLS·Worker/기존 변환 규칙, 양쪽 ingress key 설정, 운영 도메인의 IPv4/IPv6 경로는 아직 확인하지 않았다. 이 준비 완료를 확인하기 전에는 푸시로 자동 배포를 유발하거나 수동 재배포·접수 활성화를 하지 않는다. 이후 배포 시 동의·CSRF·익명 세션과 직접 Vercel 별칭 차단만 우선 확인한다. 실제 신청·알림톡·시트 실행은 이번 변경에서 하지 않는다.

일반 홈투게더·공유 의존성·서버 인증·DB·공통 계약은 변경하지 않는다. 서버 계약 변경 요청도 이번 구현에는 필요하지 않았다. 기존 원본 dev의 다른 작업과 도구·의존성·캐시는 보존한다.
