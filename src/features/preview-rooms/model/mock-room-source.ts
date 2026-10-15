import { z } from "zod";

import type { RoomDetail } from "@/domains/listing";
import type { RoomListQuery, RoomListResult } from "@/domains/room";
import { ApiError } from "@/shared/api";

import { createMockListings } from "./mock-room-fixtures";

export interface PreviewRegion {
  value: string;
  label: string;
}

export type PreviewLocation =
  | { access: "guest" }
  | { access: "member"; buildingAddress: string; latitude: number; longitude: number };

export interface PreviewRoomDetail {
  room: RoomDetail;
  location: PreviewLocation;
}

export type MockRoomOperation = "regions" | "list" | "nextPage" | "detail";

export interface MockRoomSourceOptions {
  delayMs?: number;
  emptyCatalog?: boolean;
  /** 각 작업의 첫 호출만 실패한다. 같은 입력으로 재시도하면 성공한다. */
  failOnce?: readonly MockRoomOperation[];
}

export interface MockRoomSource {
  listRegions(): Promise<PreviewRegion[]>;
  listRooms(query: RoomListQuery): Promise<RoomListResult>;
  getRoomDetail(id: string, viewer: "guest" | "member"): Promise<PreviewRoomDetail>;
}

const querySchema = z.strictObject({
  sido: z.string().min(1).optional(),
  sigungu: z.string().min(1).optional(),
  region: z.string().min(1).optional(),
  page: z.number().int().min(1),
  sort: z.enum(["latest", "rentAsc", "depositAsc", "moveInAsc"]).optional(),
  moveInDate: z.iso.date().optional(),
  minTerm: z.enum(["months1", "months3", "months6", "year1Plus"]).optional(),
  depositMin: z.number().nonnegative().optional(),
  depositMax: z.number().nonnegative().optional(),
  rentMin: z.number().nonnegative().optional(),
  rentMax: z.number().nonnegative().optional(),
  buildingType: z
    .enum(["apartment", "officetel", "shareHouse", "detachedHouse", "other"])
    .optional(),
  people: z.enum(["one", "two", "threePlus"]).optional(),
  gender: z.enum(["female", "male", "any"]).optional(),
});

const optionsSchema = z.strictObject({
  delayMs: z.number().int().min(0).max(30000).default(300),
  emptyCatalog: z.boolean().default(false),
  failOnce: z.array(z.enum(["regions", "list", "nextPage", "detail"])).default([]),
});

/** 명시적으로 만든 인스턴스만 동작한다. 실제 API 실패 시 대체 데이터로 사용하지 않는다. */
export function createMockRoomSource(options: MockRoomSourceOptions = {}): MockRoomSource {
  const settings = optionsSchema.parse(options);
  const listings = settings.emptyCatalog
    ? []
    : createMockListings().filter((item) => item.published);
  const failures = new Set(settings.failOnce);

  async function prepare(operation: MockRoomOperation): Promise<void> {
    if (settings.delayMs > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, settings.delayMs));
    }
    if (failures.delete(operation)) {
      throw new ApiError("모의 조회에 실패했어요. 다시 시도해주세요.", {
        status: 503,
        kind: "server",
      });
    }
  }

  return {
    async listRegions() {
      await prepare("regions");
      return [...new Set(listings.map((item) => item.region))].map((value) => ({
        value,
        label: value.split(" ").at(-1) ?? value,
      }));
    },
    async listRooms(input) {
      const query = querySchema.parse(input);
      await prepare(query.page > 1 ? "nextPage" : "list");
      const termMonths = { months1: 1, months3: 3, months6: 6, year1Plus: 12 };
      const filtered = listings.filter((item) => {
        const deposit = (item.room.deposit ?? 0) * 10000;
        const rent = (item.room.monthlyRent ?? 0) * 10000;
        return (
          (!query.region || item.region === query.region) &&
          (!query.sido || item.region.startsWith(`${query.sido} `)) &&
          (!query.sigungu || item.region.endsWith(` ${query.sigungu}`)) &&
          (!query.buildingType || item.buildingType === query.buildingType) &&
          (!query.people || item.people === query.people) &&
          (!query.gender ||
            query.gender === "any" ||
            item.gender === "any" ||
            item.gender === query.gender) &&
          (!query.minTerm || item.minStayMonths <= termMonths[query.minTerm]) &&
          (!query.moveInDate || (item.room.availableFrom ?? "") <= query.moveInDate) &&
          (query.depositMin === undefined || deposit >= query.depositMin) &&
          (query.depositMax === undefined || deposit <= query.depositMax) &&
          (query.rentMin === undefined || rent >= query.rentMin) &&
          (query.rentMax === undefined || rent <= query.rentMax)
        );
      });
      filtered.sort((a, b) => {
        switch (query.sort) {
          case "rentAsc":
            return (a.room.monthlyRent ?? 0) - (b.room.monthlyRent ?? 0);
          case "depositAsc":
            return (a.room.deposit ?? 0) - (b.room.deposit ?? 0);
          case "moveInAsc":
            return (a.room.availableFrom ?? "").localeCompare(b.room.availableFrom ?? "");
          default:
            // 생성 순서를 등록 순서로 취급하여 최신 등록부터 표시한다.
            return listings.indexOf(b) - listings.indexOf(a);
        }
      });
      const start = (query.page - 1) * 8;
      return {
        rooms: structuredClone(filtered.slice(start, start + 8).map((item) => item.room)),
        totalCount: filtered.length,
        page: query.page,
        hasNext: start + 8 < filtered.length,
      };
    },
    async getRoomDetail(inputId, inputViewer) {
      const id = z.string().min(1).parse(inputId);
      const viewer = z.enum(["guest", "member"]).parse(inputViewer);
      await prepare("detail");
      const item = listings.find((listing) => listing.room.id === id);
      if (!item) {
        throw new ApiError("매물을 찾을 수 없어요.", { status: 404, kind: "notFound" });
      }
      return {
        room: structuredClone(item.detail),
        location:
          viewer === "guest"
            ? { access: "guest" }
            : {
                access: "member",
                buildingAddress: item.buildingAddress,
                latitude: item.latitude,
                longitude: item.longitude,
              },
      };
    },
  };
}
