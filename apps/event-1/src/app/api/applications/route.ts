import { handleApplicationPost } from "@/features/submit-application";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleApplicationPost(request);
}
