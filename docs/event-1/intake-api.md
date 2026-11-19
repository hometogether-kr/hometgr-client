# 행사 신청 화면·DB·접수 API

행사 앱은 `apps/event-1/`에서 독립 빌드한다. 행사 전용 Next.js 설정은 `basePath: "/event_1"`이며 기존 본 사이트의 라우트와 배포 설정은 별도로 관리한다.

## 학생 화면 구현과 확인

2026-11-19, `feat/event_1`에서 학생 신청 화면을 구현했다. 로컬 확인 주소는 `http://127.0.0.1:3211/event_1`이다. 개발은 앱 폴더에서 `npm run dev:supabase`, 빌드 결과 확인은 `npm run build` 후 `node scripts/with-supabase-env.mjs start -H 127.0.0.1 -p 3211`로 실행한다. 외부 배포와 Cloudflare의 행사 앱 원본 주소 지정은 아직 하지 않았다.

- 대상 프레임: 대학 입력 Desktop `832:519` / Mobile `832:670`, 연락처 Desktop `832:563` / Mobile `832:714`, 완료 Desktop `832:620` / Mobile `832:771`.
- 디자인 확인값: 데스크톱 1440×969, 헤더 72px, 콘텐츠 600px + 간격 120px + 폼 480px, 폼 패딩 36px·모서리 28px. 모바일 너비 390px, 헤더 64px, 좌우 여백 24px, 폼 패딩 24px·모서리 20px. 입력과 CTA 높이 60px, Pretendard와 기존 primary500 색상 `#227dff`를 사용한다.
- 구현 판단값: 768px 미만에서 모바일 배치를 사용하고 중간 너비에는 유동 열 너비를 적용한다. 오류 문구·요청 중·연결 실패 상태는 원본에 없어 동작에 맞게 추가했다. 기존 공통 입력·버튼은 본 사이트의 Tailwind 설정에 의존하므로 독립 앱은 자체 CSS Modules로 디자인 값을 적용한다.
- 에셋: Figma에서 원본 로고, 방·거실·주방 사진, 완료 체크 SVG를 앱의 `public/images/`에 내려받았다. 로고 155×28px, 체크 28×28px 원본 비율을 유지하고 사진은 디자인대로 가운데 기준 cover로 표시한다.
- 요청 반영: 완료 CTA는 `처음으로` 하나이며 대학·전화·이메일·동의를 모두 초기화한다. 모바일 원본의 중복 링크 제거로 완료 카드가 40px 짧다.
- 확인: 1440px·390px에서 세 단계 모두 디자인과 비교했다. 320px·768px에서도 가로 넘침이 없었고 원본 에셋이 정상 로드됐다. 빈 필드 안내, 전화번호 마스킹, 동의, 대학 단계로 돌아갔을 때 연락처 유지, 연락처를 가린 완료 표시와 초기화를 확인했다.
- 실제 흐름: 브라우저 → 접수 API → Supabase → 완료 화면을 개발 서버와 운영용 빌드에서 확인했다. 로컬 연결을 끊으면 입력 내용을 유지하고 재시도 버튼을 표시하며, 복구 후 같은 제출 키로 정상 접수된다. 합성 신청 2건 각각 신청 1건·PENDING 작업 1건을 확인했고 해당 ID와 source로 테스트 자료만 정리했다. 알림톡은 발송하지 않았다.
- 최종 검사: ESLint, 운영용 빌드의 TypeScript 검사·정적 페이지 생성 통과. 브라우저 콘솔 오류 없음. 브라우저 정적 번들에 DB 환경 변수·행사 계정·pooler 주소가 포함되지 않은 것도 확인했다.

실제 공개 전 개인정보 동의 본문·보관 기간·행사 종료일 확정이 필요하다. 현재 체크박스는 확정 Figma 문구를 사용하며, 동의 상세 본문을 임의로 만들지 않았다. 실제 iOS Safari 기기와 알림톡 발송은 검증 범위에 포함하지 않았다.

## 운영자 조회

