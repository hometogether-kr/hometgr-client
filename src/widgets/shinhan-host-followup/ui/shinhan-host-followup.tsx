import { HostIntroductionFrame, HostResultFrame } from "./host-followup-presentation";
import {
  HostExampleIncome,
  HostIntroductionActions,
  HostResultActions,
  ShinhanHostFollowupFlow,
} from "./shinhan-host-followup-flow";

export function ShinhanHostFollowup() {
  return (
    <ShinhanHostFollowupFlow
      result={
        <HostResultFrame income={<HostExampleIncome />}>
          <HostResultActions />
        </HostResultFrame>
      }
      introduction={
        <HostIntroductionFrame>
          <HostIntroductionActions />
        </HostIntroductionFrame>
      }
    />
  );
}
