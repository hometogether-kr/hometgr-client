# 신한 고객 프론트 10단계 API 준비 상태

확인일: 2026-10-23 (Asia/Seoul). 이 기록은 실제 로컬 API의 읽기 확인과 고객 BFF의 메모리 기반 경계 검증을 구분한다. 고객 브라우저에서 실제 저장을 검증한 결과는 별도 최종 보고서에 기록한다.

## 계약과 최신 서버 작업 경로

- 공개 신청 계약: **1.0.0 / 2026-10-22**. 네 신청·익명 세션·동의·걱정·소개서·현재 내역 DTO는 유지된다.
- 처음 전달된 계약: `C:\Users\PC\Documents\GitHub\shinhan\docs\api-contract-v1.md`.
- 현재 서버 담당 작업 경로: `C:\Users\PC\Documents\GitHub\shinhan-runtime-split`.
- 현재 공개 계약: `C:\Users\PC\Documents\GitHub\shinhan-runtime-split\docs\api-contract-v1.md`.
- 런타임 분리 계약: 같은 경로의 `docs/runtime-split-contract-v1.md`, **1.0.0 / 2026-10-23**.
- 서버 담당 대화창: ‘신한 서버·DB 기반 구현 시작’. 확인 당시 `codex/admin-api-runtime-split`에서 관리자 Vercel·독립 API EC2 구조의 로컬 검증을 진행 중이었다.

고객 BFF는 독립 API 주소를 사용한다. 관리자 Vercel 주소는 고객 공개 API를 제공하지 않는다. 관리자 인증 계약 2.0.0은 고객 신청 계약과 별개다. `dev-shinhan-api.hometogether.kr`는 검토 중인 주소 후보이며 배포 완료 주소로 사용하지 않는다.

## 읽기 전용으로 확인한 실행 상태

| 항목                        | 확인 결과                                                                       |
| --------------------------- | ------------------------------------------------------------------------------- |
| API                         | `http://127.0.0.1:3200/api/v1`                                                  |
| `GET /health`               | 실제 HTTP 200, `data.status=ok`                                                 |
| bridge 인증 `GET /consents` | 실제 HTTP 200                                                                   |
| 응답 계약 헤더              | `X-Contract-Version: 1.0.0`                                                     |
| 응답 환경 헤더              | `X-Shinhan-App-Env: local`                                                      |
| DB 대상                     | 전용 로컬 PostgreSQL `127.0.0.1:55432/shinhan_runtime_split`                    |
| 외부 연동                   | `INTEGRATION_MODE=disabled`, `EXTERNAL_WRITES_APPROVED=false`                   |
| 서버 설정                   | 서버 작업 경로 `.env.api.local`, bridge 존재·최소 길이 확인. 값은 출력하지 않음 |

이 초기 확인은 `/health`의 실제 DB 조회와 동의 문서 읽기 성공이다. 신청 생성·소개서·걱정 저장 성공을 대신하는 검증이 아니다. 초기 확인 단계에서는 실행 중인 서버를 읽기만 했다. 이후 서버 담당 작업이 종료되어 API·DB가 내려간 것을 확인하고, 고객 브라우저 검증을 위해 기존 API 실행 파일·환경과 PostgreSQL 클러스터를 그대로 재가동했다. 서버 코드·설정·DB 스키마·seed는 변경하지 않았으며 워커를 실행하지 않았다. 합성 정보의 실제 저장과 종료 정리는 `shinhan-frontend-stage-10.md`에 기록한다.

## 동의와 운영 경계

현재 `/consents`는 `localOnly:true`를 반환한다.

- 필수: `LOCAL_ONLY_REQUIRED_V1` — ‘로컬 합성 데이터 검증용 REQUIRED 동의. 운영 승인 전문이 아닙니다.’
- 선택: `LOCAL_ONLY_OPTIONAL_V1` — ‘로컬 합성 데이터 검증용 OPTIONAL 동의. 운영 승인 전문이 아닙니다.’

프론트가 서버 전문을 실제로 표시하고 그 버전으로 제출해야 한다. 기존 Figma 전문을 위 버전으로 제출하지 않는다. 운영 승인 전문은 아직 없으며 서버도 local/test 밖에서는 LOCAL_ONLY 문서를 허용하지 않는다. 승인 문서가 없으면 운영 `/consents`는 503을 반환한다.

