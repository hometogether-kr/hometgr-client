import Image from "next/image";

import styles from "./guest-home.module.css";

const asset = "/images/guest-landing/";
const checks = [
  ["imgFrame261.svg", "신원확인", "신분증,\n본인인증 완료"],
  ["imgFrame265.svg", "직업정보", "재직,\n소득  등 확인"],
  ["imgFrame260.svg", "가족관계", "가족\n구성원 확인"],
  ["imgFrame262.svg", "생활패턴", "라이프\n스타일 점검"],
];

export function GuestBenefits() {
  return (
    <section className={styles.benefits} aria-label="홈투게더의 생활과 서비스">
      <div className={`${styles.container} ${styles.benefitRows}`}>
        <article className={styles.benefitRow}>
          <div className={styles.benefitCopy}>
            <h2>
              믿을 수 있는 호스트와,
              <br />한 학기부터 편하게
            </h2>
            <p>
              홈투게더는 신원과 생활환경이 확인된 믿을 수 있는 호스트와 게스트를 연결해요
              <br />
              학생분들도 한 학기 동안만 머무를 수 있는 단기계약이 가능해, 학업 일정에 맞춰 유연하게
              이용할 수 있어요.
            </p>
            <div className={styles.checks}>
              {checks.map(([icon, title, description]) => (
                <div key={title}>
                  <Image src={asset + icon} width={46} height={46} alt="" />
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className={`${styles.benefitArtwork} ${styles.hostArtwork}`}>
            <Image
              src={asset + "host-art.png"}
              width={674}
              height={645}
              alt="좋은 인연이 되길 바라요! 호스트와 함께하는 생활"
              className={styles.artworkImage}
            />
            <div className={styles.artBadges}>
              <span>
                <Image src={asset + "imgFrame266.svg"} width={22} height={22} alt="" />
                최소 4개월 (한학기)~ 6개월 단위 계약 가능
              </span>
              <span>
                <Image src={asset + "imgFrame267.svg"} width={19} height={20} alt="" />
                생활환경 점검
              </span>
            </div>
          </div>
        </article>
        <article className={`${styles.benefitRow} ${styles.reversed}`}>
          <div className={styles.benefitCopy}>
            <h2>
              나만의 코지한 방,
              <br />
              공용공간은 규칙과 함께
            </h2>
            <p>
              홈투게더는 침대, 책상, 수납함 등 최소 기준을 통과한 아늑한 방만 제공해요.
              <br />
              개인 공간과 공용 공간이 명확히 분리되어, 함께하면서도 나만의 공간을 편안하게 누릴 수
              있어요.
            </p>
            <ul className={styles.benefitList}>
              {[
                ["최소 기준 통과", "침대, 책상, 수납함 구비"],
                ["개인 공간 분리", "나만의  방에서  편하게"],
                ["공용 공간 분리", "주방, 거실, 세탁공간 별도 이용"],
              ].map(([title, detail]) => (
                <li key={title}>
                  <Image src={asset + "imgFrame259.svg"} width={28} height={28} alt="" />
                  <strong>{title}</strong>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={`${styles.benefitArtwork} ${styles.roomArtwork}`}>
            <Image
              src={asset + "room-art.png"}
              width={687}
              height={597}
              alt="나만의 아늑한 공간! 책상에서 공부하는 입주자"
              className={styles.artworkImage}
            />
          </div>
        </article>
        <article className={styles.benefitRow}>
          <div className={styles.benefitCopy}>
            <h2>
              생활 규칙은 합의서로,
              <br />
              문의는 365일 24시간
            </h2>
            <p>
              입주 전 서로의 생활 패턴과 성향을 고려해 생활규칙을 함께 논의하고, 별도의 서면
              합의서를 작성해요.
              <br />
              지내는 동안 불편하거나 궁금한 점이 생기면, 언제든지 365일 24시간 문의하실 수 있어요.
            </p>
            <ul className={styles.benefitList}>
              {[
                ["생활 규칙 합의서", "함께 정하는 편안한 생활"],
                ["성향 맞춤 조율", "서로의 라이프스타일 반영"],
                ["빠른 중재", "불편사항 신속 대응"],
              ].map(([title, detail]) => (
                <li key={title}>
                  <Image src={asset + "imgFrame263.svg"} width={26.6164} height={28.2711} alt="" />
                  <strong>{title}</strong>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={`${styles.benefitArtwork} ${styles.supportArtwork}`}>
            <Image
              src={asset + "support-art.png"}
              width={640}
              height={566}
              alt="함께여서 더 좋은 하루! 홈투게더 고객 상담"
              className={styles.artworkImage}
            />
            <div className={styles.artBadges}>
              <span>
                <Image src={asset + "imgFrame264.svg"} width={26.6164} height={28.2711} alt="" />
                <strong>쉬지않는 CS</strong> 언제든 불편사항 문의 가능
              </span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
