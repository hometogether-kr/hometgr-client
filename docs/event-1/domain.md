# 이벤트 도메인 연결

학생 주소는 `https://hometogether.kr/event_1`, 운영 주소는 `https://hometogether.kr/event_1/ops`다.

`https://www.hometogether.kr/event_1`과 그 하위 경로는 같은 경로의 `hometogether.kr` 주소로 308 이동한다. 배포처 쿼리도 유지한다. `www` 접속 시 404가 발생하던 누락 경로를 2026-11-19에 추가했다. `www`의 다른 페이지는 이 연결 대상에 포함하지 않는다.

Cloudflare Worker `hometogether-event-1-router`로 행사 경로를 별도 배포에 연결한다. 설정과 소스는 `cloudflare/event-router/`에 둔다.

2026-11-19에 행사 앱을 별도 배포하고 Worker의 `EVENT_ORIGIN`을 `https://hometogether-event-1.vercel.app`로 지정했다. 공개 신청 주소와 운영 주소 모두 HTTP 200이다.

## 현재 배포

- Vercel 프로젝트는 `hometogether-event-1` (`prj_nsCPYqbhH3oRHxeFDFiZbLKZfDDz`)이며 본 사이트 `welcome-web`과 별개다. 팀은 `hometogethers-projects-5dc18f8f`다.
- 저장소 루트가 아니라 `apps/event-1`을 빌드한다. 설치 명령은 `pnpm --ignore-workspace install --frozen-lockfile`, 빌드는 `npm run build`다.
- 최초 Production 공개 배포는 `feat/event_1`의 `8d8984c1eac44fd9d6cc8784f48c063c79a13bce`, 배포 ID는 `dpl_99vDbMFygscuYAhzVLHKoDCnqjfN`이다. 운영 원본 주소는 `https://hometogether-event-1.vercel.app`이다.
- 행사 프로젝트의 Production 환경에만 DB 연결과 운영자 비밀번호·서명 키를 등록했다. 민감값은 Secret으로 저장했다. `EVENT_APP_ENV=production`, `EVENT_PUBLIC_URL=https://hometogether.kr`로 설정한다.
- 비밀번호는 배포 시 사용자가 설정한 값을 사용한다. 이후 로컬 환경 파일만 수정해도 공개 사이트에는 반영되지 않는다. 공개 비밀번호 변경은 이 행사 프로젝트의 환경 변수를 갱신한 뒤 새로 배포한다.

- 경로 패턴은 `https://hometogether.kr/event_1*`다. QR의 쿼리 문자열도 매칭하기 위해 끝에 와일드카드를 쓰고, Worker 내부에서 `/event_1`과 `/event_1/` 하위 경로만 처리한다.
- `https://www.hometogether.kr/event_1*`도 같은 Worker에 연결하되 정식 주소로 이동만 처리한다. 추가한 경로 ID는 `a9c4c12522914af2ab61b0e75cdddd1e`다.
- `/event_10` 등 유사 경로는 본 사이트로 전달한다. 루트와 기존 로그인은 해당 Worker 경로에 매칭되지 않는다.
- `EVENT_ORIGIN`에 행사 배포의 HTTPS 원본 주소를 지정한다. 값이 비어 있으면 현재 본 사이트로 요청을 전달한다.
- `/event_1/_router/health`는 배포 주소 연결 전에도 라우터 설치 상태를 확인할 수 있는 예약 경로다.
- 행사 앱은 별도 Next.js 설정에서 `basePath: "/event_1"`로 빌드한다. API·에셋·이미지도 같은 경로를 사용한다. 본 사이트용 Next.js 설정은 행사 앱의 빌드 설정과 구분해 관리한다.
- 운영 세션 쿠키는 `ht-event1-` 접두사와 `Path=/event_1`을 사용한다. 행사 배포로는 해당 쿠키만 전달한다. 운영 조회 권한은 행사 API에서 확인한다.

## 공개와 롤백

행사 앱을 먼저 배포해 폼·API·운영 화면을 검증하고, Worker의 `EVENT_ORIGIN`을 해당 배포의 원본 주소로 지정한다. 이번 배포에서는 원본 검증 후 Worker의 해당 바인딩만 변경했다. 도메인 연결 후 POST 본문, 배포처 쿼리, 이미지·스크립트, 운영 접근, 기존 로그인과 주요 페이지를 검증했다.

행사 연결을 되돌릴 때는 `EVENT_ORIGIN`을 비워 Worker를 재배포한다. 행사 종료 안내는 행사 앱에서 제공한다.

Cloudflare 연결 도구는 Worker 수정 권한이 부족해 403을 반환했다. 기존 로컬 Wrangler OAuth에는 Worker와 경로 쓰기 권한이 있어 이를 사용한다. [Cloudflare 경로 문서](https://developers.cloudflare.com/workers/configuration/routing/routes/)

## 연결 검증 결과

- `/event_1/_router/health`와 `?source=seoultech`를 붙인 주소에서 HTTP 200, `event-router-ready` 응답을 확인했다.
- 홈 `/`와 `/login`은 연결 전후 모두 HTTP 200이고, `/event_10`은 전후 모두 404다.
- 실제 공개 주소에서 모바일 신청 → Supabase 저장 → 완료 화면을 확인했다. 신청과 PENDING 작업이 각각 1건 생성됐으며 운영자 비밀번호 로그인 후 목록에서도 확인했다. 이 합성 신청과 발송 작업만 ID·source·테스트 이메일을 함께 지정해 정리했다. 알림톡은 실제 발송하지 않았다.
- PC 공개 화면의 모든 이미지 로드, 가로 넘침 없음과 브라우저 오류 없음을 확인했다. 공개 운영 화면에서는 조회 종료 후 다시 비밀번호를 요구하는 것도 확인했다.
- Worker의 `workers.dev`와 Preview URL은 비활성화했다. 기존 체크인 경로와 함께 행사 경로가 등록된 것을 API로 다시 확인했다.
- 최초 설치 당시 Worker 버전은 `ab20fd37-e5f3-4cd3-86c8-4b02b1fa0148`, 유지한 경로 ID는 `7a23bb250ead469898c4bdc27e284515`다. 공개 전환은 Worker 소스와 경로를 교체하지 않고 EVENT_ORIGIN 설정으로 진행했다.
- Wrangler 4.141.0은 업로드 후 `/workers/workers/` 호출에서 오류가 났다. 업로드된 버전을 확인하고 Cloudflare API로 경로 연결을 마쳤다. 후속 배포에서도 업로드와 경로 적용 상태를 각각 확인한다.
