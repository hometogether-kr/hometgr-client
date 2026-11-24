import type { Metadata } from "next";

import { HostEducationPage } from "@/pages-layer/host-education";

export const metadata: Metadata = {
  title: "어르신과 함께한 디지털 교실",
  description:
    "노원구 공모사업과 공릉종합사회복지관, 공릉 노인복지관에서 함께한 시니어 디지털·AI 교육을 현장 사진으로 소개합니다.",
};

export default function HostEducation() {
  return <HostEducationPage />;
}
