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
            <figure className={styles.storyImage}>
              <Image
                src="/images/host-education/phone-lesson.webp"
                width={1160}
                height={870}
                sizes="(max-width: 720px) 94vw, 550px"
                preload
                alt="분홍색 상의를 입은 어르신과 청년이 나란히 앉아 책상 끝에 놓인 휴대전화를 함께 살펴보는 장면"
              />
              <figcaption>
                어르신이 화면을 눌러 보시는 동안, 청년도 옆에서 같은 화면을 봅니다.
              </figcaption>
            </figure>
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
                src="/images/host-education/digital-learning.webp"
                alt="공릉 노인복지관 교실 뒤편과 창가 쪽 책상에서 어르신과 청년이 둘씩 앉아 이야기하는 모습"
                width={640}
                height={480}
                sizes="(max-width: 720px) 94vw, 575px"
              />
              <figcaption>‘내 손 안의 정보 도우미’ 수업이 열린 공릉 노인복지관 교육실</figcaption>
            </figure>
            <div className={styles.dispatchNote}>
              <div className={styles.prose}>
                <p>
                  “궁금한 것은 무엇이든지 물어보세요!” 공릉 노인복지관 교육실 앞 화면에 적힌
                  말입니다. 이날 수업 이름은 ‘내 손 안의 정보 도우미’였습니다.
                </p>
                <p>
                  작은 책상 하나를 사이에 두고 어르신과 청년이 마주 앉았습니다. 한 어르신은
                  휴대전화를 탁자에 내려놓고 손짓을 곁들여 이야기를 건네셨습니다. 다른 자리에서는 두
                  사람이 나란히 고개를 숙여 같은 화면을 들여다봤습니다.
                </p>
              </div>
              <figure className={styles.storyImage}>
                <Image
                  src="/images/host-education/question-at-table.webp"
                  width={1040}
                  height={560}
                  sizes="(max-width: 720px) 94vw, 415px"
                  alt="어르신이 덮개를 펼쳐 놓은 휴대전화 위로 손을 들어 맞은편 청년에게 이야기하는 모습"
                />
                <figcaption>휴대전화를 책상에 펼쳐 놓고 이야기를 나누던 자리</figcaption>
              </figure>
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
                  한 어르신은 설명을 들은 뒤 같은 순서를 세 번쯤 되풀이하셨습니다. 처음에는 청년과
                  화면을 함께 보셨고, 그다음에는 혼자서 해 보셨습니다. 같은 동작이어도 손에 익는
                  속도는 저마다 달랐습니다.
                </p>
              </div>
            </div>
            <figure className={`${styles.storyImage} ${styles.practiceImage}`}>
              <Image
                src="/images/host-education/practice-by-window.webp"
                alt="흰 모자를 쓴 어르신이 창가 책상에 앉아 자신의 휴대전화를 두 손으로 들여다보는 모습"
                width={760}
                height={995}
                sizes="(max-width: 720px) 86vw, 350px"
              />
              <figcaption>창가에 앉아 두 손에 든 휴대전화를 들여다보는 어르신</figcaption>
            </figure>
          </div>
        </section>
        <section className={`${styles.container} ${styles.topics}`} aria-labelledby="topics-title">
          <div className={styles.topicsIntro}>
            <h2 id="topics-title">수업에서 만난 궁금증</h2>
            <figure className={styles.storyImage}>
              <Image
                src="/images/host-education/guided-tap.webp"
                width={1020}
                height={602}
                sizes="(max-width: 720px) 94vw, 365px"
                alt="탁자에 놓인 스마트폰의 화면을 어르신이 손끝으로 누르고 옆에서 청년이 안내하는 손동작"
              />
              <figcaption>청년이 가리킨 곳을 어르신이 직접 눌러 보셨습니다.</figcaption>
            </figure>
          </div>
          <dl className={styles.topicList}>
            <div>
              <dt>사진 한 장에 안부를 담아서</dt>
              <dd>
                풍경 사진에 안부 인사를 한 줄 적어 가족과 지인에게 보내고 싶다는 어르신이
                계셨습니다. 카카오톡으로 같은 사진을 여러 사람에게 보내려면 어떻게 하는지도 수업에서
                나온 질문이었습니다.
              </dd>
            </div>
            <div>
              <dt>이모티콘을 보낼 때도 돈이 들까</dt>
              <dd>
                카카오톡에 보이는 이모티콘을 하나 보내면 돈이 드는지 물으신 분도 계셨습니다. 보내는
                버튼을 누르기 전에 먼저 알고 싶으셨던 부분입니다.
              </dd>
            </div>
            <div>
              <dt>유튜브를 보다가 마주친 광고</dt>
              <dd>
                유튜브를 보다가 광고를 영상의 일부로 여기고 따라가서 앱을 설치하게 된 일도
                있었습니다. 보고 있던 영상과 중간에 나타난 광고를 구별하는 일이 수업의 이야깃거리가
                됐습니다.
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
            <p>현장 사진 {educationPhotos.length}장 · 사진을 누르면 크게 볼 수 있어요.</p>
          </div>
          <EducationGallery photos={educationPhotos} />
        </section>
      </div>
    </SiteLayout>
  );
}
