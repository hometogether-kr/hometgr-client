import { GUEST_LOCATION_DISCLOSURE, type RoomDetail } from "@/domains/listing";
import type { GenderPreference, OccupancyCount, Room, RoomType } from "@/domains/room";

export interface MockListing {
  room: Room;
  region: string;
  published: boolean;
  buildingType: RoomType;
  people: OccupancyCount;
  gender: GenderPreference;
  minStayMonths: number;
  detail: RoomDetail;
  buildingAddress: string;
  latitude: number;
  longitude: number;
}

const districts = ["노원구", "강서구", "마포구", "중랑구"];

/** 가상 매물이다. 지도 좌표는 화면 검증용 예시이며 실제 건물 위치를 보증하지 않는다. */
export function createMockListings(): MockListing[] {
  return districts.flatMap((district, districtIndex) =>
    Array.from({ length: 12 }, (_, index): MockListing => {
      const id = `preview-room-${districtIndex + 1}-${index + 1}`;
      const region = `서울특별시 ${district}`;
      const deposit = 100 + index * 100;
      const monthlyRent = 30 + ((index * 7) % 40);
      const availableFrom = `2026-${index % 2 === 0 ? "10" : "11"}-15`;
      const buildingType = index % 2 === 0 ? "apartment" : "officetel";
      const buildingName = `[모의] ${district} ${index + 1}번 매물`;
      const minStayMonths = [1, 3, 6, 12][index % 4];
      return {
        region,
        published: districtIndex !== 3 && index !== 11,
        buildingType,
        people: index % 3 === 0 ? "one" : index % 3 === 1 ? "two" : "threePlus",
        gender: index % 3 === 0 ? "female" : index % 3 === 1 ? "male" : "any",
        minStayMonths,
        buildingAddress: `${region} 모의로 ${index + 1} (가상 주소)`,
        latitude: 37.55 + districtIndex * 0.01 + index * 0.0001,
        longitude: 126.95 + districtIndex * 0.01 + index * 0.0001,
        room: {
          id,
          buildingName,
          subtitle: "화면 검증용 가상 매물입니다.",
          deposit: deposit * 10_000,
          monthlyRent: monthlyRent * 10_000,
          neighborhood: district,
          transitSummary: null,
          thumbnailUrl: null,
          availability: "available",
          availableFrom,
        },
        detail: {
          viewerAccess: "member",
          id,
          title: buildingName,
          subtitle: "화면 검증용 가상 매물입니다.",
          addressRegion: region,
          buildingAddress: null,
          addressDisclosureNote: GUEST_LOCATION_DISCLOSURE,
          locationSummary: district,
          price: {
            depositKrw: deposit * 10000,
            monthlyRentKrw: monthlyRent * 10_000,
            maintenanceFeeKrw: 50000,
          },
          buildingTypeLabel: buildingType === "apartment" ? "아파트" : "오피스텔",
          roomSizeLabel: "10~15평",
          moveInLabel: `${availableFrom}부터 입주 가능`,
          parkingLabel: "주차 불가",
          petPolicyLabel: "반려동물 불가",
          description: "화면과 흐름 확인을 위한 가상 매물입니다.",
          minStayMonths,
          amenities: ["냉장고", "세탁기"],
          photos: [],
          locationNote: "모의 위치이며 실제 매물 주소가 아닙니다.",
          host: { id: null, name: "모의 호스트", joinedLabel: "2026년 10월" },
          latestReservation: null,
          canRequestVisit: false,
        },
      };
    }),
  );
}
