# 이벤트 도메인 연결

학생 주소는 `https://hometogether.kr/event_1`, 운영 주소는 `https://hometogether.kr/event_1/ops`다.

Cloudflare Worker `hometogether-event-1-router`로 행사 경로를 별도 배포에 연결한다. 설정과 소스는 `cloudflare/event-router/`에 둔다.

2026-11-19에 Worker와 경로 연결을 설치했다. `EVENT_ORIGIN`은 행사 앱 배포 후 지정한다. 현재 `/event_1`은 본 사이트의 404 응답을 전달한다.

- 경로 패턴은 `https://hometogether.kr/event_1*`다. QR의 쿼리 문자열도 매칭하기 위해 끝에 와일드카드를 쓰고, Worker 내부에서 `/event_1`과 `/event_1/` 하위 경로만 처리한다.
- `/event_10` 등 유사 경로는 본 사이트로 전달한다. 루트와 기존 로그인은 해당 Worker 경로에 매칭되지 않는다.
- `EVENT_ORIGIN`에 행사 배포의 HTTPS 원본 주소를 지정한다. 값이 비어 있으면 현재 본 사이트로 요청을 전달한다.
- `/event_1/_router/health`는 배포 주소 연결 전에도 라우터 설치 상태를 확인할 수 있는 예약 경로다.
- 행사 앱은 별도 Next.js 설정에서 `basePath: "/event_1"`로 빌드한다. API·에셋·이미지도 같은 경로를 사용한다. 본 사이트용 Next.js 설정은 행사 앱의 빌드 설정과 구분해 관리한다.
- 운영 세션 쿠키는 `ht-event1-` 접두사와 `Path=/event_1`을 사용한다. 행사 배포로는 해당 쿠키만 전달한다. 운영 조회 권한은 행사 API에서 확인한다.

## 공개와 롤백

행사 앱을 먼저 배포해 폼·API·운영 화면을 검증하고, Worker의 `EVENT_ORIGIN`을 해당 배포의 원본 주소로 지정한다. 도메인 연결 후 POST 본문, 학교별 배포처 쿼리, 이미지·스크립트, 운영 접근, 기존 로그인과 주요 페이지를 검증한다. 원본 배포 보호를 사용한다면 Worker 요청을 허용하는 설정도 필요하다.

행사 연결을 되돌릴 때는 `EVENT_ORIGIN`을 비워 Worker를 재배포한다. 행사 종료 안내는 행사 앱에서 제공한다.

Cloudflare 연결 도구는 Worker 수정 권한이 부족해 403을 반환했다. 기존 로컬 Wrangler OAuth에는 Worker와 경로 쓰기 권한이 있어 이를 사용한다. [Cloudflare 경로 문서](https://developers.cloudflare.com/workers/configuration/routing/routes/)

## 연결 검증 결과

- `/event_1/_router/health`와 `?source=seoultech`를 붙인 주소에서 HTTP 200, `event-router-ready` 응답을 확인했다.
- 홈 `/`와 `/login`은 연결 전후 모두 HTTP 200이고, `/event_10`은 전후 모두 404다.
- 로컬 검증에서 POST 본문·쿼리 전달, 행사 경로 판별, 행사 쿠키만 전달, 리디렉션 주소 변환과 오류 응답을 확인했다. 실제 행사 앱과의 접수·운영 화면 연결 검증은 배포 후 진행한다.
- Worker의 `workers.dev`와 Preview URL은 비활성화했다. 기존 체크인 경로와 함께 행사 경로가 등록된 것을 API로 다시 확인했다.
- Worker 버전은 `ab20fd37-e5f3-4cd3-86c8-4b02b1fa0148`, 경로 ID는 `7a23bb250ead469898c4bdc27e284515`다.
- Wrangler 4.141.0은 업로드 후 `/workers/workers/` 호출에서 오류가 났다. 업로드된 버전을 확인하고 Cloudflare API로 경로 연결을 마쳤다. 후속 배포에서도 업로드와 경로 적용 상태를 각각 확인한다.
