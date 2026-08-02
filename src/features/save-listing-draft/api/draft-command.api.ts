import {
  type DraftMediaMutationDto,
  type ListingDraft,
  type RoomSubmissionDto,
  draftDetailSchema,
  draftMediaMutationSchema,
  roomSubmissionSchema,
  toListingDraft,
} from "@/domains/listing-draft";
import { ApiError, apiRequest } from "@/shared/api";
import { STEP_DATA_SCHEMA, type SaveStepCommand } from "../model/step-command.schema";

const DRAFTS_PATH = "/host/rooms/drafts";

export async function createListingDraft(): Promise<ListingDraft> {
  const dto = await apiRequest({
    method: "POST",
    path: DRAFTS_PATH,
    body: {},
    schema: draftDetailSchema,
  });

  return toListingDraft(dto);
}

/**
 * 단계 저장
 *
 * 보내기 전에 스키마로 한 번 걸러, 조건부 필드 규칙을 어긴 요청이 서버까지 가서
 * 400으로 돌아오는 대신 어느 필드가 문제인지 바로 알 수 있게 합니다.
 */
export async function saveListingDraftStep(
  draftId: string,
  command: SaveStepCommand,
): Promise<ListingDraft> {
  const schema = STEP_DATA_SCHEMA[command.step];
  const parsed = schema.safeParse(command.data);

  if (!parsed.success) {
    throw new ApiError("입력값을 다시 확인해주세요.", {
      status: 0,
      kind: "validation",
      details: parsed.error.issues.map((issue) => issue.message),
      cause: parsed.error,
    });
  }

  const dto = await apiRequest({
    method: "PUT",
    path: `${DRAFTS_PATH}/${draftId}`,
    body: { step: command.step, expectedVersion: command.expectedVersion, data: parsed.data },
    schema: draftDetailSchema,
  });

  return toListingDraft(dto);
}

export async function submitListingDraft(
  draftId: string,
  expectedVersion: number,
): Promise<RoomSubmissionDto> {
  return apiRequest({
    method: "POST",
    path: `${DRAFTS_PATH}/${draftId}/submit`,
    body: { expectedVersion },
    schema: roomSubmissionSchema,
  });
}

export interface UploadDraftPhotosInput {
  draftId: string;
  expectedVersion: number;
  files: readonly File[];
}

/** API가 한 요청에 받을 수 있는 파일 수 상한 */
const MAX_FILES_PER_REQUEST = 10;

function uploadPhotoChunk(
  draftId: string,
  expectedVersion: number,
  files: readonly File[],
): Promise<DraftMediaMutationDto> {
  const formData = new FormData();
  // multipart에서는 숫자를 문자열로만 보낼 수 있습니다.
  formData.append("expectedVersion", String(expectedVersion));
  for (const file of files) formData.append("files", file);

  return apiRequest({
    method: "POST",
    path: `${DRAFTS_PATH}/${draftId}/media`,
    formData,
    schema: draftMediaMutationSchema,
  });
}

/**
 * 초안 사진 업로드
 *
 * 화면은 최대 20장을 허용하지만 API는 한 요청에 10장까지만 받습니다. 나눠 보내되,
 * 업로드마다 version이 올라가므로 직전 응답의 version을 다음 요청에 넘깁니다.
 *
 * `FormData` 조립은 전송 형식이라 컴포넌트가 아니라 여기서 처리합니다.
 */
export async function uploadDraftPhotos({
  draftId,
  expectedVersion,
  files,
}: UploadDraftPhotosInput): Promise<DraftMediaMutationDto> {
  if (files.length === 0) {
    throw new ApiError("업로드할 사진을 선택해주세요.", { status: 0, kind: "validation" });
  }

  let result = await uploadPhotoChunk(draftId, expectedVersion, files.slice(0, MAX_FILES_PER_REQUEST));

  for (let offset = MAX_FILES_PER_REQUEST; offset < files.length; offset += MAX_FILES_PER_REQUEST) {
    result = await uploadPhotoChunk(
      draftId,
      result.version,
      files.slice(offset, offset + MAX_FILES_PER_REQUEST),
    );
  }

  return result;
}

export interface DeleteDraftPhotoInput {
  draftId: string;
  mediaId: string;
  expectedVersion: number;
}

export async function deleteDraftPhoto({
  draftId,
  mediaId,
  expectedVersion,
}: DeleteDraftPhotoInput): Promise<DraftMediaMutationDto> {
  return apiRequest({
    method: "DELETE",
    path: `${DRAFTS_PATH}/${draftId}/media/${mediaId}`,
    body: { expectedVersion },
    schema: draftMediaMutationSchema,
  });
}
