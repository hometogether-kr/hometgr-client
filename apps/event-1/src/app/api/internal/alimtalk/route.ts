import { handleAlimtalkDispatch } from "@/features/dispatch-alimtalk";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  return handleAlimtalkDispatch(request);
}
