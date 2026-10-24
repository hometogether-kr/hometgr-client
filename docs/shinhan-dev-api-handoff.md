# 신한 고객 웹 dev API 연결 인계

버전 **1.2.0** · 2026-10-24 (Asia/Seoul) · 대상 `hometgr-client`의 `dev`.

## 기준과 현재 상태

- 서버 인계: `C:/Users/PC/Documents/GitHub/shinhan-runtime-split/docs/customer-web-handoff.md` **1.4.0**, 상태 기준 2026-10-24 19:37 KST.
- 공개 API: 같은 폴더의 `api-contract-v1.md` **1.0.0**.
- 런타임 분리: `runtime-split-contract-v1.md` **1.0.2**. 초기 관리자 origin 설명보다 우선하며 동일 DB·데이터 공유 결정이 반영됐다.
- 원격 연결 정책: `customer-bff-remote-contract-v1.md` **1.0.1**. 정책은 정해졌지만 세션 확장·마이그레이션·쿠키 전환은 아직 구현·배포 전이다.
- 실제 dev API origin은 **https://dev-shinhan-api.hometogether.kr**, 기본 경로는 `/api/v1`이다. DNS·HTTPS·health200·접근 차단·인증서 갱신 검증은 서버 인계에 기록돼 있다.
- 실행 API SHA는 `f19eea39a666af6828c45b6ce5fbaa2c9cc70cec`, bootstrap 도구·배포 준비 기준 SHA는 `7714f709533c6a227cad6b2636484cda79fe551c`다. 어느 쪽도 새 원격 세션 구현 완료 근거가 아니다.
- RDS 역할·migrations001/002·TLS 앱 인증·최소 권한은 완료됐다. 새 migration003·원격 세션 확장·비로컬 동의 등록은 미완료다. worker는 중지 상태다.
- 위 상태는 서버 인계 기록을 읽은 결과다. 이번 고객 작업에서 AWS·HTTPS·DB 검증을 다시 실행하지 않았다.

공통 BFF·익명 세션·동의 조회와 HOST_REGISTRATION 전송 코드는 기존에 구현돼 있다. 이번 단계는 기존 화면·신청 DTO·로컬 동작을 유지하며 원격 준비 설정의 잘못된 로컬 실행을 막는 작업이다. API 주소·환경 파일·비밀값을 교체하지 않았으며 서버·DB·관리자·공통 계약·의존성은 변경하지 않았다.

## 이번 변경: 명시적 원격 설정 차단

`src/features/shinhan-bridge/config/environment.server.ts`가 `SHINHAN_APP_ENV`와 `SHINHAN_CLIENT_IP_MODE`를 읽는다.

- 두 값이 없으면 기존 로컬 설정과 호환된다. 각각 명시한 경우 `local`만 허용한다.
- `dev`·`production`·`vercel-direct`·빈 문자열·미지원 값은 연결 불가로 처리한다. API 주소가 loopback이어도 원격 설정을 무시하고 로컬 요청을 보내지 않는다.
- 기존 `NODE_ENV=development`, loopback origin, upstream 환경 `local` 및 계약 `1.0.0` 검사는 유지한다. 설정이 거부되면 BFF의 기존 503 처리로 끝난다.
- 이는 기존 local 호환 단계다. 원격 계약의 환경값 누락 허용이나 dev 활성화를 구현한 것이 아니다. 원격 전환 때는 명시적 환경 선택을 필수로 적용한다.

## 공통 연결의 기존 구현과 다음 변경

아래 오른쪽 열은 **서버 준비 완료 후 적용할 목록**이며 이번에 활성화한 기능이 아니다.

