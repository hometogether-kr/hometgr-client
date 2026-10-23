import { handleShinhanBridge } from "@/features/shinhan-bridge";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

async function handle(request: Request, context: RouteContext) {
  return handleShinhanBridge(request, (await context.params).path);
}

export { handle as GET, handle as POST, handle as PUT };
