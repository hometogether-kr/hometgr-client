import "server-only";

import { z } from "zod";

const DEFAULT_GOOGLE_SHEETS_SPREADSHEET_ID = "1TJ40VzCRuzfN5OYJq8K1RoxzPvY7Q1dDll_qP2T5kRI";

const requiredText = z.string().trim().min(1);

const googleSheetsOidcEnvSchema = z.object({
  GCP_PROJECT_ID: requiredText,
  GCP_PROJECT_NUMBER: z.string().regex(/^\d+$/, "GCP project number must contain only digits."),
  GCP_SERVICE_ACCOUNT_EMAIL: z.email(),
  GCP_WORKLOAD_IDENTITY_POOL_ID: requiredText,
  GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID: requiredText,
  GOOGLE_SHEETS_SPREADSHEET_ID: requiredText.default(DEFAULT_GOOGLE_SHEETS_SPREADSHEET_ID),
});

export type GoogleSheetsOidcEnv = z.infer<typeof googleSheetsOidcEnvSchema>;

/**
 * OIDC federation configuration for direct Google Sheets append. This intentionally
 * accepts no private key, service-account JSON, or manually supplied OIDC token.
 */
export function getGoogleSheetsOidcEnv(): GoogleSheetsOidcEnv {
  const parsed = googleSheetsOidcEnvSchema.safeParse({
    GCP_PROJECT_ID: process.env.GCP_PROJECT_ID,
    GCP_PROJECT_NUMBER: process.env.GCP_PROJECT_NUMBER,
    GCP_SERVICE_ACCOUNT_EMAIL: process.env.GCP_SERVICE_ACCOUNT_EMAIL,
    GCP_WORKLOAD_IDENTITY_POOL_ID: process.env.GCP_WORKLOAD_IDENTITY_POOL_ID,
    GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID: process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID,
    GOOGLE_SHEETS_SPREADSHEET_ID: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
  });

  if (!parsed.success) {
    throw new Error(
      "Google Sheets OIDC is not configured: set GCP_PROJECT_ID, GCP_PROJECT_NUMBER, GCP_SERVICE_ACCOUNT_EMAIL, GCP_WORKLOAD_IDENTITY_POOL_ID, and GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID.",
    );
  }

  return parsed.data;
}
