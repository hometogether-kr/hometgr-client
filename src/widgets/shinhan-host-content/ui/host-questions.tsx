import styles from "./host-questions.module.css";

export function ShinhanHostChecklist() {
  return (
    <section className={styles.topSection} aria-labelledby="shinhan-host-checklist-heading">
      <div className={styles.container}>
        <header className={styles.topHeading}>
          <p className={styles.eyebrow}>시작 전 확인 TOP 3</p>
          <h2 id="shinhan-host-checklist-heading" className={styles.heading}>
            가장 궁금한 세 가지, 먼저 확인하세요
          </h2>
        </header>
        <div className={styles.topCards}>
          <article className={styles.topCard}>
            <h3>어떤 청년이 들어오나요?</h3>
            <p className={styles.topSummary}>입주 전에 확인하고, 동의한 뒤에 들어옵니다.</p>
            <p>
              본인 확인과 재학 등 신청 자격을 확인하고, 거주 기간·생활패턴·흡연 여부·공용공간 이용
              조건을 함께 살펴봅니다. 귀가와 출입, 방문객, 소음, 공용시설 이용 규칙은 입주 전에 정해
              서로 확인합니다.
            </p>
            <p>
              집주인이 확인하고 동의하지 않은 상태로 입주가 진행되지 않습니다. 중요하게 생각하는
              조건이 있다면 상담 단계에서 알려주세요.
            </p>
            <a className={styles.categoryLink} href="#shinhan-host-faq-living">
              입주 준비·공동생활 질문 더 보기
            </a>
          </article>
          <article className={styles.topCard}>
            <h3>세금은 어떻게 되나요?</h3>
            <p className={styles.topSummary}>
              1주택이고 기준시가 12억 원 이하면 월세 소득은 비과세입니다.
            </p>
            <p>
              부부 합산으로 국내 주택이 1채뿐이고 그 주택의 기준시가가 12억 원 이하라면, 방 일부를
              임대해 받는 월세는 과세되지 않습니다.
              <br />
              배우자 명의 주택도 합산하므로 집값뿐 아니라 보유 주택 수를 함께 확인해야 합니다.
            </p>
            <p>
              기준시가를 넘더라도 연간 주택임대 수입이 2,000만 원 이하면 분리과세를 선택할 수
              있습니다. 기준시가는 실거래가나 호가가 아니라 세법상 금액으로, &apos;부동산공시가격
              알리미&apos;에서 조회합니다.
            </p>
            <p className={styles.taxYear}>기준: 2026년 귀속</p>
            <p className={styles.taxBox}>
              과세되는 임대소득은 건강보험료 산정에 반영될 수 있고, 기초연금은 별도의 소득인정액
              기준을 적용합니다. 개인별 과세·신고 여부는 국세청 또는 세무전문가에게 확인해 주세요.
            </p>
            <a className={styles.categoryLink} href="#shinhan-host-faq-tax">
              월세 수입·세금 질문 더 보기
            </a>
          </article>
          <article className={styles.topCard}>
            <h3>문제가 생기면 누가 해결하나요?</h3>
            <p className={styles.topSummary}>혼자 감당하지 않으셔도 됩니다.</p>
            <p>
              불편한 상황이 생기면 홈투게더에 알려주세요. 언제 무슨 일이 있었는지와 입주 전에 정한
              생활규칙을 확인하고, 양쪽 이야기를 들어 조율을 지원합니다.
            </p>
            <p>
              가구나 시설이 손상되면 정상적인 사용에 따른 노후화와 고의·과실에 따른 손상을 구분해
              책임 범위를 확인합니다. 입주 전 방과 가구 상태를 사진으로 남겨두시면 확인이 쉽습니다.
            </p>
            <p>
              문제가 반복되거나 계약 유지가 어려우면 계약 내용과 관계 법령에 따른 후속 절차를
              안내합니다.
            </p>
            <a className={styles.categoryLink} href="#shinhan-host-faq-contract">
              계약·정산·거주 관리 질문 더 보기
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
