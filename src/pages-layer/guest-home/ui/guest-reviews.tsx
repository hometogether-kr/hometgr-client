import styles from "./guest-home.module.css";

const reviews = [
  {
    title: '"월세 때문에 알아봤는데, 방이\n마음에 들었어요."',
    name: "김O연",
    age: "22세",
    text: "학교 근처 원룸을 알아보다가 월세가 부담돼서 홈투게더를 찾아봤어요. 직접 가보니 방도 넉넉하고 책상 놓고 공부하기에도 좋더라고요. 원룸보다 1.5배는 넓은 것 같네요.",
  },
  {
    title: '"같이 살면 눈치 보일 줄\n알았는데, 미리 정하니 편했어요."',
    name: "이O호",
    age: "24세",
    text: "처음에는 늦게 들어오거나 주방을 쓸 때 눈치가 보일까 걱정했어요. 그런데 입주 전에 생활패턴을 이야기하고, 공용공간 사용 규칙도 확인하니까 훨씬 마음이 놓였어요.",
  },
  {
    title: '"불편한 이야기를 혼자 꺼내지\n않아도 돼서 좋았어요."',
    name: "박O우",
    age: "21세",
    text: "첫 자취라 집주인께 불편한 점을 어떻게 말씀드려야 할지 어렵더라고요. 생활 중 조율할 일이 생겼을 때 홈투게더에 먼저 이야기했어요.",
  },
];

export function GuestReviews() {
  return (
    <section
      className={`${styles.section} ${styles.muted} ${styles.reviewsSection}`}
      aria-labelledby="guest-reviews-title"
    >
      <div className={styles.container}>
        <h2 className={styles.heading} id="guest-reviews-title">
          홈투게더와 함께하신 분들
        </h2>
        <div className={styles.reviews}>
          {reviews.map((review) => (
            <figure key={review.name}>
              <blockquote>
                <h3>{review.title}</h3>
                <p>{review.text}</p>
              </blockquote>
              <figcaption>
                <span>{review.name}</span>
                <span>{review.age}</span>
                <span>대학생</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
