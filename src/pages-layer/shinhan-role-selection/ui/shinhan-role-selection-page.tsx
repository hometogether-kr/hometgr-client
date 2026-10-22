import { ShinhanRoleOptions } from "@/widgets/shinhan-role-options";
import { ShinhanRoleFooter, ShinhanRoleHeader } from "@/widgets/shinhan-shell";

export function ShinhanRoleSelectionPage() {
  return (
    <>
      <ShinhanRoleHeader />
      <main id="shinhan-role-options" aria-labelledby="shinhan-role-heading">
        <ShinhanRoleOptions />
      </main>
      <ShinhanRoleFooter />
    </>
  );
}
