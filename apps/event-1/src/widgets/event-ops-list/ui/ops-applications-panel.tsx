import type { ApplicationList } from "@/domains/event-application";
import { formatMoveInTiming } from "@/domains/event-application";

import styles from "./ops-applications.module.css";

interface OpsApplicationsPanelProps {
  applications: ApplicationList;
}
function pageHref(page: number) {
  return page > 1 ? `/event_1/ops?page=${page}` : "/event_1/ops";
}

export function OpsApplicationsPanel({ applications }: OpsApplicationsPanelProps) {
  const pageCount = Math.max(1, Math.ceil(applications.total / applications.pageSize));
  return (
    <section className={styles.panel} aria-labelledby="applications-title">
      <div className={styles.heading}>
        <h2 id="applications-title">
          신청 내역 <span>{applications.total.toLocaleString("ko-KR")}건</span>
        </h2>
        <a className={styles.refresh} href={pageHref(applications.page)}>
          새로고침
        </a>
      </div>
      {applications.items.length === 0 ? (
        <p className={styles.empty}>아직 접수된 신청이 없습니다.</p>
      ) : (
        <>
          <table className={styles.table}>
            <caption className={styles.srOnly}>
              이벤트 신청자의 학교, 희망 입주 시점, 전화번호, 이메일
            </caption>
            <thead>
              <tr>
                <th scope="col">학교</th>
                <th scope="col">희망 입주 시점</th>
                <th scope="col">전화번호</th>
                <th scope="col">이메일</th>
              </tr>
            </thead>
            <tbody>
              {applications.items.map((application) => (
                <tr key={application.id}>
                  <td>{application.universityCampus}</td>
                  <td>{formatMoveInTiming(application.moveInTiming)}</td>
                  <td>{application.phone}</td>
                  <td>{application.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className={styles.cards}>
            {applications.items.map((application) => (
              <li key={application.id}>
                <h3>{application.universityCampus}</h3>
                <dl>
                  <div>
                    <dt>희망 입주</dt>
                    <dd>{formatMoveInTiming(application.moveInTiming)}</dd>
                  </div>
                  <div>
                    <dt>전화번호</dt>
                    <dd>{application.phone}</dd>
                  </div>
                  <div>
                    <dt>이메일</dt>
                    <dd>{application.email}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </>
      )}
      {pageCount > 1 && (
        <nav className={styles.pagination} aria-label="신청 목록 페이지">
          {applications.page > 1 ? (
            <a href={pageHref(applications.page - 1)}>이전</a>
          ) : (
            <span aria-disabled="true">이전</span>
          )}
          <p aria-current="page">
            {applications.page} / {pageCount}
          </p>
          {applications.page < pageCount ? (
            <a href={pageHref(applications.page + 1)}>다음</a>
          ) : (
            <span aria-disabled="true">다음</span>
          )}
        </nav>
      )}
    </section>
  );
}
