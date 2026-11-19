const DISPATCH_URL = "https://hometogether-event-1.vercel.app/event_1/api/internal/alimtalk";

export default {
  async fetch() {
    return new Response("Not found", { status: 404 });
  },
  async scheduled(_controller, env) {
    if (env.EVENT_ALIMTALK_ENABLED !== "true") return;
    if (!/^[A-Za-z0-9_-]{32,128}$/.test(env.EVENT_ALIMTALK_DISPATCH_SECRET ?? ""))
      throw new Error("ALIMTALK_DISPATCH_SECRET_MISSING");
    const response = await fetch(DISPATCH_URL, {
      method: "POST",
      redirect: "manual",
      signal: AbortSignal.timeout(115000),
      headers: { Authorization: `Bearer ${env.EVENT_ALIMTALK_DISPATCH_SECRET}` },
    });
    await response.body?.cancel();
    if (!response.ok) throw new Error(`ALIMTALK_DISPATCH_HTTP_${response.status}`);
  },
};