`/event_1/ops`에서는 최신 접수순으로 **학교·전화번호·이메일 세 항목만** 표시한다. 운영자 목록에서는 연락처를 가리지 않는다. 검색·상세 보기·알림톡 상태 표시는 생략하고, 새로고침과 50건 단위 페이지 이동만 지원한다. 모바일에서는 같은 정보를 카드로 표시한다.

- 인증은 행사 전용 접근 코드 하나로 처리하며 기존 회원·관리자 로그인과 연결하지 않는다. 앱 폴더에서 `npm run ops:configure`를 실행하면 기존 `.env.supabase.local` 또는 `.env.local`에 `EVENT_OPS_ACCESS_KEY`를 생성한다. 기존 코드는 덮어쓰지 않고, 실제 코드 값은 로그·Git에 남기지 않는다.
- 접근 코드는 서버에서만 비교한다. 성공하면 `ht-event1-ops` 서명 쿠키를 발급하며 유효기간은 8시간이다. HttpOnly·SameSite Strict·`/event_1` 범위를 적용하고 HTTPS에서는 Secure를 사용한다. 코드 변경 후 앱을 재시작하면 이전 쿠키가 무효화된다. 조회 종료는 현재 브라우저의 쿠키를 지운다.
- 화면과 `GET /event_1/api/ops/applications?page=1` 모두 인증을 확인한다. 인증 전 API는 401, 코드 설정이 없거나 잘못됐으면 503을 반환한다. 접근 코드 입력·종료 요청은 Origin을 검사한다. 접근 코드를 URL로 전달하지 않는다.
- 운영 화면과 API는 캐시하지 않고 검색 노출·프레임 삽입을 차단한다. Referrer-Policy는 same-origin으로 두어 외부 사이트로 운영 URL을 전달하지 않으면서 같은 출처의 일반 폼 POST가 Origin을 유지하도록 한다.
- DB는 기존 행사 계정의 SELECT 권한을 그대로 사용한다. 스키마·테이블·권한 변경 없이 읽기 전용 트랜잭션에서 전체 건수와 50건 목록을 조회한다. 알림톡 테이블도 조회하거나 수정하지 않는다.
- `npm run verify:ops`는 로컬 행사 DB에서만 실행된다. 합성 신청 52건으로 인증·쿠키·Origin·세션 변조와 만료·페이지 분할·전체 연락처 표시·기존 학생 접수와 중복 방지를 확인하고, 해당 실행의 source로 만든 자료만 정리한다.
- 최종 검증: ESLint·TypeScript·운영용 빌드 통과. 브라우저에서 잘못된 코드 안내, 정상 인증, 마스킹 없는 세 항목 표시, 조회 종료와 1440px·390px·320px 화면을 확인했다. 실제 Supabase에 연결한 운영용 API도 인증 전 401·인증 후 200과 no-store를 확인했다. 접근 코드를 미설정한 별도 로컬 빌드에서는 운영 API만 503이었고 학생 페이지 200·접수 201·발송 대기 저장은 유지됐다. 브라우저 번들 29개에서 실제 DB 비밀번호와 운영자 코드 유출이 없는 것도 확인했다.

이벤트 앱의 별도 배포는 `dev` 병합을 선행 조건으로 하지 않는다. 별도 배포 프로젝트에서 `apps/event-1`과 배포할 브랜치를 지정하면 된다. 현재는 `feat/event_1`에서 작업하며 실제 배포·도메인 연결 활성화·기준 브랜치 병합은 별도 진행한다.

## 접수 요청

`POST /event_1/api/applications`에 JSON을 보낸다. `Origin`은 `EVENT_PUBLIC_URL`의 출처와 같아야 하고, `Idempotency-Key`에는 제출마다 생성한 UUID를 넣는다. 연속 클릭이나 응답 유실 후 재시도할 때 같은 키를 사용한다.

```json
{
  "universityCampus": "검증대학교 테스트캠퍼스",
  "phone": "010-0000-0000",
  "email": "event-test@example.invalid",
  "consentAccepted": true,
  "source": "seoultech"
}
```