| 위치·경계                                           | 현재 유지하는 동작                                                                        | 원격 정책 1.0.1 적용 시 변경                                                                                                                                |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shinhan-bridge/config/environment.server.ts`       | development·loopback·명시적 local만 허용                                                  | `SHINHAN_APP_ENV`로 업무 환경 구분, 정확한 HTTPS 고객/API origin 검증. production 빌드의 dev 환경도 구분                                                    |
| `shinhan-bridge/api/upstream.server.ts`             | 공개 bridge 서버 주입, no-store·10초·redirect 차단, JSON·크기·버전·local 응답 검사        | 설정 환경과 응답 환경 일치 검사. bootstrap만 upstream 계약1.1.0, 동의·신청·조회는1.0.0 유지                                                                 |
| `shinhan-bridge/api/session.server.ts`              | 기존 HttpOnly 세션, 프로세스 Map, 고정 loopback Client-Key                                | Vercel 직접 ingress 확인 후 단일 IP 검증·IPv4/IPv6 정규화·환경별 HMAC. 서버 bootstrap의 환경+CSRF 기반 Session-Key로 인스턴스 간 같은 세션 재현             |
| `shinhan-bridge/api/handler.server.ts`              | 얇은 route 뒤 allowlist·Origin·Host·Sec-Fetch-Site·JSON·16KiB·CSRF, 관리자 경로 전달 금지 | 브라우저 `POST /api/shinhan/sessions {}`는 유지하고 upstream만 `sessions/bootstrap`으로 선택. 브라우저 인증 헤더 복사 금지                                  |
| 세션·CSRF 쿠키                                      | 기존 local 쿠키 codec·고정 세션 만료                                                      | `__Host-shinhan_intake`/`__Host-shinhan_csrf`, 별도 상태 키 서명, 용도·환경·origin·nonce 결합, API/CSRF 중 이른 만료 적용. 만료/서명 불일치 시 두 쿠키 제거 |
| `shinhan-intake/model/storage-context.tsx`          | Web Locks 안에서 동의 조회→세션 발급, local의 무잠금 fallback                             | 원격은 Web Locks 없거나 획득 실패 시 중단. 잠금 획득 후 새 조회로 쿠키 확인, 오래된 탭 상태 재사용 금지. 명시적 재시작과 일반 재조회 구분                   |
| `shinhan-application/api/consents.schema.ts` 및 BFF | 서버 전문·버전·SHA-256 검증, 실패 시 예시 전문 대체 금지                                  | 비로컬 REQUIRED·OPTIONAL 및 `localOnly=false` 확인. 응답 content의 UTF-8 해시 사용                                                                          |

세션 토큰·Session-Key는 브라우저 JSON·URL·브라우저 저장소·로그에 노출하지 않는다. 실제 성공을 받기 전 완료로 바꾸지 않고, 불명확한 신청 재시도는 같은 세션·UUID 행동 키·본문을 유지한다. 서버 저장 성공과 알림 전달·시트 반영은 구분한다.

## 동의와 남은 준비

기존 전문 사용에 대한 추가 승인 증빙을 요구하지 않는다. 원격 정책 1.0.1에 기록된 상태는 다음과 같다.

- 필수 본문 출처는 `src/widgets/shinhan-privacy/ui/shinhan-privacy-document.tsx`다. TSX 파일 해시는 API가 반환할 content 해시가 아니다.
- 선택 본문은 서버 조사에서 미확보다. 필수 본문이나 합성 seed로 대체하지 않는다.
- 실제 `consent_documents`는 인계 시점 0건이며 `GET /consents`는 503이다.
- 현재 계약은 REQUIRED·OPTIONAL 둘 다 필요하다. HOST_REGISTRATION에서 선택 동의를 제출하지 않더라도 공통 조회를 위해 두 문서의 등록이 필요하다. optional을 nullable로 만들거나 `localOnly=false`를 강제로 바꾸지 않는다.

2026-10-24 서버 대화창 **신한 서버·DB 기반 구현 시작**에 전달했던 환경·IP·초기화·쿠키 정책 요청은 원격 계약1.0.1로 정리됐고, DB 공유 문구 정정은 런타임1.0.2에 반영됐다. 같은 정책 결정을 다시 요청하지 않는다. 현재 남은 사항은 다음과 같다.

1. **서버:** migration003, 환경별 세션·bootstrap·회수/만료 처리의 구현·집중 검증·실제 HTTPS 배포 SHA와 응답 버전.
2. **서버:** 기준 필수·선택 원문 확보와 비로컬 등록, 실제 version/content/sha256 및 `localOnly=false` 조회 결과. 호스트 견적 수집표의 전화번호 누락 기록도 원문 대조 대상으로 유지.
3. **고객 배포:** 정확한 dev 고객 origin과 Vercel 직접 ingress 확인. 기존 도메인의 DNS/프록시 설정을 임의 변경하지 않는다.
4. **검증 준비:** 환경별 키의 안전한 공급, 외부 쓰기 disabled/false와 worker 중지 확인, 합성 전화번호 허용 목록. 비밀값은 채팅·Git에 기록하지 않는다.

## 환경변수와 재개 순서

현재 로컬 BFF의 서버 전용 변수는 `SHINHAN_API_ORIGIN`, `SHINHAN_ALLOWED_ORIGINS`, `SHINHAN_BRIDGE_SECRET`, `SHINHAN_CLIENT_IP_HMAC_SECRET`다. 이번에 읽기 시작한 `SHINHAN_APP_ENV`·`SHINHAN_CLIENT_IP_MODE`는 현재 local 차단 검증만 한다. 실제 환경 파일은 수정하지 않았다.

서버 준비 후 원격 전환 시 `SHINHAN_APP_ENV`·`SHINHAN_CLIENT_IP_MODE=vercel-direct`·`SHINHAN_BFF_STATE_SECRET` 및 환경별 기존 변수들을 계약대로 설정한다. 두 고객 HMAC 키는 분리하며 `NEXT_PUBLIC_*`를 쓰지 않는다. API의 `INTAKE_SESSION_SECRET`·`DATABASE_URL`·관리자 키는 고객 BFF에 넣지 않는다.

1. 준비 완료 인계와 정확한 고객 origin·ingress를 받은 뒤 위 원격 변경을 적용한다. DNS·health 성공만으로 가드를 제거하지 않는다.
2. 공통 BFF의 환경·IP·동의·세션·쿠키·Web Locks·응답 유실 경계만 검증한다. 기존 화면 전체 검증을 반복하지 않는다.
3. HOST_REGISTRATION의 OWNED/RENTED 합성 **2건**을 각 다른 키로 저장하고 같은 세션·키·본문 재시도에서 추가 접수 **0건**을 확인한다. 공유 DB의 전체 초기화·자동 삭제를 하지 않는다.
4. 입력 오류·세션 만료·장애 시 거짓 성공 방지와 PC·모바일 제출 상태를 확인한다. worker는 중지하고 실제 고객 발송·운영 시트 쓰기는 하지 않는다.
5. 결과를 보고한 뒤 다른 세 유형을 진행한다. 이번에는 main 반영·배포를 실행하지 않는다.

기존 `main`의 `6067ffe` 배포와 로컬 API 검증 기록(stage10/11)은 이전 단계 이력이며 원격 전체 연결 완료 근거가 아니다.

## 이번 검증 기록

- 작업 시작 기준은 `dev / 68bb054`다. 미추적 기획·UTM 문서를 보존했다.
- 변경된 환경 선택 경계의 합성 설정 검사 **14/14 통과**. 기존 local 호환, 명시적 원격/빈값/미지원 설정 거부, production 빌드·원격 origin·키 누락 차단을 확인했다. 실제 API·DB 요청은 0회다.
- 코드 검사·문서 형식 검사는 이번 변경 파일로 한정한다. 화면·DTO·세션 구현이 그대로이므로 이전 PC/모바일·빌드 검증은 반복하지 않는다.
