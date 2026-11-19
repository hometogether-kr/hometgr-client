import { handleApplicationPost } from "@/features/submit-application";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  return handleApplicationPost(request);
}
