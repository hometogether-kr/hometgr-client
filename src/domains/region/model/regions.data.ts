import type { Sido } from "./region";

/**
 * 지역 정적 데이터 (설계 §11)
 *
 * 서울은 25개 자치구 전체를 담습니다. 나머지 시·도는 시·도 단위까지만 둡니다.
 * 코드는 행정표준코드(자치구 5자리)입니다.
 */
export const REGIONS: readonly Sido[] = [
  {
    code: "11",
    name: "서울",
    sigungu: [
      { code: "11110", name: "종로구" },
      { code: "11140", name: "중구" },
      { code: "11170", name: "용산구" },
      { code: "11200", name: "성동구" },
      { code: "11215", name: "광진구" },
      { code: "11230", name: "동대문구" },
      { code: "11260", name: "중랑구" },
      { code: "11290", name: "성북구" },
      { code: "11305", name: "강북구" },
      { code: "11320", name: "도봉구" },
      { code: "11350", name: "노원구" },
      { code: "11380", name: "은평구" },
      { code: "11410", name: "서대문구" },
      { code: "11440", name: "마포구" },
      { code: "11470", name: "양천구" },
      { code: "11500", name: "강서구" },
      { code: "11530", name: "구로구" },
      { code: "11545", name: "금천구" },
      { code: "11560", name: "영등포구" },
      { code: "11590", name: "동작구" },
      { code: "11620", name: "관악구" },
      { code: "11650", name: "서초구" },
      { code: "11680", name: "강남구" },
      { code: "11710", name: "송파구" },
      { code: "11740", name: "강동구" },
    ],
  },
  { code: "26", name: "부산", sigungu: [] },
  { code: "27", name: "대구", sigungu: [] },
  { code: "28", name: "인천", sigungu: [] },
  { code: "41", name: "경기", sigungu: [] },
];
