import type { ReactNode } from "react";

import styles from "./shinhan-privacy-document.module.css";

interface ShinhanPrivacyDocumentProps {
  topNavigation?: ReactNode;
  bottomNavigation?: ReactNode;
}

// Figma 591:5063 is the display source, not an API consent snapshot/version.
const collectedItems = [
  {
    application: "게스트 상세조건 안내 신청",
    items: "휴대폰 번호, 월세 예산, 희망 지역, 희망 입주 시기",
  },
  {
    application: "게스트 입주 조건 확인",
    items: "휴대폰 번호, 희망 지역, 희망 월세 범위, 희망 입주 시점, 희망 계약 기간, 성별",
  },
  {
    application: "호스트 방 등록",
    items: "휴대폰 번호, 자가 여부, 주택의 대략적인 위치(시·군·구·동)",
  },
  {
    application: "호스트 예상 월세 산정",
    items: "주택 주소·동·호수, 제공 가구와 준비 상태, 화장실 개수",
  },
  {
    application: "호스트 청년 소개서 알림",
    items: "휴대폰 번호 및 앞서 입력한 주택 정보",
  },
];

export function ShinhanPrivacyDocument({
  topNavigation,
  bottomNavigation,
}: ShinhanPrivacyDocumentProps) {
  return (
    <article className={styles.document} aria-labelledby="shinhan-privacy-heading">
      {topNavigation && <div className={styles.topNavigation}>{topNavigation}</div>}
      <header className={styles.heading}>
        <p className={styles.eyebrow}>필수 동의 · 호스트 및 게스트 신청</p>
        <h1 id="shinhan-privacy-heading">개인정보 수집·이용 동의</h1>
        <p className={styles.introduction}>
          주식회사 핀타(이하 “회사”)는 홈투게더의 방 등록, 예상 월세 및 청년 소개서 안내, 상세조건
          및 입주 안내 신청을 처리하기 위해 다음과 같이 개인정보를 수집·이용합니다.
        </p>
      </header>

      <dl className={styles.summary}>
        <div>
          <dt>개인정보처리자</dt>
          <dd>주식회사 핀타</dd>
        </div>
        <div>
          <dt>보유 및 이용 기간</dt>
          <dd className={styles.retention}>수집일로부터 1년</dd>
        </div>
      </dl>

      <section className={styles.section} aria-labelledby="shinhan-privacy-purpose">
        <h2 id="shinhan-privacy-purpose">1. 개인정보 수집·이용 목적</h2>
        <div className={styles.paragraphs}>
          <p>
            호스트의 주택 정보를 확인하여 예상 월세를 산정하고, 방 등록 심사·결과 및 조건에 맞는
            청년 소개서를 안내하기 위해 이용합니다.
          </p>
          <p>
            게스트의 희망 조건을 확인하여 방의 상세조건 및 입주 가능 여부를 안내하기 위해
            이용합니다.
          </p>
          <p>
            신청 접수·처리 결과 안내와 전화·문자·알림톡 등을 통한 관련 상담 및 문의 응대에
            이용합니다.
          </p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="shinhan-privacy-items">
        <h2 id="shinhan-privacy-items">2. 수집·이용하는 개인정보 항목</h2>
        <p>이용자가 해당 서비스의 신청 화면에서 직접 입력하거나 선택한 항목만 수집합니다.</p>
        <div className={styles.tableFrame}>
          <table className={styles.table}>
            <caption className="sr-only">신청 유형별 수집 항목</caption>
            <thead>
              <tr>
                <th scope="col">신청 유형</th>
                <th scope="col">수집 항목</th>
              </tr>
            </thead>
            <tbody>
              {collectedItems.map((item) => (
                <tr key={item.application}>
                  <th scope="row">{item.application}</th>
                  <td>{item.items}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.note}>
          성별은 집주인과 함께 거주하는 주택의 입주 조건을 확인하는 데 이용합니다.
        </p>
      </section>

      <section className={styles.section} aria-labelledby="shinhan-privacy-retention">
        <h2 id="shinhan-privacy-retention">3. 개인정보 보유 및 이용 기간</h2>
        <p className={styles.retentionPeriod}>수집일로부터 1년</p>
        <div className={styles.paragraphs}>
          <p>
            보유기간이 경과하거나 처리 목적을 달성하여 개인정보가 더 이상 필요하지 않은 경우 지체
            없이 파기합니다.
          </p>
          <p>
            다만, 다른 법령에 따라 보존해야 하는 경우에는 해당 법령에서 정한 기간 동안 분리하여
            보관한 후 파기합니다.
          </p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="shinhan-privacy-refusal">
        <h2 id="shinhan-privacy-refusal">4. 동의 거부 권리 및 거부 시 불이익</h2>
        <div className={styles.paragraphs}>
          <p>
            개인정보 수집·이용에 동의하지 않을 권리가 있습니다. 다만, 필수 항목의 수집·이용에
            동의하지 않으면 해당 신청의 정보 확인 및 연락이 어려워 그 신청에 따른 안내·상담 서비스를
            이용할 수 없습니다.
          </p>
          <p>동의하지 않아도 서비스 소개 및 공간 사진은 열람할 수 있습니다.</p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="shinhan-privacy-optional">
        <h2 id="shinhan-privacy-optional">5. 선택정보 및 별도 동의 안내</h2>
        <div className={styles.paragraphs}>
          <p>
            이 동의는 이용자가 선택한 호스트 또는 게스트 서비스 신청에 필요한 필수 정보에 대한
            동의입니다.
          </p>
          <p>
            홈쉐어링 걱정 항목 등 선택정보의 수집·이용 및 광고성 정보 수신 동의는 포함하지 않습니다.
            선택정보는 별도 안내와 동의에 따라 처리하며, 선택사항에 동의하지 않아도 해당 신청을
            이용할 수 있습니다.
          </p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="shinhan-privacy-contact">
        <h2 id="shinhan-privacy-contact">6. 동의 철회 및 개인정보 관련 문의</h2>
        <div className={styles.paragraphs}>
          <p>
            개인정보의 열람·정정·삭제·처리정지 또는 동의 철회를 원하시면 홈투게더 카카오톡 채널로
            요청해 주세요.
          </p>
          <p>회사는 본인 확인 후 관련 법령에 따라 요청을 처리합니다.</p>
        </div>
        <a
          href="https://pf.kakao.com/_BKlhX/chat"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.contactLink}
        >
          홈투게더 카카오톡 채널로 문의하기 <span aria-hidden="true">↗</span>
          <span className="sr-only"> (새 창)</span>
        </a>
      </section>

      <div className={styles.bottomNavigation}>
        {bottomNavigation}
        <p>동의 여부는 각 신청 화면에서 직접 선택해 주세요.</p>
      </div>
    </article>
  );
}
