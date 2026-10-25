import Image from "next/image";

import { ShinhanEntryNotice, ShinhanHostFormButton } from "@/features/shinhan-intake";

import styles from "./guest-service.module.css";

const asset = "/images/shinhan/guest/";
const checks = [
  {
    icon: "/images/guest-landing/imgFrame261.svg",
    title: "신원확인",
    detail: "신분증,\n본인인증 완료",
  },
  { icon: `${asset}service-work.svg`, title: "직업정보", detail: "재직,\n소득 등 확인" },
  { icon: "/images/guest-landing/imgFrame260.svg", title: "가족관계", detail: "가족\n구성원 확인" },
  {
    icon: "/images/guest-landing/imgFrame262.svg",
    title: "생활패턴",
    detail: "라이프\n스타일 점검",
  },
];

const roomFeatures = [
  {
    icon: "service-check.svg",
    width: 28,
    height: 28,
    title: "최소 기준 통과",
    detail: "침대, 책상, 수납함 구비",
  },
  {
    icon: "service-private-space.png",
    width: 27,
    height: 29,
    title: "개인 공간 분리",
    detail: "나만의 방에서 편하게",
  },
  {
    icon: "service-common-space.png",
    width: 27,
    height: 29,
    title: "공용 공간 분리",
    detail: "주방, 거실, 세탁공간 별도 이용",
  },
];

export function ShinhanGuestService() {
  return (
    <section className={styles.service} aria-label="홈투게더의 생활과 서비스">
      <div className={`${styles.container} ${styles.rows}`}>
        <article className={styles.row} aria-labelledby="shinhan-guest-host-heading">
          <div className={styles.copy}>
            <h2 id="shinhan-guest-host-heading">
              믿을 수 있는 호스트와,
              <br />한 학기(4개월)부터 편하게
            </h2>
            <p>
              홈투게더는 신원과 생활환경이 확인된 믿을 수 있는 호스트와 게스트를 연결해요
              <br />
              학생분들도 한 학기 동안만 머무를 수 있는 단기계약이 가능해, 학업 일정에 맞춰 유연하게
              이용할 수 있어요.
            </p>
            <ul className={styles.checks}>
              {checks.map((check) => (
                <li key={check.title}>
                  <Image src={check.icon} width={46} height={46} alt="" />
                  <h3>{check.title}</h3>
                  <p>{check.detail}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className={`${styles.artwork} ${styles.hostArtwork}`}>
            <Image
              className={styles.artworkImage}
              src={`${asset}service-host-art.png`}
              width={674}
              height={645}
              alt="좋은 인연이 되길 바라요! 집주인과 입주자가 만나는 모습"
              sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1279px) 55vw, 674px"
            />
            <div className={styles.artBadges}>
              <span>
                <Image src={`${asset}service-contract.svg`} width={22} height={22} alt="" />
                최소 4개월 (한학기)~ 6개월 단위 계약 가능
              </span>
              <span>
                <Image src="/images/guest-landing/imgFrame267.svg" width={19} height={20} alt="" />
                생활환경 점검
              </span>
            </div>
          </div>
        </article>
        <article
          className={`${styles.row} ${styles.reversed}`}
          aria-labelledby="shinhan-guest-private-heading"
        >
          <div className={styles.copy}>
            <h2 id="shinhan-guest-private-heading">
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
            <ul className={styles.featureList}>
              {roomFeatures.map((feature) => (
                <li key={feature.title}>
                  <Image
                    src={asset + feature.icon}
                    width={feature.width}
                    height={feature.height}
                    alt=""
                  />
                  <span>
                    <strong>{feature.title}</strong>
                    <span>{feature.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className={`${styles.artwork} ${styles.roomArtwork}`}>
            <Image
              className={styles.artworkImage}
              src={`${asset}service-room-art.png`}
              width={687}
              height={597}
              alt="나만의 아늑한 공간! 개인 방에서 노트북으로 공부하는 입주자"
              sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1279px) 55vw, 687px"
            />
          </div>
        </article>
        <article className={styles.row} aria-labelledby="shinhan-guest-support-heading">
          <div className={styles.copy}>
            <h2 id="shinhan-guest-support-heading">
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
            <ul className={styles.featureList}>
              <li>
                <Image
                  src="/images/guest-landing/imgFrame263.svg"
                  width={26.6164}
                  height={28.2711}
                  alt=""
                />
                <span>
                  <strong>빠른 중재</strong>
                  <span>불편사항 신속 대응</span>
                </span>
              </li>
              <li>
                <Image src={`${asset}service-agreement.png`} width={27} height={29} alt="" />
                <span>
                  <strong>생활 규칙 합의서</strong>
                  <span>함께 정하는 편안한 생활</span>
                </span>
              </li>
              <li>
                <Image src={`${asset}service-adjustments.png`} width={27} height={29} alt="" />
                <span>
                  <strong>성향 맞춤 조율</strong>
                  <span>서로의 라이프스타일 반영</span>
                </span>
              </li>
            </ul>
          </div>
          <div className={`${styles.artwork} ${styles.supportArtwork}`}>
            <Image
              className={styles.artworkImage}
              src={`${asset}service-support-art.png`}
              width={640}
              height={566}
              alt="함께여서 더 좋은 하루! 생활을 안내하는 홈투게더 매니저"
              sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1279px) 55vw, 640px"
            />
            <div className={styles.artBadges}>
              <span>
                <Image src={`${asset}service-cs.svg`} width={26.6164} height={28.2711} alt="" />
                <span>
                  <strong>쉬지않는 CS</strong> 언제든 불편사항 문의 가능
                </span>
              </span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export function ShinhanGuestHostBand() {
  return (
    <section className={styles.hostBand} aria-labelledby="shinhan-guest-host-band-heading">
      <div className={`${styles.container} ${styles.hostBandInner}`}>
        <div>
          <p>홈투게더에서 거주 중인 집에 비어있는 방으로</p>
          <h2 id="shinhan-guest-host-band-heading">홈쉐어를 시작해 보세요</h2>
        </div>
        <div className={styles.hostAction}>
          <ShinhanHostFormButton
            flow="registration"
            variant="stroke"
            size="pill"
            className={styles.hostButton}
            aria-describedby="shinhan-guest-host-registration-notice"
            rightIcon={
              <Image
                className={styles.hostPlus}
                src={`${asset}service-host-plus.svg`}
                width={28.0039}
                height={28.0039}
                alt=""
              />
            }
          >
            홈투게더에 방 등록하기
          </ShinhanHostFormButton>
          <p id="shinhan-guest-host-registration-notice" className={styles.notice}>
            <ShinhanEntryNotice>
              집 위치와 연락처를 입력해 방 등록을 신청해 보세요.
            </ShinhanEntryNotice>
          </p>
        </div>
      </div>
    </section>
  );
}