학교는 자유 입력이고 `source`는 선택값이다. 휴대전화의 하이픈·공백·괄호를 제거해 저장한다. 필수값과 전화 자릿수를 검사하며 본문 크기는 4KB까지 받는다. 동의 문구 버전은 서버 설정에서 가져오고 동의 시각은 DB에 기록한다.

신규 접수는 HTTP 201, 같은 내용의 재시도는 HTTP 200으로 같은 신청 ID와 접수 시각을 반환한다. 같은 키로 내용을 바꾸면 409다. 저장 성공 응답은 다음 형태다.

```json
{
  "applicationId": "00000000-0000-4000-8000-000000000001",
  "status": "accepted",
  "receivedAt": "2026-11-19T00:00:00.000Z"
}
```

접수 정보와 `PENDING` 알림톡 작업을 같은 트랜잭션으로 저장한다. 저장 실패는 503으로 응답하고 두 기록을 함께 롤백한다. 새 접수가 마감되면 410이며, 이미 저장된 요청의 동일 키 재시도는 완료 결과를 돌려준다. 오류 응답은 `{ "code": "오류 코드" }` 형식이다.

## 오프라인 로컬 DB 준비와 실행

- 오프라인 개발 DB 이름은 `hometogether_event_1_dev`다. 실제 Supabase 연결 설정은 아래 절을 사용한다.
- `.env.example`을 참고해 행사 앱의 `.env.local`을 작성한다. `EVENT_DATABASE_URL`은 행사 계정을 사용하고 `EVENT_INTAKE_OPEN` 기본값은 `false`다. 개발 검증 시에만 `true`로 연다.
- DB 준비 명령은 `node --env-file=.env.local scripts/prepare-database.mjs`다. 관리자 접속 정보 `EVENT_DATABASE_ADMIN_URL`은 이 준비 명령에 사용한다. 공개 앱의 실행 환경에는 행사 계정의 접속 정보만 등록한다.
- 준비 명령은 지정한 서버 안에 행사 DB와 앱 계정을 만들고 SQL 마이그레이션을 적용한다. 앱 계정에는 행사 테이블의 `SELECT`, `INSERT`와 스키마 사용 권한을 부여한다. 준비 명령은 같은 버전으로 재실행할 수 있다.
- 기존 설치된 PostgreSQL 실행 파일을 재사용하려면 로컬 설정에 `EVENT_POSTGRES_BIN`을 지정하고 `node --env-file=.env.local scripts/local-postgres.mjs`를 실행한다. 다른 터미널에서 DB 준비와 개발 서버를 실행한다. 데이터는 앱의 `.local/postgres`에 유지된다.
- 개발 서버는 앱 폴더에서 `node node_modules/next/dist/bin/next dev --webpack -H 127.0.0.1 -p 3211`로 실행한다. 실제 HTTP·DB 검증은 `node --env-file=.env.local scripts/verify-intake.mjs`를 사용한다.

기존 DB 서버에 행사 DB를 별도로 만들어도 CPU·메모리·디스크 용량은 공유한다. 앱 연결 풀은 최대 3개, 행사 앱 DB 계정은 최대 5개 연결로 제한한다. 이 설정은 오프라인 로컬 검증에 사용한다.

## Supabase 연결

