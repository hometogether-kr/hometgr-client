import { handleBetaEvent } from "@/features/beta-tracking/server";

export const runtime = "nodejs";
export const maxDuration = 25;

export const POST = handleBetaEvent;
