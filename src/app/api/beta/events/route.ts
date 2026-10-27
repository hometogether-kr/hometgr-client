import { handleBetaEvent } from "@/features/beta-tracking/server";

export const runtime = "nodejs";

export const POST = handleBetaEvent;
