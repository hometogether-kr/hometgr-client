# 이벤트 접수 완료 알림톡

- 템플릿 코드: `ht_event1_received`
- 이름: 한 달 월세 지원 이벤트 신청 완료
- 2026-11-22 확인 상태: **승인(TSC03)**. 행사 앱과 예약 Worker의 실제 발송을 활성화했다.
- 기존 대기 신청 3건은 각각 1회 시도로 NHN 발송 접수(`SUBMITTED`)를 확인했다. 실제 카카오톡 수신 완료와는 구분한다. 활성화 배포는 `dpl_zHagauNrjdLxUE2YByHg3yW1Z8Hw`, 소스는 공개 중이던 `aa50690`을 유지했다.

등록된 본문은 다음과 같다. 치환 변수·버튼·매물 링크·문자 대체 발송은 사용하지 않는다.

```text
[홈투게더] 한 달 월세 지원 이벤트

신청이 접수되었습니다.
신청 내용을 확인하고 있으니 잠시만 기다려 주세요.
```

## 연결 방식

1. 접수 API가 신청과 발송 대기 작업을 같은 DB 트랜잭션에 저장한다.
2. 저장 성공 응답 직후 Next.js `after`에서 해당 신청의 알림톡 처리를 시작한다. 발송 실패 때문에 저장된 접수가 실패 응답으로 바뀌지 않는다.
3. 별도 Cloudflare Worker `hometogether-event-1-alimtalk`가 5분마다 대기 작업을 확인한다. 본 사이트나 기존 행사 라우터의 코드를 실행하지 않고 행사 앱의 보호된 API만 호출한다.
4. NHN 승인 상태(TSC03)·차단/휴면 여부·본문 일치를 확인한 후 작업을 원자적으로 선점한다. 동시에 실행돼도 같은 작업을 중복 선점하지 않는다.

행사 앱과 예약 Worker의 `EVENT_ALIMTALK_ENABLED`는 모두 **true**다. 새 신청은 저장 직후 발송을 요청하고 예약 Worker는 5분마다 대기 작업을 확인한다. 이후 발송을 끄면 작업을 선점하지 않고 `PENDING`으로 보관한다. 승인 상태 변경만으로 자동 활성화하지 않으며 이번 활성화는 사용자의 요청에 따라 적용했다.

## 환경과 접근

행사 Vercel 프로젝트 `hometogether-event-1`에만 다음 서버 환경 변수를 설정한다. 비밀 값은 Git과 브라우저에 포함하지 않는다.

| 변수                             | 용도                                          |
| -------------------------------- | --------------------------------------------- |
| `EVENT_ALIMTALK_ENABLED`         | 발송 활성화 여부. 현재 `true`                 |
| `EVENT_ALIMTALK_TEMPLATE_CODE`   | `ht_event1_received`로 고정                   |
| `NHN_ALIMTALK_APP_KEY`           | NHN 앱 키                                     |
| `NHN_ALIMTALK_SECRET_KEY`        | NHN 비밀 키                                   |
| `NHN_ALIMTALK_SENDER_KEY`        | 해당 템플릿의 발신 프로필 키                  |
| `EVENT_ALIMTALK_DISPATCH_SECRET` | 예약 Worker와 내부 API 사이의 긴 전용 인증 값 |

내부 API는 `POST https://hometogether-event-1.vercel.app/event_1/api/internal/alimtalk`이다. 올바른 Bearer 인증이 없으면 401이며, 연락처를 응답하지 않는다. 공용 도메인 라우터는 Authorization을 제거하므로 예약 작업은 Vercel 원본 주소로 호출한다. 운영자 비밀번호와 별개다.

Worker는 공개 경로·workers.dev·미리보기 URL을 연결하지 않는다. `cloudflare/event-alimtalk/wrangler.jsonc`에 5분 주기와 현재 활성화 값을 기록한다. 인증 값은 Worker의 secret으로 설정한다. 현재 Vercel Hobby의 cron은 하루 1회만 허용하므로 분 단위 재확인은 Cloudflare에서 수행한다. [Vercel cron 제한](https://vercel.com/docs/schedules/cron-jobs/usage-and-pricing)

## 승인 후 활성화

1. NHN에서 승인과 실제 문구를 확인한다. 문구가 바뀌었다면 앱의 기준 문구도 검토한다.
2. 기존 `PENDING` 신청도 활성화 후 발송 대상이 된다. 승인 대기 중 수집한 내역을 먼저 확인한다.
3. 행사 Vercel 프로젝트의 `EVENT_ALIMTALK_ENABLED=true`로 변경하고 **행사 앱만** 재배포한다.
4. 예약 Worker의 같은 변수를 `true`로 바꾸고 설정 파일에도 반영한다. 실제 수신 확인에는 운영자가 지정한 테스트 번호를 사용한다.

중지할 때는 두 환경의 값을 모두 `false`로 되돌리고 행사 앱을 재배포한다. 이미 NHN에 접수된 메시지는 취소되지 않는다.

## 실패와 기록

- NHN 요청 수락은 `SUBMITTED`로 기록하고 요청 ID·수신자 순번을 저장한다. 실제 카카오톡 수신 완료(`DELIVERED`)와 구분하며 최종 결과는 NHN 콘솔에서 확인한다.
- NHN이 요청을 거절했다고 확인된 HTTP 429만 5분 간격으로 최대 3회 시도한다. 그 외 명확한 거절은 `FAILED`로 보관한다.
- 시간 초과·형식이 불명확한 응답·실행 중단으로 수락 여부를 모르면 `FAILED / ACCEPTANCE_UNKNOWN`으로 보관한다. 중복 발송을 막기 위해 자동 재발송하지 않는다. NHN의 그룹핑 키 `작업UUID_시도횟수`로 확인 후 미발송이 확실할 때만 운영자가 복구한다. NHN의 중복 키 유효 시간은 10분이다. [NHN API](https://docs.nhncloud.com/ko/Notification/KakaoTalk%20Bizmessage/ko/alimtalk-api-guide/)
- 행사 DB 계정은 발송 상태 관련 열만 UPDATE할 수 있다. 신청 연락처 수정·작업 재할당·삭제 권한은 추가하지 않는다. 기존 동덕 랜딩 테이블은 변경하지 않는다.

검증: `apps/event-1`에서 `npm run verify:alimtalk`. 실제 로컬 PostgreSQL과 가짜 NHN 응답으로 발송 차단, 승인·본문 확인, 동시 선점, 요청 수락 기록, 실패·재시도·실행 중단, 인증과 제한된 DB 권한을 검사한다. 실제 메시지는 보내지 않는다.
