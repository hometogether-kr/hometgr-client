import "server-only";

import { getVercelOidcToken } from "@vercel/oidc";
import { ExternalAccountClient } from "google-auth-library";
import { google } from "googleapis";

import { getGoogleSheetsOidcEnv } from "@/shared/config/marketing-attribution-env.server";

import type { AttributionEventRecord } from "../model/attribution.schema";

const SHEET_TITLE = "유입로그";
const GOOGLE_SHEET_HEADERS = [
  "event_id",
  "발생일시",
  "유입채널",
  "캠페인",
  "이벤트",
  "랜딩URL",
  "referrer",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "anonymous_id",
  "session_id",
  "device_type",
  "상담상태",
  "계약여부",
  "비고",
] as const;

function toA1SheetName(title: string) {
  return `'${title.replaceAll("'", "''")}'`;
}

/**
 * Exchanges the Vercel-issued request token for short-lived Google credentials.
 * No key file, JSON credential file, or manually supplied OIDC token is read.
 */
function createGoogleSheetsOidcClient() {
  const config = getGoogleSheetsOidcEnv();
  const authClient = ExternalAccountClient.fromJSON({
    audience:
      `//iam.googleapis.com/projects/${config.GCP_PROJECT_NUMBER}/locations/global/` +
      `workloadIdentityPools/${config.GCP_WORKLOAD_IDENTITY_POOL_ID}/providers/` +
      config.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    service_account_impersonation_url:
      "https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/" +
      `${config.GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
    subject_token_supplier: {
      // Ignore Google's supplier context here. Passing it directly would treat
      // context.audience as a Vercel custom OIDC audience.
      getSubjectToken: () => getVercelOidcToken(),
    },
    subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
    token_url: "https://sts.googleapis.com/v1/token",
    type: "external_account",
  });

  if (!authClient) {
    throw new Error("Unable to initialize the Google OIDC external account client.");
  }

  return { authClient, spreadsheetId: config.GOOGLE_SHEETS_SPREADSHEET_ID };
}

async function findOrCreateTargetSheet(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
) {
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties(sheetId,title)",
  });
  const properties = spreadsheet.data.sheets?.map((sheet) => sheet.properties);
  const existingTarget = properties?.find((sheet) => sheet?.title === SHEET_TITLE);

  if (existingTarget?.title) return existingTarget.title;

  const defaultSheet = properties?.find((sheet) => sheet?.title === "Sheet1");
  if (defaultSheet?.sheetId !== undefined) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            updateSheetProperties: {
              fields: "title",
              properties: { sheetId: defaultSheet.sheetId, title: SHEET_TITLE },
            },
          },
        ],
      },
    });
    return SHEET_TITLE;
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: [{ addSheet: { properties: { title: SHEET_TITLE } } }] },
  });
  return SHEET_TITLE;
}

async function ensureHeader(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  sheetTitle: string,
) {
  const range = `${toA1SheetName(sheetTitle)}!A1:R1`;
  const current = await sheets.spreadsheets.values.get({ spreadsheetId, range });

  if (!current.data.values?.[0]?.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      requestBody: { values: [GOOGLE_SHEET_HEADERS as unknown as string[]] },
      valueInputOption: "RAW",
    });
  }
}

/** Appends one row; the operator-managed 상담상태/계약여부/비고 cells stay blank. */
export async function appendAttributionEventToGoogleSheet(event: AttributionEventRecord) {
  const { authClient, spreadsheetId } = createGoogleSheetsOidcClient();
  const sheets = google.sheets({ version: "v4", auth: authClient });
  const sheetTitle = await findOrCreateTargetSheet(sheets, spreadsheetId);
  await ensureHeader(sheets, spreadsheetId, sheetTitle);

  const row = [
    event.event_id,
    event.created_at,
    event.source,
    event.campaign ?? "",
    event.event_name,
    event.landing_url ?? "",
    event.referrer ?? "",
    event.utm_source ?? "",
    event.utm_medium ?? "",
    event.utm_campaign ?? "",
    event.utm_content ?? "",
    event.utm_term ?? "",
    event.anonymous_id,
    event.session_id,
    event.device_type,
    "",
    "",
    "",
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${toA1SheetName(sheetTitle)}!A:R`,
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
    valueInputOption: "RAW",
  });
}
