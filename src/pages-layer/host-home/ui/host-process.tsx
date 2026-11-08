import Image from "next/image";
import type { ReactNode } from "react";

import { hostContainer } from "./section-heading";

import styles from "./host-process.module.css";

const assetPath = "/images/host-landing/process";
const preparationSteps = [
  { icon: "plan", title: "준비 계획", description: "범위·비용\n함께 결정" },
  { icon: "clean", title: "정리·청소", description: "일정·진행\n꼼꼼히 관리" },
  { icon: "furniture", title: "가구 준비", description: "가구 마련과\n배치까지" },
  { icon: "inspect", title: "최종 점검", description: "가구·시설\n마지막 확인" },
];

interface ProcessDetailProps {
  icon: string;
  title: string;
  children: ReactNode;
}

function ProcessDetail({ icon, title, children }: ProcessDetailProps) {
  return (
    <li className={styles.detail}>
      <Image src={`${assetPath}/${icon}.png`} alt="" width={28} height={28} />
      <strong>{title}</strong>
      <span>{children}</span>
    </li>
  );
}

export function HostProcess() {
  return (
    <section className={styles.section} aria-labelledby="host-process-heading">
      <div className={hostContainer}>
        <h2 id="host-process-heading" className={styles.heading}>
          진행 방법
        </h2>
        <ol className={styles.rows}>
          <li className={styles.preparation}>
            <article className={`${styles.card} ${styles.preparationCard}`}>
              <h3>
                빈방 준비,
                <br />
                매니저에게 맡기세요
              </h3>
              <p className={styles.description}>
                준비 범위와 비용은 집주인과 함께 정하고,
                <br />
                정리·청소부터 가구 배치와 점검까지 도와드려요.
              </p>
              <ul className={styles.preparationSteps}>
                {preparationSteps.map((step) => (
                  <li key={step.icon}>
                    <Image
                      src={`${assetPath}/${step.icon}.png`}
                      alt=""
                      width={46}
                      height={step.icon === "clean" ? 49 : 46}
                    />
                    <strong>{step.title}</strong>
                    <span>{step.description}</span>
                  </li>
                ))}
              </ul>
            </article>
            <figure className={styles.room}>
              <Image
                src={`${assetPath}/room.png`}
                alt="매니저의 점검 전후 빈방 모습"
                width={695}
                height={565}
                sizes="(min-width: 1280px) 450px, (min-width: 768px) 540px, calc(100vw - 48px)"
              />
              <span className={styles.before}>점검 전</span>
              <span className={styles.after}>점검 후</span>
            </figure>
          </li>
          <li className={styles.selection}>
            <article className={`${styles.card} ${styles.selectionCard}`}>
              <h3>
                함께 살 학생,
                <br />
                최종 결정은 집주인이 합니다!
              </h3>
              <p className={styles.description}>
                본인·재학 정보와 생활조건을 먼저 확인해요.
                <br />
                우리 집과 잘 맞는 학생을 충분히 살펴보고 결정하세요.
              </p>
              <ul className={styles.details}>
                <ProcessDetail icon="rematch" title="마음에 드는 학생이 없으면">
                  다른 후보를 찾아드려요
                </ProcessDetail>
              </ul>
            </article>
            <div className={styles.student}>
              <Image
                src={`${assetPath}/student-verified.png`}
                alt="신원 검증 완료된 학생 후보의 나이와 재학 정보를 살펴보고 만남을 결정하는 예시"
                width={758}
                height={623}
                sizes="(min-width: 768px) 550px, calc(100vw - 48px)"
              />
            </div>
          </li>
          <li className={styles.rules}>
            <article className={`${styles.card} ${styles.rulesCard}`}>
              <h3>
                우리 집 생활규칙,
                <br />
                집주인이 직접 정해요
              </h3>
              <p className={styles.description}>
                입주 전 서로의 생활 패턴과 성향을 고려해 생활규칙을 함께 논의하고, 별도의 서면
                합의서를 작성해요.
                <br />
                지내는 동안 불편하거나 궁금한 점이 생기면, 언제든지 365일 24시간 문의하실 수 있어요.
              </p>
              <ul className={styles.details}>
                <ProcessDetail icon="rule" title="함께 정할 규칙">
                  주방 사용, 생활시간·소음, 방문객
                </ProcessDetail>
                <ProcessDetail icon="boundary" title="우리 집 기준">
                  세탁·청소, 공용·개인 공간 범위
                </ProcessDetail>
              </ul>
            </article>
            <div className={styles.rulesImage}>
              <Image
                src={`${assetPath}/rules.png`}
                alt="생활규칙 합의서와 생활조건 확인 화면"
                width={748}
                height={568}
                sizes="(min-width: 768px) 513px, calc(100vw - 48px)"
              />
            </div>
          </li>
          <li className={styles.support}>
            <article className={`${styles.card} ${styles.supportCard}`}>
              <h3>
                입주한 뒤에도,
                <br />
                매니저가 함께해요
              </h3>
              <p className={styles.description}>
                본인·재학 정보와 생활조건을 먼저 확인해요.
                <br />
                우리 집과 잘 맞는 학생을 충분히 살펴보고 결정하세요.
              </p>
              <ul className={styles.details}>
                <ProcessDetail icon="check" title="정기 확인">
                  안부와 생활 속 불편 확인
                </ProcessDetail>
                <ProcessDetail icon="phone" title="문의 접수">
                  전용 채널로 문의·불편 접수
                </ProcessDetail>
                <ProcessDetail icon="mediate" title="갈등 조율">
                  양측의 의견을 듣고 함께 조율
                </ProcessDetail>
              </ul>
            </article>
            <figure className={styles.activities}>
              <figcaption>매니저 정기점검</figcaption>
              <Image
                src={`${assetPath}/activities.png`}
                alt="집주인 및 학생과 만나 상담하고 생활을 확인하는 홈투게더 매니저의 활동 사진 다섯 장"
                width={866}
                height={574}
                sizes="(min-width: 768px) 499px, calc(100vw - 48px)"
              />
            </figure>
          </li>
        </ol>
      </div>
    </section>
  );
}
