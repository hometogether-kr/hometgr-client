"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import {
  EDIT_MENUS,
  LISTING_FILTERS,
  type ListingManagementCommands,
  useListingEditReceipt,
} from "@/features/manage-listing";

import { PREVIEW_ROOM, PREVIEW_ROOMS } from "../model/preview-fixtures";
import { ListingEditor } from "./listing-editor";
import { ListingManagementList } from "./listing-management-list";
import { ListingManagementShell } from "./listing-management-shell";

const PREVIEW_PATH = "/dev/listing-management";

export function ListingManagementPreview() {
  const params = useSearchParams();
  const router = useRouter();
  const [rooms, setRooms] = useState(PREVIEW_ROOMS);
  const receipt = useListingEditReceipt("preview", PREVIEW_ROOM.roomId);
  const savedReceipt = receipt?.id === params.get("saved") ? receipt : null;
  const room = receipt?.room ?? PREVIEW_ROOM;
  const editing = params.has("room");
  const filter = z
    .enum(LISTING_FILTERS)
    .catch("전체")
    .parse(params.get("filter") ?? undefined);
  const menu = z
    .enum(EDIT_MENUS.map((item) => item.id))
    .catch("photos")
    .parse(params.get("menu") ?? undefined);
  const commands: ListingManagementCommands = {
    setVisibility: (id, isPublic) => {
      setRooms((current) => current.map((item) => (item.id === id ? { ...item, isPublic } : item)));
      return Promise.resolve();
    },
    requestChanges: () => Promise.resolve(),
  };
  if (receipt === undefined) {
    return (
      <ListingManagementShell editing={editing} listHref={PREVIEW_PATH}>
        <div className="h-[674px] animate-pulse rounded-[28px] bg-white" aria-busy="true" />
      </ListingManagementShell>
    );
  }
  return (
    <ListingManagementShell editing={editing} listHref={PREVIEW_PATH}>
      {editing ? (
        <ListingEditor
          room={room}
          commands={commands}
          initiallySaved={!!savedReceipt}
          receiptScope="preview"
          menu={menu}
          onMenuChange={(next) => {
            const search = new URLSearchParams(params.toString());
            search.set("menu", next);
            router.replace(`${PREVIEW_PATH}?${search.toString()}`, { scroll: false });
          }}
          listHref={PREVIEW_PATH}
        />
      ) : (
        <ListingManagementList
          rooms={rooms}
          filter={filter}
          commands={commands}
          onFilterChange={(next) =>
            router.replace(`${PREVIEW_PATH}?filter=${encodeURIComponent(next)}`, { scroll: false })
          }
          editHref={() => `${PREVIEW_PATH}?room=1`}
          thumbnails={Object.fromEntries(
            rooms.map((item) => [item.id, "/images/listing-management/preview-room.png"]),
          )}
          viewCounts={{ [rooms[0].id]: 11, [rooms[2].id]: 11 }}
        />
      )}
    </ListingManagementShell>
  );
}
