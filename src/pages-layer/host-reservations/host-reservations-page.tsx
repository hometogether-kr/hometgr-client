import { Suspense } from "react";

import { HostReservationFlow } from "@/features/manage-host-reservation";
import { SiteLayout } from "@/widgets/site-layout";

export function HostReservationsPage() {
  return (
    <SiteLayout showFooter={false}>
      <Suspense
        fallback={
          <div
            className="mx-auto min-h-[800px] w-full max-w-[1176px] py-20"
            aria-label="예약 불러오는 중"
          />
        }
      >
        <HostReservationFlow />
      </Suspense>
    </SiteLayout>
  );
}
