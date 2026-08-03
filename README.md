# hometgr-client

어르신-청년 주택 공유 서비스, 홈투게더 웹사이트 🏠

## 시작하기

```bash
pnpm install
cp .env.example .env.local   # 값 채우기
pnpm dev
```

| 환경 변수      | 설명                                                  |
| -------------- | ----------------------------------------------------- |
| `API_BASE_URL` | NestJS API 서버 origin                                |
| `APP_BASE_URL` | 이 앱의 origin (카카오 콜백 이후 redirect에 사용)     |

둘 다 서버 전용입니다. 브라우저는 API 서버를 직접 호출하지 않으므로 `NEXT_PUBLIC_`
접두사가 필요하지 않습니다.

## 인증 구조 (BFF)

`GET /auth/kakao/callback`은 프론트 URL로 redirect하지 않고 토큰 JSON을 그대로
반환합니다. 브라우저가 전체 화면 이동으로 이 응답을 받으면 앱 상태로 되돌릴 방법이
없어서, Next.js Route Handler를 BFF로 두고 토큰을 서버에서만 다룹니다.

```
브라우저 → /auth/kakao          → (서버) GET  /auth/kakao          → 카카오 인증 화면
브라우저 ← /auth/kakao/callback ← 카카오
         → (서버) GET /auth/kakao/callback → httpOnly 쿠키에 토큰 저장 → 화면 이동
브라우저 → /api/bff/<API 경로>      → (서버) Authorization 주입 후 API 호출
```

- 토큰은 `ht_access_token` · `ht_refresh_token` httpOnly 쿠키에만 저장하며,
  클라이언트 JavaScript는 토큰을 읽지 않습니다.
- 프록시가 401을 받으면 `POST /auth/refresh`로 한 번만 재발급하고 원래 요청을
  재시도합니다. 재발급도 실패하면 세션 쿠키를 지웁니다.
- 브라우저의 세션 쿠키는 API 서버로 전달하지 않습니다.

### ⚠️ 백엔드에 필요한 설정 (아직 미적용)

API 서버에 등록된 **카카오 redirect URI를 `{APP_BASE_URL}/auth/kakao/callback`
으로 변경**해야 합니다.

```
현재:   https://dev-api.hometogether.kr/auth/kakao/callback
필요:   http://localhost:3000/auth/kakao/callback          (로컬)
        https://<배포된 프론트 도메인>/auth/kakao/callback   (dev·운영)
```

카카오 개발자 콘솔의 Redirect URI 목록에도 같은 값을 등록해야 합니다.

지금은 이 값이 백엔드를 가리켜서, 카카오가 사용자를 백엔드로 직접 돌려보냅니다.
BFF가 state 쿠키를 서버에서 받아 프론트 도메인에 보관해 둔 상태라 브라우저에는
백엔드 도메인용 state 쿠키가 없고, 결과적으로 콜백이
`400 유효하지 않은 OAuth 상태입니다`로 실패합니다. 토큰 교환은 인증 시작에 사용한
redirect URI와 같은 값을 요구하므로 프론트에서 우회할 수 없습니다.

## 화면 ↔ API 계약 불일치 목록

Figma 기준으로 만든 화면과 현재 OpenAPI 계약이 어긋나는 지점입니다. **해결 주체가
백엔드인 항목과 프론트인 항목을 나눠 적었습니다.** 백엔드 항목은 합의 전까지 임시
처리해둔 곳이 있으니, 스펙이 바뀌면 함께 정리해야 합니다.

> **결정: 전부 화면 기준으로 맞춥니다.** 아래 표의 "화면" 열이 확정 스펙이고,
> 프론트는 그에 맞춰 구현했습니다. 따라서 2·3번 항목은 백엔드가 제약을 풀기 전까지
> 해당 단계 저장이 400으로 거절됩니다.

### 백엔드 합의가 필요한 항목