조직은 `hometogether-admin`, 프로젝트는 `hometogether-dongduk-landing`이다. [프로젝트 대시보드](https://supabase.com/dashboard/project/wityrxyfhwxhbtzmdsnp)

| 항목           | 값                                                               |
| -------------- | ---------------------------------------------------------------- |
| 프로젝트 ID    | `wityrxyfhwxhbtzmdsnp`                                           |
| 리전           | 서울 `ap-northeast-2`                                            |
| Session pooler | `aws-0-ap-northeast-2.pooler.supabase.com:5432`                  |
| DB와 스키마    | `postgres` / `event_1`                                           |
| 서버 계정      | `event1_app` (pooler 로그인은 `event1_app.wityrxyfhwxhbtzmdsnp`) |

- `.env.supabase.local`에 서버 접속 정보를 보관한다. 이 파일은 Git에서 제외한다. `EVENT_SUPABASE_PROJECT_REF`가 설정되면 앱은 해당 프로젝트의 서버 계정과 TLS 인증서 검증을 확인한다.
- 마이그레이션은 계정을 `NOLOGIN`으로 만든다. 실제 프로젝트에는 생성한 비밀번호를 설정해 로그인을 허용했고, 원문 비밀번호는 로컬 환경파일에 보관했다. 마이그레이션 파일에는 비밀번호를 넣지 않는다.
- 앱 폴더에서 `npm run dev:supabase`로 실행한다. 서버가 DB에 연결하고, 신청자 브라우저는 Next.js 접수 API를 사용한다.
- `EVENT_DATABASE_CA`에 Supabase 공개 CA 인증서 내용을 등록했다. 인증서 SHA-256 지문은 `80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA`다. [TLS 설정 안내](https://supabase.com/docs/guides/platform/ssl-enforcement)
- 마이그레이션 소스는 `supabase/migrations/20261119045411_event_intake.sql`이고 적용된 Supabase 이력 버전은 `20261119045917`이다. 이 공유 프로젝트에는 기존 랜딩의 마이그레이션 이력도 있다. 행사 변경은 이 파일을 대상으로 적용하고, 전체 프로젝트 이력은 함께 확인한다.
- RLS를 켜고 행사 계정에 신청·발송 작업의 `SELECT`, `INSERT`를 부여했다. `anon`과 `authenticated`는 행사 스키마 접근 권한이 없고, 행사 계정은 기존 랜딩 데이터 조회 권한이 없다.
- 프로젝트 처리 용량은 기존 랜딩과 공유한다. 앱 연결 풀은 최대 3개, 행사 앱 계정은 최대 5개 연결로 제한한다.

프로젝트 보안 진단에는 기존 랜딩 함수 2개의 익명 호출 권한 경고와 기존 `private` 테이블의 RLS 정책 관련 정보 2건이 있다. 행사 스키마 추가 전후 같은 항목이며 기존 랜딩 함수의 정의 해시도 같았다. [기존 함수 권한 진단 안내](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable)

## 검증 기록

2026-11-19에 기존 설치된 PostgreSQL 실행 파일을 재사용해 행사 전용 로컬 서버 `127.0.0.1:55441`와 개발 DB를 준비했다. Next.js 16.2.10의 실제 HTTP 서버로 다음을 확인했다.

- 같은 키의 동시 제출 8회에서 신규 접수 1회와 재시도 응답 7회를 확인했다. DB의 신청과 발송 작업은 각각 1건이었다.
- 다른 학교의 신청, 전화번호 숫자 정규화, 변경된 내용의 동일 키 충돌, 필수값·동의·Origin·본문 크기 오류와 잘못된 JSON을 확인했다.
- 발송 작업 저장 실패를 주입했을 때 신청도 롤백됐다. 실패 원인을 제거한 뒤 같은 키로 재시도하면 정상 접수됐다.
- 앱 계정에 삭제·스키마 생성 권한이 없는지 확인했고, DB 준비 스크립트를 재실행해도 기존 접수가 보존됐다.
- TypeScript 검사, ESLint와 운영용 빌드를 통과했다.
- 운영용 빌드의 마감 상태에서 새 신청은 410, 저장된 신청의 재시도는 200이었으며 새 신청 기록이 생기지 않았다.

검증에는 합성 정보만 사용했다. 알림톡 작업은 `PENDING`으로 저장하며 발송 워커 연결은 다음 단계다. 실제 저장소는 위 Supabase 프로젝트의 행사 스키마를 사용한다.

같은 날 실제 Supabase 계정으로 로컬 Next.js API를 실행해 동시 제출 3회의 결과가 201 1회와 200 2회임을 확인했다. 실제 Supabase DB에는 신청과 `PENDING` 작업이 각각 1건 저장됐다. 행사 계정으로 기존 랜딩 테이블을 조회하면 권한 오류로 차단됐다. 이 합성 신청과 발송 작업만 ID와 검증용 source를 지정해 정리했다.
