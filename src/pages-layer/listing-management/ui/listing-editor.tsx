"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { z } from "zod";

import { fetchHostRoom, type HostRoomDetail, hostRoomQueryKeys } from "@/domains/listing-draft";
import {
  EDIT_MENUS,
  type EditMenuId,
  hasListingChanges,
  isReviewing,
  type ListingManagementCommands,
  ListingRevisionComplete,
} from "@/features/manage-listing";
import { parseKrwAmount, parseStayMonths } from "@/features/save-listing-draft";
import { ROUTES } from "@/shared/config";
import { cn } from "@/shared/lib/cn";
import { BtnCta } from "@/shared/ui/btn-cta";
import { TextField } from "@/shared/ui/text-field";
import { useToast } from "@/shared/ui/toast";
import {
  ListingStep1Page,
  ListingStep2Page,
  ListingStep3Page,
  ListingStep4Page,
  ListingStep5Page,
  ListingStep6Page,
  ListingStep7Page,
  ListingStep8Page,
  ListingStep9Page,
  type ListingStepLayoutProps,
} from "@/widgets/listing-step-layout";

import { buildEditSnapshot, createEditorValues, type EditorValues } from "../model/editor-values";

import styles from "./listing-editor.module.css";

interface EditLayoutState {
  dirty: boolean;
  saved: boolean;
  pending: boolean;
  canSave: boolean;
  onReset: () => void;
  listHref: string;
}
const EditLayoutContext = createContext<EditLayoutState | null>(null);

/** 폼의 기존 유효성 검사를 통과한 뒤에만 저장 또는 다음 메뉴로 이동합니다. */
function EditFormLayout({ step, title, description, children, onNext }: ListingStepLayoutProps) {
  const state = useContext(EditLayoutContext);
  if (!state) return null;
  const sensitive = [1, 2, 3, 4, 5, 6, 7].includes(step);
  return (
    <section
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-8 rounded-[28px] bg-white p-5 md:p-8",
        styles.form,
      )}
      data-step={step}
    >
      <div className="flex flex-col gap-3">
        <p className="text-base leading-[1.5] font-medium text-grayscale-500">
          {({ 2: "장소 기본 정보", 3: "상세 정보", 9: "방 설명 작성" } as Record<number, string>)[
            step
          ] ?? EDIT_MENUS.find((menu) => menu.step === step)?.label}
        </p>
        <div className="flex flex-col gap-9">
          <div className="flex flex-col gap-2.5">
            <h2 className="text-[24px] leading-[1.3] font-semibold tracking-[-.28px] text-grayscale-900 md:text-[28px]">
              {title}
            </h2>
            {description && (
              <p className="text-base leading-[1.4] font-medium tracking-[-.18px] text-grayscale-600 md:text-lg">
                {description}
              </p>
            )}
          </div>
          <fieldset disabled={state.pending} className="min-w-0">
            {children}
          </fieldset>
        </div>
      </div>
      <div className="flex min-h-12 flex-wrap items-end justify-between gap-4">
        <p aria-live="polite" className="text-base leading-[1.5] text-primary-400">
          {state.dirty ? "수정사항이 있습니다" : ""}
        </p>
        <div className="ml-auto flex flex-wrap items-end gap-3">
          {state.dirty ? (
            <BtnCta variant="stroke" onClick={state.onReset} disabled={state.pending}>
              되돌리기
            </BtnCta>
          ) : state.saved ? (
            <Link
              href={state.listHref}
              className="flex h-12 items-center justify-center rounded-xl border border-grayscale-300 px-6 text-sm font-semibold text-grayscale-600"
            >
              목록으로 돌아가기
            </Link>
          ) : null}
          <div className="relative pt-0">
            {state.dirty && sensitive && (
              <div className="absolute right-0 bottom-[58px] flex h-8 w-[204px] items-center justify-center text-sm font-bold text-primary-600">
                <Image
                  src="/images/listing-management/review-tooltip.svg"
                  width={204}
                  height={44}
                  alt=""
                  className="absolute top-0"
                />
                <span className="relative">홈투게더에서 확인 후 반영돼요</span>
              </div>
            )}
            <BtnCta
              className={cn(
                "w-[196px]",
                !state.dirty && state.saved && "disabled:bg-primary-500 disabled:text-white",
              )}
              disabled={
                state.pending || (state.dirty && !state.canSave) || (!state.dirty && state.saved)
              }
              loading={state.pending}
              onClick={onNext}
            >
              {state.dirty ? "수정사항 저장" : state.saved ? "저장됨" : "다음으로"}
            </BtnCta>
          </div>
        </div>
      </div>
    </section>
  );
}

