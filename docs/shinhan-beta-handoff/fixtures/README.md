# 합성 fixtures — 실제 데이터 아님

계약: 0.1.0-draft.3. 집계 정의: shinhan_beta_metrics_draft_v2.
모든 JSON은 synthetic=true와 합성 경고를 포함한다. 문서 검토/계산용이며 네트워크 전송·실제 시트 업로드를 하지 않는다.

## 현재 예시

- events.synthetic.json / scenarios.synthetic.json: 원장 20행, 정확한 17필드, 모두 connection_test. H는 Oct27 한국시간 오늘 포함 30일 하한 직전으로 이동했다. I는 Oct28 자정부터 새 30일 구간에 포함된다.
- aggregate-query.synthetic.json: 한국시간 오늘 포함 30일의 순수 계산 입력. 운영 RPC가 아니다.
- admin-aggregate*.expected.synthetic.json: 24시간 직전/정확한 경계/늦은 완료/한국시간 자정의 기대값.
- admin-snapshot-cases.synthetic.json / aggregate-states.synthetic.json: 운영 latest 조회와 연결 전·실제 0·오래됨·실패, 이동하는 기간 fallback.
- public-aggregate*.synthetic.json: 공개 전용 응답·소수 및 보완 억제·확정된 갱신과 오래됨 상태. 정책 확정과 실제 공개 활성화는 별개다.
- operation-policy-aggregate-cases.synthetic.json: 확정 정책의 시간 경계와 공개 기여 브라우저/과거 공개값 보호 사례.
- observation-cases.synthetic.json / concurrency-and-nonce.synthetic.json: 기존 화면의 첫 유효 입력·실제 결과/안내 관찰, 다중 탭과 서명 nonce 경계.
- attempt-retention-cases.synthetic.json: 완료 후 재체험/진행 중 이어하기·시도별 완료 표식·90일/7일 보관과 만료 사례.
- utm-cases.synthetic.json: 승인된 여섯 조합, 최초/최근 외부 출처와 시도 귀속. 새 참여용 링크를 만들지 않는다.
- invalid-input-cases.synthetic.json / record-cases.synthetic.json: 금지·서버 소유 필드 거부와 요청/ACK/오류·중복 사례. duplicate를 원장에 다시 추가하지 않는다.
- source-mapping.synthetic.json: 같은 source의 건수를 합산한 뒤 비율 재계산. 비율 평균/그룹 distinct 합산 금지.
- signing-vector.synthetic.json: 공개 합성 키로 만든 정확한 UTF-8 HMAC 바이트와 변조·재전송 예시. 운영 자격 증명이 아니다.

12:00 KST E7/S6/C3, 13:00 KST E7/S6/C4는 기존 시도의 합성 예시다. 다음 날 00:00 KST에는 기간을 새로 계산해 I가 들어오므로 E8/S6/C4가 된다. 실제 일정이나 실적이 아니다.

synthetic/warning 등 바깥 포장은 검토 메타데이터다. 실제 요청에는 request만, 원장 계산에는 records만 사용한다. 실제 신청 DTO/신청 ID/전화번호·주소 등을 분석 예시와 연결하지 않는다. 새 사례의 기대값은 해당 사례 입력에만 대응하며 다른 파일 원장에 임의로 합치지 않는다.

## 이력과 검증 범위

- history/0.1.0-draft.2/에 당시 22개 manifest 파일과 manifest/합의/운영·진행 기록을 동일 바이트로 보존했다.
- draft.3은 정책 의미가 바뀐 예시와 버전 문자열에 영향을 받는 서명을 갱신했다. 이전 검증 이력은 archive의 validation.md에 남아 있다.
- 현재 검증은 docs의 JSON/계약/합성 계산에 한정한다. 앱 코드·수집기 실행·린트·서버·실제 분석 연결 검증이 아니다.
- agreement.md는 동결된 최종 contract/manifest와 관리자 검토 해시를 참조한다. 이전 해시를 새 합의의 해시로 조용히 재사용하지 않는다.