| # | 항목 | 화면 | API | 현재 처리 |
| - | ---- | ---- | --- | --------- |
| 1 | 자기소개 | 프로필 수정에서만 입력, 기본값 null | `PUT /me`의 `introduction`이 **required + 1자 이상** | ⚠️ 온보딩 시 **임시 플레이스홀더 문자열**을 전송. `PutMeDto`에서 optional로 풀리면 제거해야 합니다 |
| 2 | 사진 장수 | **6~20장** (6장 미만이면 진행 불가) | `mediaIds` **1~10장**, 활성 미디어 합계 최대 10 | 화면 기준(6~20)으로 구현. 업로드는 10장씩 나눠 보냅니다. **백엔드가 상한을 20으로 올려야** 10장 초과분이 저장됩니다 |
| 3 | 주소 | 정확한 주소를 몰라도 "대략적인 위치"만으로 진행 가능 | step 3의 `addressRoad`·`addressDetail`·`addressRegion` **전부 required**, `approximateLocation`은 optional | 화면 기준으로 세 필드를 optional 처리. **백엔드가 required를 풀어야** 대략적 위치만으로 저장됩니다 |
| 4 | 위치기반 약관 | 약관 4종 중 "위치 기반 서비스 이용 약관" 포함 | `ConsentKey`에 **대응 키 없음** (11종 중 없음) | ⚠️ 미해결 |
| 5 | 최종 확인 약관 | 10단계 하단 필수 동의 체크박스 | step 11(contact)에 동의 필드 없음 | ⚠️ `roomPublication`·`noFraudPledge`로 볼 수 있으나 확정 필요 |
| 6 | 주차 상세 | 무료(여유)·무료(선착순)·유료 **선택지** + 부가 설명 | `parkingDescription` **자유 텍스트 1개** | 선택지 라벨과 부가 설명을 한 문자열로 합쳐 전송 |
| 7 | 카카오 콜백 | — | 콜백이 프론트로 redirect하지 않고 토큰 JSON 반환 | `/auth/kakao*` BFF로 우회 (위 "인증 구조" 참고) |
| 8 | 자동 임시저장 | 작성 중 저장 중/완료 상태를 보여주고, 사용자가 단계를 떠나기 전에도 최신 입력을 보존 | 전용 API 없음. 현재는 `PUT /host/rooms/drafts/{draftId}` 단계 저장만 존재 | ⚠️ 자동 임시저장 API 계약 필요. debounce 저장, 부분 입력 허용 범위, `expectedVersion` 충돌 처리, 응답의 `version`·`lastSavedAt` 반환 정책 확정 필요 |

### 프론트에서 흡수한 항목

| # | 항목 | 내용 |
| - | ---- | ---- |
| 9 | 단계 번호 | 화면 1~10단계 = API 2~11단계 (**+1 오프셋**) |
| 10 | 회원 유형 | 화면 `guest` = 서버 `student` |
| 11 | 금액 입력 | "예) 65만원" 자유 텍스트 → 정수(원) 파싱 |
| 12 | 최소 거주 기간 | "예) 6개월, 1년" 자유 텍스트 → 개월 수 정수 파싱 |
| 13 | 입주 가능일 | 날짜 문자열 → **시간대 suffix 포함** ISO(`+09:00`)로 변환 |
| 14 | 연락처 | 자유 입력 → E.164 13자리(`+821012345678`)로 정규화 |
| 15 | 건물 유형 "기타" | `buildingTypeOther`가 required가 되므로 기타 선택 시 입력란 노출 |
| 16 | 초안 만료 | API의 `expiresAt`를 시작 화면 "임시저장 이어쓰기" 카드에 "n일 뒤 만료"로 표시 |
| 17 | 지역(시·군·구) | 화면에 입력란이 없어 Kakao 우편번호 검색 결과의 `sido` + `sigungu`로 채움 |
| 18 | 우편번호 | 검색 결과의 `zonecode`를 **저장할 필드가 API에 없음** — 화면 표시용으로만 사용 |

## Figma 에셋 내려받기

화면을 Figma에서 옮겨오면 아이콘·일러스트가 `https://www.figma.com/api/mcp/asset/...`
임시 URL로 들어옵니다. **이 URL은 약 7일 뒤 만료**되므로 저장소로 내려받아 커밋해야
합니다.

```bash
pnpm assets:check   # 만료 여부만 확인 (파일 변경 없음)
pnpm assets:sync    # public/figma/로 내려받고 소스의 URL을 로컬 경로로 교체
```

`src/` 전체에서 임시 URL을 찾아 상수 이름으로 파일명을 만들고
(`FIGMA_TEMP_LOGO_GLYPH` → `public/figma/logo-glyph-2f0447e3.svg`), 소스의 URL
문자열까지 바꿔줍니다. 한 번 실행해 커밋하면 그 에셋은 다시 받을 필요가 없습니다.

이미 만료된 URL은 어떤 파일의 어떤 상수인지 출력하므로, 그 노드만 Figma에서 다시
export해 URL을 갈아끼운 뒤 다시 실행하면 됩니다.

## 주소 검색 (Kakao 우편번호 서비스)

2단계 주소 입력은 [Kakao 우편번호 서비스](https://postcode.map.daum.net/guide)를 레이어
모드로 붙였습니다. API key가 필요 없고 사용량 제한도 없습니다.

- 스크립트는 검색을 열 때 한 번만 지연 로드합니다 (`shared/lib/kakao-postcode`).
- 팝업(`window.open`)은 일부 웹뷰에서 열리지 않아 문서 권장대로 `embed()` 레이어를 씁니다.
- 서버가 `"서울특별시 마포구"` 형태를 쓰므로 `shorthand: false`로 두어 시·도 전체 이름을 받습니다.
- 지번:도로명이 1:N이면 선택한 주소가 공백으로 내려올 수 있어 `autoRoadAddress` →
  `autoJibunAddress` 순으로 대체합니다.
- **하단 로고를 가리거나 스크립트를 수정하면 사용에 제약이 생깁니다.** 다이얼로그는
  iframe 위에 아무것도 덮지 않도록 헤더를 iframe 바깥에 두었습니다.

## 아키텍처

`src/`는 Feature-Sliced Design을 따릅니다. 자세한 규칙은 [AGENTS.md](./AGENTS.md)를
참고하세요.