interface ListingEditorProps {
  room: HostRoomDetail;
  commands?: ListingManagementCommands;
  menu: EditMenuId;
  onMenuChange: (menu: EditMenuId) => void;
  listHref?: string;
  onSaved?: (snapshot: HostRoomDetail) => void;
}

export function ListingEditor({
  room,
  commands,
  menu,
  onMenuChange,
  listHref = ROUTES.listing.manage,
  onSaved,
}: ListingEditorProps) {
  const [baseline, setBaseline] = useState(() => createEditorValues(room));
  const [values, setValues] = useState(baseline);
  const [revision, setRevision] = useState(0);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedMenu, setSavedMenu] = useState<EditMenuId | null>(null);
  const [complete, setComplete] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(values.title);
  const localUrls = useRef(new Set<string>());
  const localFiles = useRef(new Map<string, File>());
  const { showToast } = useToast();
  const dirty = hasListingChanges(baseline, values);
  const activeIndex = EDIT_MENUS.findIndex((item) => item.id === menu);
  const photo = values.photos[0];

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  useEffect(() => {
    const urls = localUrls.current;
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
    };
  }, []);

  function update<K extends keyof EditorValues>(field: K, value: EditorValues[K]) {
    setValues({ ...values, [field]: value });
    setSaved(false);
  }
  const nextMenu = () => {
    const next = EDIT_MENUS[activeIndex + 1];
    if (next) onMenuChange(next.id);
    else window.location.assign(listHref);
  };
  const reset = () => {
    setValues(baseline);
    setTitleInput(baseline.title);
    setRevision(revision + 1);
    setSaved(false);
  };
  const save = async () => {
    if (pending || !commands) return;
    setPending(true);
    try {
      const snapshot = {
        ...buildEditSnapshot(room, values),
        newPhotos: values.photos.flatMap((photo) => {
          const file = localFiles.current.get(photo.id);
          return file ? [{ id: photo.id, file }] : [];
        }),
      };
      if (!z.string().trim().min(1).max(100).safeParse(snapshot.title).success) {
        showToast("입력값을 다시 확인해주세요.", { variant: "error" });
        return;
      }
      await commands.requestChanges(room.roomId, snapshot);
      setBaseline(values);
      setSaved(true);
      setSavedMenu(menu);
      setComplete(true);
      onSaved?.({ ...room, ...snapshot });
    } catch (error) {
      showToast(
        error instanceof z.ZodError
          ? "필수항목을 모두 입력해주세요."
          : error instanceof Error
            ? error.message
            : "잠시 후 다시 시도해주세요.",
        { variant: "error" },
      );
    } finally {
      setPending(false);
    }
  };
  const handleValidated = () => {
    if (dirty) void save();
    else nextMenu();
  };
  const shared = { Layout: EditFormLayout, isSaving: pending, presentation: "management" as const };
  const forms = {
    registrant: (
      <ListingStep1Page
        {...shared}
        initialRelationship={values.registrant}
        onChange={(value) => update("registrant", value)}
        onNext={handleValidated}
      />
    ),
    location: (
      <ListingStep2Page
        {...shared}
        initialValues={values.location}
        onChange={(value) => update("location", value)}
        onNext={handleValidated}
      />
    ),
    household: (
      <ListingStep3Page
        {...shared}
        initialValues={values.household}
        onChange={(value) => update("household", value)}
        onNext={handleValidated}
      />
    ),
    privateSpace: (
      <ListingStep4Page
        {...shared}
        initialValues={values.privateSpace}
        onChange={(value) => update("privateSpace", value)}
        onNext={handleValidated}
      />
    ),
    commonFacilities: (
      <ListingStep5Page
        {...shared}
        initialValues={values.commonFacilities}
        onChange={(value) => update("commonFacilities", value)}
        onNext={handleValidated}
      />
    ),
    preferences: (
      <ListingStep6Page
        {...shared}
        initialValues={values.preferences}
        onChange={(value) => update("preferences", value)}
        onNext={handleValidated}
      />
    ),
    pricing: (
      <ListingStep7Page
        {...shared}
        initialValues={values.pricing}
        onChange={(value) => update("pricing", value)}
        parseAmount={parseKrwAmount}
        parsePeriod={parseStayMonths}
        onNext={handleValidated}
      />
    ),
    descriptions: (
      <ListingStep9Page
        {...shared}
        initialValues={values.descriptions}
        onChange={(value) => update("descriptions", value)}
        onNext={handleValidated}
      />
    ),
    photos: (
      <ListingStep8Page
        {...shared}
        photos={values.photos.map((p) => ({ id: p.id, url: p.readUrl }))}
        onNext={handleValidated}
        onChange={(ids) =>
          update(
            "photos",
            ids.flatMap((id) => {
              const p = values.photos.find((p) => p.id === id);
              return p ? [p] : [];
            }),
          )
        }
        onDeletePhoto={(id) =>
          update(
            "photos",
            values.photos.filter((p) => p.id !== id),
          )
        }
        onAddFiles={(files) => {
          const photos = files.map((file) => {
            const url = URL.createObjectURL(file);
            localUrls.current.add(url);
            return {
              id: crypto.randomUUID(),
              readUrl: url,
              displayOrder: 0,
              isRepresentative: false,
              mimeType: file.type,
              byteSize: file.size,
              originalFilename: file.name,
              readUrlExpiresAt: "",
            };
          });
          photos.forEach((photo, index) => localFiles.current.set(photo.id, files[index]));
          const parsed = z
            .array(
              z.object({
                id: z.uuid(),
                readUrl: z.string(),
                displayOrder: z.number(),
                isRepresentative: z.boolean(),
                mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
                byteSize: z.number(),
                originalFilename: z.string(),
                readUrlExpiresAt: z.string(),
              }),
            )
            .safeParse(photos);
          if (parsed.success) update("photos", [...values.photos, ...parsed.data]);
        }}
      />
    ),
  };
  return (
    <>
      <div className="mb-8 flex flex-col gap-2 pl-[14px]">
        <p className="text-sm leading-[11px] font-semibold text-[#76777d]">
          {room.data.location?.addressRegion || room.data.location?.approximateLocation}
        </p>
        <div className="flex min-h-[50px] flex-wrap items-center gap-3">
          {editingTitle ? (
            <>
              <TextField
                aria-label="매물 제목"
                value={titleInput}
                maxLength={100}
                onChange={(event) => setTitleInput(event.target.value)}
                className="max-w-[500px]"
              />
              <BtnCta
                size="xs"
                variant="stroke"
                onClick={() => {
                  setEditingTitle(false);
                  setTitleInput(values.title);
                }}
              >
                취소
              </BtnCta>
              <BtnCta
                size="xs"
                variant="stroke"
                disabled={!titleInput.trim()}
                onClick={() => {
                  update("title", titleInput.trim());
                  setEditingTitle(false);
                }}
              >
                수정 완료
              </BtnCta>
            </>
          ) : (
            <>
              <h1 className="text-[28px] leading-[1.4] font-semibold tracking-[-1.8px] text-black md:text-4xl">
                {values.title}
              </h1>
              <button
                type="button"
                aria-label="매물 제목 수정"
                onClick={() => setEditingTitle(true)}
                className="flex size-9 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-primary-500"
              >
                <Image src="/images/listing-management/edit.svg" width={24} height={24} alt="" />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col items-start gap-6 md:flex-row">
        <aside className="flex w-full shrink-0 flex-col gap-4 md:w-[215px]">
          <button
            type="button"
            onClick={() => onMenuChange("photos")}
            aria-label="사진 업로드"
            aria-current={menu === "photos" ? "step" : undefined}
            className={cn(
              "relative hidden h-[201px] w-[215px] rounded-[28px] bg-grayscale-100 md:block",
              menu === "photos" && "outline-2 outline-primary-500",
            )}
          >
            {photo && (
              <Image
                src={photo.readUrl}
                alt=""
                width={215}
                height={201}
                unoptimized
                className="h-[201px] w-[215px] rounded-[28px] object-cover"
              />
            )}
            {menu === "photos" && (
              <Image
                src="/images/listing-management/menu-chevron.svg"
                width={10}
                height={10}
                alt=""
                className="absolute top-1/2 -right-5"
              />
            )}
          </button>
          <nav
            aria-label="수정 메뉴"
            className="flex w-full gap-2 overflow-x-auto rounded-[28px] bg-white px-3 py-4 md:flex-col md:gap-[11px]"
          >
            {EDIT_MENUS.map((item) => (
              <button
                type="button"
                key={item.id}
                aria-current={menu === item.id ? "step" : undefined}
                disabled={pending}
                onClick={() => onMenuChange(item.id)}
                className={cn(
                  "flex shrink-0 items-center justify-between gap-2 rounded-xl px-4 py-[13px] text-left text-sm font-semibold focus-visible:outline-2 focus-visible:outline-primary-500 md:w-full",
                  item.id === "photos" ? "md:hidden" : "",
                  menu === item.id && "bg-grayscale-70",
                )}
              >
                <span className="flex flex-col gap-[10px]">
                  <span className="leading-[10px] text-grayscale-900">{item.label}</span>
                  {"description" in item && (
                    <span className="hidden leading-[1.4] text-grayscale-600 md:block">
                      {item.description}
                    </span>
                  )}
                </span>
                {menu === item.id && (
                  <Image
                    src="/images/listing-management/menu-chevron.svg"
                    width={10}
                    height={10}
                    alt=""
                  />
                )}
              </button>
            ))}
          </nav>
        </aside>
        <EditLayoutContext
          value={{
            dirty,
            saved: saved && savedMenu === menu,
            pending,
            canSave: !!commands,
            onReset: reset,
            listHref,
          }}
        >
          <div key={`${menu}-${revision}`} className="w-full min-w-0 flex-1">
            {forms[menu]}
          </div>
        </EditLayoutContext>
      </div>
      <ListingRevisionComplete
        open={complete}
        onContinue={() => setComplete(false)}
        onReturn={() => {
          window.location.assign(listHref);
        }}
      />
    </>
  );
}

export function ConnectedListingEditor({ roomId }: { roomId: string }) {
  const query = useQuery({
    queryKey: hostRoomQueryKeys.detail(roomId),
    queryFn: ({ signal }) => fetchHostRoom(roomId, signal),
  });
  const params = useSearchParams();
  const router = useRouter();
  const menu = z
    .enum(EDIT_MENUS.map((item) => item.id))
    .catch("photos")
    .parse(params.get("menu") ?? undefined);
  if (query.isPending)
    return <div className="h-[674px] animate-pulse rounded-[28px] bg-white" aria-busy="true" />;
  if (query.isError) return <p role="alert">{query.error.message}</p>;
  if (isReviewing(query.data)) return <p>심사 중에는 수정이 제한됩니다</p>;
  return (
    <ListingEditor
      key={query.data.roomId}
      room={query.data}
      menu={menu}
      onMenuChange={(next) =>
        router.replace(`${ROUTES.listing.edit(roomId)}?menu=${next}`, { scroll: false })
      }
    />
  );
}
