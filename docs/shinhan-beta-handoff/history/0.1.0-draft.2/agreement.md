# 신한 베타 공통 데이터 계약 — 동일 버전 기술 합의 확인

> 2026-10-27 후속 상태: 운영 기준의 사용자 확정 사항은 [고객 운영 기준](./operating-decisions.md)에 반영했다. 아래 draft.2 합의와 운영 미정 목록은 당시 기록이다. 새 운영 기준에 맞춘 후속 기술 계약은 아직 합의하지 않았으며, **개발 중단을 유지한다**.


> 관리자 검토 이력 위치 안내: 아래 합의가 참조하는 admin-review-2 원문은 [history/admin-review-2.md](C:/Users/PC/Documents/GitHub/shinhan-beta-dashboard/docs/shinhan-beta-handoff/history/admin-review-2.md)에 동일 바이트·동일 해시로 보존되어 있다. 현재 contract-review.md는 admin-review-3-policy의 후속 변경 요청이며 새 기술 합의 완료 판정이 아니다.

확인일: 2026-10-27 Asia/Seoul
상태: **고객·관리자 동일 버전 기술 합의 완료 / 병행 개발 준비 완료**
합의 버전: **0.1.0-draft.2**
집계 정의: shinhan_beta_metrics_draft_v1

이 기록은 사용자의 “고객 계약 초안 보완 → 관리자 재검토 → 동일 버전 합의 확인을 한 번에 진행” 지시를 완료한 결과다.
기술 계약 합의와 애플리케이션 구현 시작·운영 수집·공개·배포 승인은 별개다. **이번에는 문서·합성 자료만 수정했고 앱/수집기 구현을 시작하지 않았다.**

## 동결한 자료

| 대상 | SHA256 |
| --- | --- |
| 고객 contract.md | d7ba70a9fd9203263e9804fbea25bcbd451f34ad9a75e5ba56ab8f03480cdd88 |
| 고객 manifest.json | d1f1ab5dd135199c06bc209aad58ee2e817b29bb1abab75e2925d26f024dc55e |
| 관리자 contract-review.md (admin-review-2) | e21e3c364d696f2f6c17341eff8821fc1d9a469a19020f5473279b7c133acc8b |

고객 원본:
C:/Users/PC/.codex/worktrees/shinhan-production-only/hometgr-client/docs/shinhan-beta-handoff/

관리자 검토:
C:/Users/PC/Documents/GitHub/shinhan-beta-dashboard/docs/shinhan-beta-handoff/contract-review.md

- 현재 manifest 대상22파일, JSON18개. 실제 파일의 해시·바이트 수 일치 확인.
- 고객 기준: codex/shinhan-beta-tracking / 9f314521e444da9b0e63efeb2d80fcea1a89da8b.
- 관리자 기준: codex/shinhan-beta-admin / 8cebb614485d8b3b90462eabd9843e0ae2597b9f.
- 공통 자료는 미커밋 문서이므로 저장소 기준 commit과 별도로 위 해시를 사용한다.
- history/0.1.0-draft.1/은 이전 검토 이력이다.
- agreement.md와 history/는 현재 manifest 밖의 확인 기록이며, 이번 합의로 계약/예시/manifest를 다시 변경하지 않는다.

## 양쪽 판정

고객: admin-review-1의 C1~C7을 계약·합성 예시에 반영했고, 변경 부분 검증과 독립 읽기 검토를 통과했다. 관리자 admin-review-2의 검토 버전/동결 해시/판정을 읽고 같은 데이터 형식으로 작업할 수 있음을 확인한다.

관리자: **0.1.0-draft.2 동일 버전 기술 계약 호환, 병행 개발 준비 완료.**
C1~C7 모두 충족. R8~R10 보완 충족, R1~R7은 영향 부분 대조 후 충족 유지. 추가 차단 사항과 추가 계약 버전 요구 없음.

합의 범위:
- 브라우저/BFF/수집기 필드 소유권과17열, 시도/중복/UTM/완료 관찰.
- 이벤트 ACK·오류·dirty, 세 동작/키와 HMAC·nonce 경계.
- 운영 latest snapshot과 순수 계산 입력 분리, 같은 scope fallback, as_of 기준 최신성.
- source 건수 합산 후 비율 재계산.
- 공개 전용 count/rate/source와 보호된 분자·분모·값null, 정책 변경 후 옛 수치 재공개 금지.
- 같은 버전의 합성 요청·응답·집계·오류·경계 예시.

## 분업과 다음 단계

고객은 기존 고객 동선을 유지하는 계측·UTM·시도/중복 처리·분석 전용 BFF를 담당한다.
관리자는 단일 베타 수집기·집계 연결·내부/공개 대시보드를 담당한다.
Apps Script를 양쪽에서 중복 작성하지 않고, 상대 저장소의 코드를 수정하지 않는다.

실제 Apps Script 배포·키 공급·시트 저장은 병행 개발 준비의 선행 조건이 아니다.
**별도 구현 진행 지시를 받으면 양쪽이 이 동결 버전으로 로컬 합성 응답 기반 개발을 시작할 수 있다.**
계약 변경이 필요하면 원본 새 버전·예시·해시를 함께 갱신하고 영향 범위만 재검토한다.

## 운영 결정 대기

- 일반 방문과 베타 참여를 구분할 방법.
- 실제 run·수집 시작/종료·종료 후 지연 전송 유예.
- 익명 분석 저장소·큐·원장 보관 기간 및 담당자.
- 공개 소수 보호·보완 억제·공개 기간·갱신 주기·집계 최신성 한도.

이 값들은 로컬 기술 합의의 차단 요인이 아니며 pending/disabled로 둔다. 운영 수집/공개 활성화 전에는 별도 결정이 필요하다.
합성 정책·300000ms·예시 날짜와 건수는 운영 승인/실제 성과가 아니다.
실제 고객 신청·걱정·소개서·알림·운영 접수 탭·분석 시트 쓰기, 배포·push·merge는 이번에 실행하지 않았다.

## 검증 참조

고객 validation.md의 변경 부분 검증과 관리자 admin-review-2의 읽기/무결성 대조를 참조한다.
기존 전체 원장 계산·테스트·린트·빌드를 반복하지 않았다.
이 합의 확인 시점에 고객의 tracked/staged 앱 변경은 없고 문서 경로 밖 미추적 파일도 없다.
