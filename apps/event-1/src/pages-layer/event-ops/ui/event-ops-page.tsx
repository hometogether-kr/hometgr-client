import Image from "next/image";
import { z } from "zod";

import { applicationPageQuerySchema, listEventApplications } from "@/domains/event-application";
import { getOperatorConfig, hasOperatorSession } from "@/domains/event-operator";
import { OperatorAccessForm, OperatorSignOutForm } from "@/features/ops-access";
import { OpsApplicationsPanel } from "@/widgets/event-ops-list";

import styles from "./event-ops-page.module.css";

interface SearchParameters {
  [key: string]: string | string[] | undefined;
}
export interface EventOpsPageProps {
  searchParams: Promise<SearchParameters>;
}
interface ApplicationResultsProps {
  parameters: SearchParameters;
}

async function ApplicationResults({ parameters }: ApplicationResultsProps) {
  const parsed = applicationPageQuerySchema.safeParse(parameters);
  let applications;
  try {
    applications = await listEventApplications(parsed.success ? parsed.data.page : 1);
  } catch {
    console.error("event_ops_page_read_failed");
    return (
      <section className={styles.notice} role="alert">
        <h2>신청 내역을 불러오지 못했습니다.</h2>
        <p>잠시 후 다시 시도해 주세요.</p>
        <a href="/event_1/ops">다시 불러오기</a>
      </section>
    );
  }
  return (
    <>
      {!parsed.success && (
        <p className={styles.warning} role="alert">
          페이지 번호가 올바르지 않아 첫 페이지를 표시합니다.
        </p>
      )}
      <OpsApplicationsPanel applications={applications} />
    </>
  );
}

export async function EventOpsPage({ searchParams }: EventOpsPageProps) {
  const parameters = await searchParams;
  const configured = getOperatorConfig() !== null;
  const authenticated = configured && (await hasOperatorSession());
  const hasError = z.literal("invalid").safeParse(parameters.error).success;
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <Image
            src="/event_1/images/logo.svg"
            width={155}
            height={28}
            alt="Home Together"
            unoptimized
          />
          <span>이벤트 운영</span>
        </div>
        {authenticated && <OperatorSignOutForm />}
      </header>
      <main className={authenticated ? styles.main : styles.accessMain}>
        {authenticated ? (
          <>
            <div className={styles.heading}>
              <div>
                <p className={styles.eyebrow}>월세 지원 이벤트</p>
                <h1>신청 관리</h1>
              </div>
            </div>
            <ApplicationResults parameters={parameters} />
          </>
        ) : (
          <section className={styles.accessCard} aria-labelledby="ops-title">
            <p className={styles.eyebrow}>월세 지원 이벤트</p>
            <h1 id="ops-title">이벤트 신청 관리</h1>
            <p className={styles.description}>
              {configured
                ? "운영자 접근 코드를 입력해 신청 내역을 확인하세요."
                : "운영자 조회가 아직 준비되지 않았습니다. 담당자에게 접근 코드 설정을 요청해 주세요."}
            </p>
            {configured && <OperatorAccessForm hasError={hasError} />}
            <p className={styles.accessNote}>
              신청자의 개인정보는 행사 운영 목적으로만 확인해 주세요.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
export function EventOpsLoading() {
  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        <section className={styles.notice} role="status">
          <h1>운영 화면을 불러오는 중…</h1>
          <p>잠시만 기다려 주세요.</p>
        </section>
      </main>
    </div>
  );
}
