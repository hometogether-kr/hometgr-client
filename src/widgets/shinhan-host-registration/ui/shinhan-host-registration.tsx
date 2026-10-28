import Image from "next/image";
import Link from "next/link";

import styles from "./shinhan-host-registration.module.css";

export function ShinhanHostRegistration() {
  return (
    <section className={styles.section} aria-labelledby="host-registration-title">
      <div className={styles.container}>
        <Link className={styles.backLink} href="/shinhan/host">
          ← 홈으로 돌아가기
        </Link>
        <div className={styles.panel}>
          <div className={styles.introduction}>
            <p className={styles.eyebrow}>우리 집 빈방 등록하기</p>
            <h1 id="host-registration-title">
              카카오톡으로 대화하면
              <br />
              <em>홈투AI가 방 등록을</em>
              <br />
              도와드려요.
            </h1>
            <p className={styles.description}>
              우리 집 정보만 카카오톡 채팅으로 알려주세요.
              <br />
              AI 도우미 홈투AI가 방 등록을 도와드릴게요.
            </p>
            <div className={styles.action}>
              <a
                className={styles.kakao}
                href="http://pf.kakao.com/_ZgxaxiX/chat"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/images/shinhan/host/registration-chat.svg"
                  alt=""
                  width={24}
                  height={24}
                />
                <span>홈투AI와 카카오톡에서 집 등록하기</span>
                <Image
                  src="/images/shinhan/host/registration-arrow.svg"
                  alt=""
                  width={24}
                  height={24}
                />
                <span className="sr-only"> (새 창)</span>
              </a>
              <p>버튼을 누르면 홈투AI 카카오톡 채팅방으로 이동해요.</p>
            </div>
          </div>
          <figure className={styles.illustration}>
            <Image
              src="/images/shinhan/host/registration-ai.png"
              alt="집과 카카오톡 대화를 안내하는 홈투AI 일러스트"
              width={500}
              height={500}
              sizes="(max-width: 767px) calc(100vw - 80px), 500px"
            />
            <figcaption>카카오톡에서 홈투AI와 이야기해요</figcaption>
          </figure>
        </div>
        <p className={styles.caption}>시니어 분들도 쉽게 사용할 수 있는 매물 등록 방법</p>
      </div>
    </section>
  );
}
