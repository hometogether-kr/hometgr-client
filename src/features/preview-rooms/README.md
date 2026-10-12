# 검색·상세 화면용 모의 응답

실제 API 함수·환경 설정은 변경하지 않고 개발 모드 화면에 명시적으로 연결한 모듈이다.
페이지 또는 위젯이 미리보기 옵션을 공급받을 때만 사용한다.
실제 API 오류를 가리는 대체 응답이나 배포용 데이터로 사용하지 않는다.
여기에 정의한 지역·위치 결과는 프론트 미리보기 모델이며 백엔드 DTO 확정안이 아니다.

## 로컬 화면 확인

- 메인: `/?preview=rooms`
- 탐색: `/rooms?preview=rooms`
- 지역 목록 상태: 위 URL에 `&previewState=loading`, `&previewState=error`, `&previewState=empty` 추가
- 목록 첫 조회 실패: `/rooms?preview=rooms&previewState=listError`
- 더 보기 첫 조회 실패: `/rooms?preview=rooms&previewState=nextPageError`
- 목록 오류는 자동 재시도하지 않는다. 다시 시도하면 같은 모의 응답 인스턴스에서 성공한다.
- 더 보기 실패는 기존 카드를 유지하고 안내를 표시하며, 더 보기를 다시 누르면 이어서 조회한다.
- 목록 오류 중 검색 조건을 바꾸면 새 조건의 목록을 조회한다.
- `preview=rooms`는 `development`에서만 활성화된다. 일반 URL의 기존 실제 조회는 유지한다.
- 검색 이동·필터 적용·정렬·초기화·더 보기에도 `preview=rooms`를 유지한다.
- 선택은 지역 이름 표시와 패널 닫기만 수행하고, 검색 버튼/아이콘이 조회 조건을 적용한다.
- 메인 미선택 검색은 안내만 표시하고, 탐색 직접 진입은 전체 모의 공개 매물을 표시한다.
- 지역 변경은 기존 필터·정렬을 유지하고 첫 페이지부터 조회한다.
- 모의 카드 링크는 `/rooms/preview-room-…?preview=rooms` 상세로 연결한다. 실제 상세 API는 호출하지 않는다.
- 상세의 비회원/회원 미리보기 전환은 실제 로그인 상태를 바꾸지 않는다.
- 검색 결과로 돌아가기에는 지역·필터·정렬·마지막 조회 페이지를 보존한다. 직접 돌아가면 해당 페이지부터 표시한다.
- 브라우저 뒤로가기의 누적 카드·스크롤 복원은 기존 라우터/쿼리 캐시 동작을 따른다.
- 메인 미리보기의 기존 지역별 추천 매물 영역은 실제 조회를 막기 위해 준비 안내로 대체한다.
- 상세 오류 재시도: `/rooms/preview-room-1-1?preview=rooms&previewState=detailError`
- 비공개 상세: `/rooms/preview-room-4-1?preview=rooms` — 찾을 수 없다는 안내를 표시한다.
- 회원 상세: `/rooms/preview-room-1-1?preview=rooms&viewer=member`
- 회원 위치만 카카오맵 SDK를 로드한다. 비회원은 건물 주소·좌표·SDK를 사용하지 않는다.
- 지도는 응답의 위도·경도를 그대로 사용하며 주소 지오코딩을 하지 않는다.
- `.env.local`의 `NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY`로 지도 JavaScript 키를 설정한다.
  기존 `NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY`도 대체 설정으로 재사용할 수 있다.
- 카카오 개발자 사이트에 실제 접속 도메인(로컬 검증: `http://localhost:3000`)을 등록한다.
  키 변경 후 개발 서버를 다시 시작한다. REST API 키·Admin 키는 사용하지 않는다.
- 지도 SDK 실패 시 주소는 유지하고 지도 재시도 안내를 표시한다.
- 실제 예약·계약·호스트 페이지 연결은 미리보기에서 실행하지 않는다.

```ts
import { createMockRoomSource } from "@/features/preview-rooms";

const source = createMockRoomSource({ delayMs: 300 });
await source.listRegions();
await source.listRooms({ region: "서울특별시 노원구", page: 1, sort: "rentAsc" });
await source.getRoomDetail("preview-room-1-1", "guest");
await source.getRoomDetail("preview-room-1-1", "member");
```

- 공개 매물 33개: 노원구·강서구·마포구 각 11개. 페이지당 8개로 추가 조회를 확인한다.
- 비공개 매물과 비공개 매물만 있는 중랑구는 지역·목록·상세에서 제외한다.
- 목록 가격은 기존 도메인처럼 만원, 조회 조건 가격은 원 단위다.
- 지역은 단일 값 일치, 가격은 양끝 포함, 입주일은 선택일까지 입주 가능,
  계약 기간은 선택한 기간 이내의 최소 계약 기간을 적용한다.
- 여성·남성 조건에는 성별 무관 매물도 포함한다. 정렬의 동률은 기존 생성 순서를 유지한다.
- `member`는 위치 공개가 허용된 회원을 뜻한다. 모든 로그인 상태의 권한을 대신하지 않는다.
- 비회원 위치 결과에는 건물 주소와 좌표 자체가 없다. 회원 결과에도 동·호수·자유 상세주소는 없다.
- 주소·좌표는 가상 예시이며 실제 매물 정보가 아니다. 모의 응답 모듈 자체는 지도 SDK 호출·지오코딩을 하지 않는다.
- 사진은 빈 배열/썸네일 null로 기존 이미지 대체 표시를 검증한다.

## 상태 재현

| 상황                          | 설정 또는 입력                      |
| ----------------------------- | ----------------------------------- |
| 로딩                          | `delayMs: 1500`                     |
| 전체 공개 매물 없음           | `emptyCatalog: true`                |
| 조건에 맞는 결과 없음         | `rentMax: 0`                        |
| 지역 목록 첫 조회 오류·재시도 | `failOnce: ["regions"]`             |
| 목록 첫 조회 오류·재시도      | `failOnce: ["list"]`                |
| 추가 조회 오류·재시도         | `failOnce: ["nextPage"]`, `page: 2` |
| 상세 첫 조회 오류·재시도      | `failOnce: ["detail"]`              |
| 존재하지 않거나 비공개인 상세 | `preview-room-4-1` 또는 없는 ID     |

실패 기록은 인스턴스별로 유지된다. 자동 재시도가 켜진 조회 라이브러리에 연결할 때는
미리보기에서 자동 재시도를 끄면 오류 화면을 직접 확인할 수 있다.
이 모듈은 검색 조건이나 화면 상태를 변경하지 않는다. 실제 API 연결과 실매물 좌표 검증은 별도 단계다.
