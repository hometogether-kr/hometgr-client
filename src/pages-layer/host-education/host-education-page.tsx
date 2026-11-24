import Image from "next/image";
import Link from "next/link";

import { ROUTES } from "@/shared/config";
import { SiteLayout } from "@/widgets/site-layout";

import { EducationGallery } from "./ui/education-gallery";
import { educationPhotos } from "./photos";

import styles from "./host-education.module.css";

const programs = [
  { partner: "노원구 공모사업", subject: "시니어 디지털 교육" },
  { partner: "공릉종합사회복지관", subject: "AI 교육" },
  { partner: "공릉 노인복지관", subject: "시니어 디지털 교육" },
];

export function HostEducationPage() {
  return (
    <SiteLayout background="white">
      <div className={styles.page}>
        <div className={styles.container}>
          <nav className={styles.breadcrumb} aria-label="현재 위치">
            <Link href={ROUTES.intro.host}>집주인 서비스 소개</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">지역사회 교육</span>
          </nav>
          <section className={styles.hero} aria-labelledby="education-title">
            <div className={styles.heroText}>
              <p className={styles.location}>서울 노원구 · 공릉동</p>
              <h1 id="education-title">
                어르신과 함께한
                <br />
                <strong>디지털 교실</strong>
              </h1>
              <p className={styles.lede}>
                노원구에서 어르신들과 디지털·AI 수업을 했습니다. 사진에 안부 인사를 담아 보내는
                법부터 챗GPT 사용료까지, 어르신들이 수업에 가져오신 궁금증을 소개합니다.
              </p>
              <div className={styles.heroLinks}>
                <a className={styles.galleryLink} href="#field-notes">
                  수업 이야기 읽기 <span aria-hidden="true">↓</span>
                </a>
                <a className={styles.photoLink} href="#class-photos">
                  수업 사진 보기
                </a>
              </div>
            </div>
            <div className={styles.album}>
              <div className={styles.classroom}>
                <Image
                  src="/images/host-education/digital-learning.webp"
                  width={640}
                  height={480}
                  sizes="(max-width: 720px) 84vw, 500px"
                  preload
                  alt="교실에서 어르신과 청년이 두 사람씩 책상에 앉아 스마트폰을 살펴보는 모습"
                />
              </div>
              <div className={styles.portrait}>
                <Image
                  src="/images/host-education/digital-guidance.webp"
                  width={640}
                  height={853}
                  sizes="(max-width: 720px) 32vw, 175px"
                  alt="청년과 어르신이 한 화면을 보며 이야기하는 모습"
                />
              </div>
            </div>
          </section>
        </div>
        <section className={styles.programs} aria-labelledby="education-programs">
          <div className={`${styles.container} ${styles.programLayout}`}>
            <div>
              <h2 id="education-programs">함께한 교육</h2>
              <p>
                노원구 공모사업과 공릉 노인복지관의 디지털 교육, 공릉종합사회복지관의 AI 교육에
                함께했습니다. 청년들은 수업을 준비하고, 교실에서는 어르신 곁에 앉아 실습을
                도왔습니다.
              </p>
            </div>
            <dl className={styles.programList}>
              {programs.map(({ partner, subject }) => (
                <div key={partner}>
                  <dt>{partner}</dt>
                  <dd>{subject}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
        <article
          id="field-notes"
          className={`${styles.container} ${styles.journal}`}
          aria-labelledby="field-title"
        >
          <header className={styles.journalHeader}>
            <p className={styles.location}>
              <time dateTime="2026-08-20">2026년 8월 20일</time> · 공릉 노인복지관
            </p>
            <h2 id="field-title">휴대전화 한 대를 사이에 두고</h2>
          </header>
          <div className={styles.dispatch}>
            <figure className={styles.storyImage}>
              <Image
                src="/images/host-education/table-conversation.webp"
                alt="책상 위 휴대전화를 사이에 두고 어르신이 맞은편 청년에게 손짓하며 이야기하는 모습"
                width={1120}
                height={629}
                sizes="(max-width: 720px) 95vw, 510px"
              />
              <figcaption>공릉 노인복지관 ‘내 손 안의 정보 도우미’ 수업 중</figcaption>
            </figure>
            <div className={styles.prose}>
              <p>
                “궁금한 것은 무엇이든지 물어보세요!” 공릉 노인복지관 교육실 앞 화면에 적힌 말입니다.
                이날 수업 이름은 ‘내 손 안의 정보 도우미’였습니다.
              </p>
              <p>
                작은 책상 하나를 사이에 두고 어르신과 청년이 마주 앉았습니다. 한 어르신은 휴대전화를
                탁자에 내려놓고 손짓을 곁들여 이야기를 건네셨습니다. 다른 자리에서는 두 사람이
                나란히 고개를 숙여 같은 화면을 들여다봤습니다.
              </p>
            </div>
          </div>
        </article>
        <section className={styles.practice} aria-labelledby="practice-title">
          <div className={`${styles.container} ${styles.practiceLayout}`}>
            <div className={styles.practiceCopy}>
              <h2 id="practice-title">내 휴대전화로 다시 해 보는 시간</h2>
              <div className={styles.prose}>
                <p>
                  디지털 수업에서는 어르신이 평소 휴대전화를 쓰면서 어느 대목에서 막히셨는지 먼저
                  들었습니다. 말로 설명하기 어려운 부분은 쓰시던 화면을 함께 보며 짚었습니다. 청년이
                  옆에서 다음 순서를 안내하면, 어르신이 손에 든 휴대전화로 직접 눌러 보셨습니다.
                </p>
                <p>
                  한 어르신은 설명을 듣고 같은 순서를 몇 차례 되풀이하셨습니다. 그리고 이번에는
                  혼자서 해 보셨습니다. 한 번 들은 사용법을 나중에도 떠올릴 수 있도록, 각자
                  익숙해지는 데 필요한 만큼 연습했습니다.
                </p>
              </div>
            </div>
            <figure className={`${styles.storyImage} ${styles.practiceImage}`}>
              <Image
                src="/images/host-education/digital-phone-private.webp"
                alt="어르신이 자신의 스마트폰을 두 손에 들고 손가락으로 화면을 조작하는 모습"
                width={640}
                height={853}
                sizes="(max-width: 720px) 95vw, 360px"
              />
              <figcaption>설명을 듣고 자신의 휴대전화로 실습하는 모습</figcaption>
            </figure>
          </div>
        </section>
        <section className={`${styles.container} ${styles.topics}`} aria-labelledby="topics-title">
          <h2 id="topics-title">수업에서 만난 궁금증</h2>
          <dl className={styles.topicList}>
            <div>
              <dt>사진 한 장에 안부를 담아서</dt>
              <dd>
                카카오톡에서 같은 사진을 여러 사람에게 보내려면 어떻게 하는지 묻는 어르신이
                계셨습니다. 사진 위에 직접 인사말을 적어 보내고 싶다는 이야기도 나왔습니다.
              </dd>
            </div>
            <div>
              <dt>유튜브를 보다가 마주친 광고</dt>
              <dd>
                유튜브에서는 지금 보고 있는 것이 광고인지, 내가 보려고 고른 영상인지 구분하기
                어려워하는 어르신도 계셨습니다.
              </dd>
            </div>
            <div>
              <dt>챗GPT를 쓸 때 드는 비용</dt>
              <dd>챗GPT를 써 보던 한 어르신은 이 서비스를 이용하는 데 돈이 드는지 물으셨습니다.</dd>
            </div>
          </dl>
        </section>
        <section
          id="class-photos"
          className={`${styles.container} ${styles.photos}`}
          aria-labelledby="photo-title"
        >
          <div className={styles.galleryHeading}>
            <h2 id="photo-title">수업 풍경</h2>
            <p>사진을 누르면 크게 볼 수 있어요.</p>
          </div>
          <EducationGallery photos={educationPhotos} />
        </section>
      </div>
    </SiteLayout>
  );
}
