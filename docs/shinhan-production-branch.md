# 신한 고객 웹 운영 연결 브랜치

2026-10-26 · `codex/shinhan-production-only` · 사용자 직접 main PR 생성 예정.

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

PR 생성·main 병합·운영 배포·환경변수 등록·서버 인증/DB/계약 변경·worker 실행·실제 알림톡/시트 쓰기는 수행하지 않는다.
