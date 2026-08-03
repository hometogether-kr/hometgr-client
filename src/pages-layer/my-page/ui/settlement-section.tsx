import { InfoBox } from "@/shared/ui/info-box";
import { AccountSection } from "./account-section";

export interface SettlementSectionProps {
  /** 정산 대금 입금 계좌. 없으면 "입력된 정보가 없습니다." */
  account?: string | null;
  /** 수수료 영수증 발급 신청 여부 */
  receiptRequested?: boolean;
  onEdit?: () => void;
}

interface SettlementRowProps {
  label: string;
  value: string;
}

function SettlementRow({ label, value }: SettlementRowProps) {
  return (
    <div className="flex flex-col text-label-1 font-medium leading-[1.5]">
      <span className="text-grayscale-900">{label}</span>
      <span className="text-grayscale-600">{value}</span>
    </div>
  );
}

/**
 * 정산 정보 (집주인 전용, Figma: 646:26568)
 *
 * 값 자체는 읽기 전용으로 보여주고, 수정은 별도 화면에서 처리합니다.
 */
export function SettlementSection({
  account,
  receiptRequested = false,
  onEdit,
}: SettlementSectionProps) {
  return (
    <AccountSection
      title="정산 정보"
      action={
        <button
          type="button"
          onClick={onEdit}
          className="p-2 text-label-1 font-semibold text-primary-500 transition-opacity hover:opacity-70"
        >
          수정하기
        </button>
      }
    >
      <div className="flex flex-col gap-6">
        <SettlementRow
          label="정산 대금 입금 계좌"
          value={account ?? "입력된 정보가 없습니다."}
        />
        <SettlementRow
          label="수수료에 대한 영수증 발급"
          value={receiptRequested ? "신청함" : "신청 안 함"}
        />
        {/* Figma 646:26578은 공통 InfoBox(grayscale-70)와 달리 primary-100 배경입니다. */}
        <InfoBox title="안내 사항" className="bg-primary-100">
          <p>
            위 영수증은 집주인이 지불하신 수수료에 대해 홈투게더가 발행해 드리는 영수증입니다.
            반드시 집주인 본인의 정보를 입력해 주세요.
          </p>
          <p>
            입주자 입주 시점에 입력된 영수증 정보를 기준으로 수수료에 대한 영수증이 발행되며, 정보
            미입력 또는 오기재 시 자진발급으로 처리됩니다.
          </p>
          <p>
            입주자 이용 금액(임대료, 관리비 등)에 대한 영수증은 계약 당사자인 집주인이 입주자에게
            직접 발행하는 영수증입니다.
          </p>
        </InfoBox>
      </div>
    </AccountSection>
  );
}
