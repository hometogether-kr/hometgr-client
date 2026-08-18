import type { RoomHousehold } from "@/domains/listing";

export interface HouseholdCardProps {
  household: RoomHousehold;
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl bg-grayscale-50 py-7">
      <p className="text-headline-1 font-medium text-grayscale-500">{label}</p>
      <p className="text-heading-1 font-semibold text-grayscale-800">{value}</p>
    </div>
  );
}

/**
 * 함께 사는 사람 (Figma: node 1222:51159)
 */
export function HouseholdCard({ household }: HouseholdCardProps) {
  return (
    <section className="flex w-full flex-col gap-6 rounded-2xl border border-grayscale-200 px-6 py-7 md:px-9 md:py-8">
      <h2 className="text-title-3 font-semibold text-grayscale-900">함께 사는 사람</h2>
      <div className="flex flex-col gap-4 md:flex-row">
        <StatTile label="현재 거주인원" value={`${household.residentCount}명`} />
        <StatTile label="분류" value={household.residentTypeLabel} />
        <StatTile label="성별" value={household.genderCompositionLabel} />
      </div>
    </section>
  );
}