고객 BFF는 이번 단계에 development·loopback 환경에서만 활성화한다. production에서는 차단한다. 여러 인스턴스에 걸친 세션 초기화 직렬화·운영 Origin/비밀키·승인 전문·실제 배포를 완료한 것으로 취급하지 않는다.

## 저장·실패·재시도에서 지켜야 하는 계약

- 익명 토큰은 HttpOnly 쿠키에만 보관한다. 고정 2시간이며 ID·전화번호만으로 만료 세션을 복구하는 API는 없다.
- 한 사용자 행동에 하나의 UUID 멱등 키를 사용한다. 네트워크 오류·503·응답 유실은 같은 키와 같은 본문으로 다시 시도한다. 같은 키에 다른 요청은 409다.
- 저장 실패는 멱등 키를 소비하지 않는다. 성공 응답 재현에는 `Idempotency-Replayed: true`가 붙는다.
- 401 만료 후 신규 세션에서 미확정 신청을 자동 재제출하지 않는다. 중복 접수가 생길 수 있으므로 사용자 재시작 경계가 필요하다.
- 방 등록과 게스트 두 신청은 저장 후 조회 전용이다. 호스트 조건을 바꾼 재견적은 새 신청이며 이전 원장과 별개다.
- 호스트 견적 저장만으로 알림 사건을 만들지 않는다. 소개서 신청만 같은 견적에 발송 사건을 추가한다.
- 저장 완료와 알림 전달 완료를 구분한다. `PENDING`과 `ACCEPTED`는 실제 전달 완료가 아니다. 외부 작업 실패가 이미 성공한 접수를 실패로 바꾸지 않는다.
- `GET /applications/:id/current`는 원장·동의·알림 사건을 만들지 않는다.
- 걱정 `SKIPPED`는 선택값 삭제·false 동의 기록을 실제로 수행하므로 미확정 스킵 화면 동작에 임의로 연결하지 않는다.

## BFF 메모리 검증 — 실제 서버 저장과 구분

새 테스트 프레임워크를 설치하지 않고 실제 BFF 모듈과 메모리 `fetch` 응답으로 **37개 검증을 통과**했다. 이 검증의 실제 API 쓰기는 **0회**다.

검증 범위는 production 차단, Host/Origin/Fetch-Site/CSRF, JSON·16KiB 제한, 관리자 경로 차단, 동시 세션 초기화 1회, 첫 쿠키 응답 유실 후 재사용, 고정 만료, 서명 변조 차단, 토큰을 제외한 브라우저 JSON, 요청 헤더 제한, 성공 status·schema·계약·환경 검사, 네트워크/503, Retry-After, 멱등 응답 헤더, 401 쿠키 삭제 및 자동 재발급 방지다.

실제 Next 개발 서버에서는 내부 `request.url`이 `http://localhost:3000`으로 정규화되고 브라우저 Host는 `127.0.0.1:3000`으로 유지되어 최초 요청에 403이 발생했다. 현재는 설정된 전체 Origin 목록 중 실제 Host와 프로토콜이 정확히 일치하는 항목을 찾고 브라우저 Origin을 그 항목과 비교한다. `X-Forwarded-Host`는 신뢰하지 않는다. 정규화된 GET·POST 허용, 다른 허용 Origin과 현재 Host의 불일치 거부, 프로토콜 불일치 거부, 허용 목록 밖 Host와 위조 forwarded Host 거부를 8개 메모리 검증으로 추가 확인했다.

증거:

- `C:\Users\PC\.codex\visualizations\2026\10\22\01a16209-7b74-77d0-8d98-02e59f6e504a\stage10-bridge-check.cjs`
- 같은 폴더 `stage10-bridge-check.json`

실제 Next HTTP 헤더·쿠키, PC·모바일의 네 신청 실제 저장, 저장 전/실패 후 완료 화면 차단, 동일 키 재시도, 개인정보 전문 복귀, 조회 전용 내역 및 실제 응답 유실 재현의 최종 결과는 `shinhan-frontend-stage-10.md`를 참조한다. 실제 모바일 기기·Safari·신한 앱 웹뷰·외부 알림톡/시트 전달·운영 배포는 이번 검증에 포함되지 않는다.
