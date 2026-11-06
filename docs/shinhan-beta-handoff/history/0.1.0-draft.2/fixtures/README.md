# 합성 fixtures — 실제 데이터 아님

계약: 0.1.0-draft.2. 로컬 검토 자료이며 네트워크 전송/실제 시트 업로드 금지.

- events.synthetic.json: 정확한 17필드의 합성 원장20행. 모두 connection_test.
- scenarios.synthetic.json: A~J 시도/경계. A/B 동일 브라우저·다른 흐름.
- invalid-input-cases.synthetic.json: 금지 키/서버 소유 필드/role-flow/시도 결합 오류 거부 예시. sentinel은 실제 개인정보/신청 ID가 아니다.
- record-cases.synthetic.json: request와 BFF HTTP/JSON ACK/error. 각 precondition을 적용하고 중복을 원장에 다시 더하지 않는다.
- aggregate-query.synthetic.json: KST entry cohort/as_of 요청.
- admin-aggregate*.expected.synthetic.json: 24h 직전/정확히24h/늦은완료 후/기간 종료 경계의 기대값.
- aggregate-states.synthetic.json: 미연결/정상0/stale/오류/공개 완전 억제.
- public-aggregate.expected.synthetic.json: 정책 미확정 disabled.
- observation-cases.synthetic.json: 네 흐름 관찰 조건과 이벤트 기대 개수.
- utm-cases.synthetic.json: 확정6조합과 최초/최근/시도 귀속.
- signing-vector.synthetic.json: 공개 합성 키/정확한 UTF-8 HMAC 바이트와 예상 hex. 운영 credential 아님.

synthetic/warning/contract_version 포장은 metadata다. BFF에는 request만, 원장 재계산에는 records만 사용한다. 실제 신청 mock DTO는 분석 데이터와 분리한다.

2026-10-27 12:00 KST에 E7/S6/C3, 13:00 KST에 E7/S6/C4. 실제 베타 일정/수치가 아니다. manifest.json은 자기 자신을 제외한 계약/계획/fixtures SHA256을 담는다.


추가 draft.2 자료: source-mapping.synthetic.json(동일source 합산), admin-snapshot-cases.synthetic.json(운영 latest 조회/동일scope fallback/clean 시간경과), public-aggregate-cases.synthetic.json(공개 count/rate/source와 모든 상태), concurrency-and-nonce.synthetic.json(다른flow 탭경쟁/nonce 끝초). 기존 aggregate-query는 순수 계산 입력이며 운영 RPC가 아니다. 공개 fixture 정책/300000ms 한도는 합성 예시로 운영 승인을 뜻하지 않는다.

history/는 이전 검토 원본이다. 현재 manifest는 현재 묶음만 해시하고 history/, agreement.md, manifest.json 자체는 제외한다. agreement.md는 동결된 계약/manifest와 관리자 리뷰 해시를 참조한다.
