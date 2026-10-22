import Image from "next/image";
import type { ReactNode } from "react";

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

export function ShinhanHostProcess() {
  return (
    <section className={styles.section} aria-labelledby="shinhan-host-process-heading">
      <div className={styles.container}>
        <h2 id="shinhan-host-process-heading" className={styles.heading}>
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
                className={styles.roomGlow}
                src="/images/shinhan/host/process-room-glow.svg"
                alt=""
                width={495}
                height={488}
              />
              <Image
                className={styles.beforePhoto}
                src="/images/shinhan/host/process-before.png"
                alt="매니저 점검 전 빈방"
                width={180}
                height={207}
                sizes="(min-width:768px) 180px, 112px"
              />
              <Image
                className={styles.afterPhoto}
                src="/images/shinhan/host/process-after.png"
                alt="매니저 점검 후 침대와 책상이 준비된 방"
                width={269}
                height={310}
                sizes="(min-width:768px) 269px, 169px"
              />
              <Image
                className={styles.roomArrow}
                src="/images/shinhan/host/process-before-after-arrow.svg"
                alt=""
                width={35}
                height={35}
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
              <StudentExample />
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
                sizes="(min-width: 768px) 513px, calc(100vw - 40px)"
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
                sizes="(min-width: 768px) 499px, calc(100vw - 40px)"
              />
            </figure>
          </li>
        </ol>
      </div>
    </section>
  );
}

function StudentExample() {
  return (
    <div
      className={styles.candidates}
      role="img"
      aria-label="신원 검증 완료된 후보 A의 나이, 재학 정보, 희망 거주기간과 입주 희망일을 확인하는 예시"
    >
      <Image
        className={styles.studentGlow}
        src="/images/shinhan/host/process-student-glow.svg"
        alt=""
        width={758}
        height={623}
      />
      {[
        ["B", "서울여자대학교"],
        ["C", "광운대"],
      ].map(([name, university]) => (
        <div
          key={name}
          className={`${styles.otherCandidate} ${name === "C" ? styles.lastCandidate : ""}`}
          aria-hidden="true"
        >
          <div className={styles.otherIdentity}>
            <span />
            <p>
              21세
              <br />
              <strong>후보 {name}</strong>
              <br />
              {university}
            </p>
          </div>
          <i />
          <i />
          <i />
        </div>
      ))}
      <div className={styles.candidate} aria-hidden="true">
        <strong className={styles.verified}>신원 검증 완료</strong>
        <div className={styles.identity}>
          <div className={styles.avatar}>
            <Image
              className={styles.avatarBase}
              src="/images/shinhan/host/process-avatar-base.svg"
              alt=""
              width={71}
              height={71}
            />
            <span className={styles.hairLeft} />
            <span className={styles.hairRight} />
            <Image
              className={styles.avatarBody}
              src="/images/shinhan/host/process-avatar-body.svg"
              alt=""
              width={29.472}
              height={23.443}
            />
            <Image
              className={styles.avatarFace}
              src="/images/shinhan/host/process-avatar-face.svg"
              alt=""
              width={46.886}
              height={46.048}
            />
            <Image
              className={styles.eyeLeft}
              src="/images/shinhan/host/process-avatar-eye.svg"
              alt=""
              width={2.009}
              height={2.679}
            />
            <Image
              className={styles.eyeRight}
              src="/images/shinhan/host/process-avatar-eye.svg"
              alt=""
              width={2.009}
              height={2.679}
            />
            <Image
              className={styles.mouth}
              src="/images/shinhan/host/process-avatar-mouth.svg"
              alt=""
              width={1.388}
              height={1.85}
            />
          </div>
          <p>
            <small>23세</small>
            <strong>후보 A</strong>
            <span>서울과학기술대학교</span>
          </p>
        </div>
        <dl>
          <div>
            <dt>희망 거주기간</dt>
            <dd>6개월</dd>
          </div>
          <div>
            <dt>입주 희망일</dt>
            <dd>10월 초</dd>
          </div>
        </dl>
        <p className={styles.candidateDescription}>
          주중에는 학교에 오래 있다가 오후 10시쯤 귀가할 예정이고 주말에는 대부분 본가에 갑니다
        </p>
        <span className={styles.exampleAction}>만나보고 싶어요</span>
      </div>
    </div>
  );
}
