# main/dev 복구 검토 기록

작업 시작: 2026-11-05 · 검증 정리: 2026-11-06 (Asia/Seoul)
대상 저장소: hometogether-kr/hometgr-client
복구 브랜치: chore/sync-main-dev-20261105

## 기준과 범위

- 첫 번째 부모(dev): 3958c08478788f4e981efa1a0b3164ab78791903
- 두 번째 부모(main): 0565123317c6a1fe364d0eeebc786b6b2b533689
- dev에서 분기한 복구 브랜치에 main을 일반 merge했다. 기존 커밋을 재작성하거나 cherry-pick하지 않는다.
- main/dev 브랜치 이동, 원격 push, PR 생성·병합, 운영 배포는 이 작업에 포함하지 않는다.
- 다른 저장소의 코드·설정·데이터는 변경하지 않는다. 기존 의존성·캐시는 재사용한다.

## 충돌 해결

85개 파일의 충돌을 해결했다. 파일별 선택 기준과 보존 대조 목록은 [JSON 기록](main-dev-recovery-20261105.json)에 있다.

| 영역 | 기준 | 이유 |
| --- | --- | --- |
| 신한 관련 소스·문서 72개 충돌 | main | dev의 초기 구현을 바탕으로 운영 접수·Cloudflare 연결·동의·최신 호스트/게스트 흐름·지역 자유입력·사용 추적이 누적된 버전이다. dev의 구현을 소급 제거하는 대신 후속 운영 버전으로 통합한다. |
| 일반 서비스·공통 UI 13개 충돌 | dev | 매물 관리, 역할 없는 가입과 계정 모드, 매물 상세 정보·금액·복귀 경로, 사진 편집 재사용 및 최신 API 계약을 보존한다. main의 이전 예약/계약 UI를 다시 활성화하지 않는다. |
| 루트 레이아웃 자동 병합 | 통합 | dev의 세션·Query·Toast 구조에 main의 MarketingAttributionObserver를 추가한다. |

공통 주소검색은 dev의 Zod 검증·법정동 코드·확정 주소 구조를 유지한다. 신한이 사용하는 address/sido/sigungu도 이미 제공한다. 공통 모달은 dev의 overlay/header 스타일 옵션과 신한에서 사용하는 closeIcon을 함께 유지한다.

## 파일 보존 대조

Git blob SHA-1을 비교했다. 기능 실행 결과를 대신하는 검사는 아니다.

- main의 신한·베타 추적·마케팅 유입·Cloudflare ingress·신한 에셋·기존 검증 스크립트: 290개 중 289개 파일이 main과 동일. 나머지 1개(handler.server.ts)는 린트에 맞춰 import만 정렬했으며 함수 구현 본문은 main과 동일하다.
- dev의 신한 외 기존 소스: 524개 중 523개가 dev와 동일.
- 의도적 차이 1개: src/app/layout.tsx의 마케팅 추적 관찰자 추가. 기존 provider 구조를 보존한다.
- package.json, lockfile, Next 설정과 일반 서비스 소스는 dev 기준을 유지한다.
- 사용자 작업으로 존재하는 미추적 문서는 복구 커밋에 포함하지 않는다.

## 검증

- TypeScript: node node_modules/typescript/bin/tsc --noEmit --incremental false 통과.
- 기존 BFF 오프라인 검사: node scripts/verify-beta-bff.mjs, 700개 assertion 통과. 실제 네트워크 없음.
- 기존 브라우저 로직 오프라인 검사: node scripts/verify-beta-browser.mjs, 307개 assertion 통과. 실제 네트워크·DOM 검사는 아니다.
- 소스·스크립트·에셋: git diff --cached --check -- src scripts public 통과.
- main에서 가져온 문서 3개의 기존 Markdown 강제 줄바꿈(줄 끝 공백 7곳)은 보존했다. 전체 diff --check는 이 공백을 보고한다.
- 전체 src ESLint는 Node 기본 약 2GB 힙 한도에서 종료됐다. 실제 통합 변경 TypeScript 88개를 별도로 검사한다. 전체 검사에서는 main에서 가져온 베타 BFF 파일의 import 정렬 1건만 보고됐다. 해당 import만 정렬했으며 동일 import 규칙의 파일 단위 재검사도 통과했다. 다른 규칙에서 오류는 없었다.
- 개발 서버는 기존 scripts/shinhan-beta-local-mock.mjs --dev를 재사용한다. mock은 loopback과 메모리 합성 데이터만 사용한다.
- 본 서비스 홈·집주인 소개·매물 목록·매물 관리 미리보기와 신한 소개·신청·접수·개인정보 등 총 13개 경로의 최종 HTTP 200 및 서버 오류 문구 없음 확인. 전체 경로·결과는 JSON 기록에 있다. /shinhan/guest/demand는 main과 동일하게 예산 경로로 이동한다. 개인정보 페이지는 첫 컴파일 180초 초과 후, 컴파일 완료 뒤 재확인에서 200이었다.
- 로컬 mock 카운터: applications/concerns/introductions/collectorRequests 모두 0. GET 렌더링만 점검했으며 합성 신청도 생성하지 않았다.
- Next가 생성한 최신 개발용 route 타입을 포함한 최종 TypeScript 검사도 통과했다. 운영용 전체 build는 실행하지 않았다.
- 브라우저 도구의 PC 로컬 주소 연결 시간 초과와 컴퓨터 사용 도구 응답 실패로 시각·클릭·모바일 검증은 완료하지 못했다.
- 외부 운영 API, 실고객 신청, 알림 발송, 시트 쓰기, 실제 Cloudflare 경유는 이번 검증에서 실행하지 않는다.

## 검토와 후속 반영

로컬에서 git diff origin/dev...HEAD로 dev에 추가될 변경을 확인할 수 있다. git show --first-parent HEAD로도 통합 결과를 볼 수 있다.

검토 후 이 브랜치를 dev에 PR로 반영할 때는 Create a merge commit을 사용한다. Squash 또는 rebase merge는 main과 연결한 부모 이력을 잃게 한다. dev에서 검증한 다음 별도 dev → main PR도 merge commit으로 반영한다. 이 작업에서는 두 PR을 생성하거나 병합하지 않는다.
