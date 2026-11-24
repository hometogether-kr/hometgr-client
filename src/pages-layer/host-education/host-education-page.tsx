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
                스마트폰을 사이에 두고 어르신과 청년이 나란히 앉았습니다. 디지털 기초부터 AI까지,
                노원에서 함께한 수업을 소개합니다.
              </p>
              <a className={styles.galleryLink} href="#class-photos">
                수업 사진 보기 <span aria-hidden="true">↓</span>
              </a>
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
                화면을 직접 눌러 보고, 어려운 부분은
                <br className={styles.desktopBreak} /> 곁에 앉은 청년과 다시 연습했습니다.
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
