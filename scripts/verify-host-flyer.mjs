import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const printedUrl =
  "https://hometogether.kr/intro/host?utm_source=apartment_flyer&utm_medium=print&utm_campaign=host_a4_202611&utm_content=general";
const printedPath = printedUrl.slice("https://hometogether.kr".length);
const expectedAttribution = {
  utm_source: "apartment_flyer",
  utm_medium: "print",
  utm_campaign: "host_a4_202611",
  utm_content: "general",
  landing_path: "/intro/host",
};
const measurementId = "G-FLYERTEST00";
const storageKey = "hometogether:host-flyer:v1";
const headerName = "x-host-flyer-attribution";
const receiptId = "00000000-0000-4000-8000-000000000010";
const draftId = "00000000-0000-4000-8000-000000000020";
const roomId = "00000000-0000-4000-8000-000000000030";
const timestamp = "2026-11-15T02:00:00.000Z";
const draftPath = `/host/rooms/drafts/${draftId}`;
const privateMail = "private-flyer@example.invalid";
const privatePhone = "010-0000-1234";
const normalizedPhone = "+821000001234";
const privateName = "가상등록이름";

let appOrigin;
let consultationStatus = 201;
let listingStatus = 201;
const requests = [];
const draft = {
  draftId,
  roomId,
  version: 1,
  nextStep: 11,
  lastSavedAt: timestamp,
  expiresAt: "2026-12-15T02:00:00.000Z",
  completedSteps: [2, 3, 4, 5, 6, 7, 8, 9, 10],
  autosaves: [],
  media: [],
  data: {
    registrant: null,
    location: null,
    household: null,
    privateSpace: null,
    commonFacilities: null,
    preferences: null,
    pricing: null,
    media: null,
    descriptions: null,
    contact: {
      contactName: "기존 임시 입력",
      contactPhone: normalizedPhone,
      preferredContactTime: "afternoon",
      preferredContactMethod: "sms",
    },
  },
};

const backend = createServer(async (req, res) => {
  const pathname = new URL(req.url, "http://localhost").pathname;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : undefined;
  requests.push({ path: pathname, method: req.method, attribution: req.headers[headerName], body });

  function json(status, value) {
    res.writeHead(status, { "content-type": "application/json" }).end(JSON.stringify(value));
  }

  if (req.method === "GET" && pathname === "/auth/kakao") {
    res
      .writeHead(302, {
        location: appOrigin + "/auth/kakao/callback?code=synthetic-code&state=synthetic-state",
        "set-cookie": "kakao_test_state=synthetic-state; Path=/; HttpOnly",
      })
      .end();
    return;
  }
  if (req.method === "GET" && pathname === "/auth/kakao/callback") {
    assert.match(req.headers.cookie, /kakao_test_state=synthetic-state/);
    return json(200, {
      accessToken: "synthetic-session",
      refreshToken: "synthetic-refresh",
      onboardingRequired: false,
      user: {
        id: "00000000-0000-4000-8000-000000000040",
        name: null,
        email: null,
        phone: null,
        introduction: null,
        role: "host",
        onboardingCompletedAt: timestamp,
      },
    });
  }
  if (req.method === "GET" && pathname === "/me")
    return json(200, {
      onboardingRequired: false,
      user: {
        id: "00000000-0000-4000-8000-000000000040",
        name: null,
        email: null,
        phone: null,
        introduction: null,
        role: "host",
        onboardingCompletedAt: timestamp,
      },
      student: null,
      consents: null,
    });
  if (req.method === "GET" && pathname === "/consultation-regions") return json(200, { items: [] });
  if (req.method === "POST" && pathname === "/host-consultation-requests") {
    const data =
      consultationStatus === 201
        ? { id: receiptId, createdAt: timestamp, regionName: "가상 지역" }
        : { statusCode: consultationStatus, message: "테스트 응답" };
    return json(consultationStatus, data);
  }
  if (req.method === "GET" && pathname === "/host/rooms/drafts") return json(200, []);
  if (pathname === draftPath && req.method === "GET") return json(200, draft);
  if (pathname === draftPath && req.method === "PUT") {
    return json(200, { ...draft, version: 2, data: { ...draft.data, contact: body.data } });
  }
  if (pathname === `${draftPath}/submit` && req.method === "POST") {
    assert.equal(body.expectedVersion, 2);
    const data =
      listingStatus === 201
        ? { roomId, roomStatus: "submitted", submittedAt: timestamp }
        : { statusCode: listingStatus, message: "테스트 등록 오류" };
    return json(listingStatus, data);
  }
  return json(404, { statusCode: 404, message: "Not in local fixture" });
});

async function listen(server) {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return server.address().port;
}

async function startFrontend(backendPort, { measurement = "", forward = false } = {}) {
  const reservation = createServer();
  const port = await listen(reservation);
  await new Promise((resolve) => reservation.close(resolve));
  const origin = `http://127.0.0.1:${port}`;
  appOrigin = origin;
  const child = spawn(
    process.execPath,
    [
      require.resolve("next/dist/bin/next"),
      "dev",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(port),
    ],
    {
      env: {
        ...process.env,
        NEXT_TELEMETRY_DISABLED: "1",
        API_BASE_URL: `http://127.0.0.1:${backendPort}`,
        APP_BASE_URL: origin,
        NEXT_PUBLIC_HOST_FLYER_GA4_ID: measurement,
        HOST_FLYER_CRM_FORWARDING_ENABLED: String(forward),
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let logs = "";
  for (const stream of [child.stdout, child.stderr]) {
    stream.on("data", (chunk) => {
      logs = (logs + chunk).slice(-9_000);
    });
  }
  async function stop() {
    if (child.exitCode !== null) return;
    const exited = once(child, "exit");
    child.kill();
    await exited;
  }
  for (let attempt = 0; attempt < 90 && child.exitCode === null; attempt++) {
    const response = await fetch(origin + printedPath, {
      signal: AbortSignal.timeout(2_000),
    }).catch(() => null);
    if (response?.ok) return { origin, stop, logs: () => logs };
    await delay(300);
  }
  await stop();
  throw new Error("Local frontend could not start\n" + logs);
}

async function browserPage(browser, origin) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  await context.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.origin === origin) return route.continue();
    if (url.origin === "https://www.googletagmanager.com" && url.pathname === "/gtag/js") {
      assert.equal(url.searchParams.get("id"), measurementId);
      return route.fulfill({
        contentType: "text/javascript",
        body: "window.__fakeTagLoaded = true;",
      });
    }
    return route.abort();
  });
  await context.addInitScript(() => {
    window.__flyerEventLog = () =>
      (window.dataLayer ?? [])
        .map((command) => Array.from(command))
        .filter(([type]) => type === "event")
        .map(([, name, parameters]) => ({ name, parameters }));
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15_000);
  return { context, page };
}

async function events(page, name) {
  return page.evaluate(
    (target) => window.__flyerEventLog().filter((event) => !target || event.name === target),
    name,
  );
}

async function waitCount(page, name, count) {
  await page.waitForFunction(
    ({ name, count }) =>
      window.__flyerEventLog().filter((event) => event.name === name).length === count,
    { name, count },
  );
}

async function settleFrame(page) {
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
}

async function scrollPercent(page, percent) {
  await page.evaluate((value) => {
    const max = document.scrollingElement.scrollHeight - innerHeight;
    window.scrollTo({
      top: Math.ceil((max * value) / 100) + (value > 0 ? 1 : 0),
      behavior: "instant",
    });
  }, percent);
  await settleFrame(page);
}

function consultSubmit(page) {
  return page.getByRole("button", { name: "1:1 상담 신청하기" });
}

async function fillConsultation(page, { countFormStart = true } = {}) {
  await page.locator("select[name=regionId]").selectOption("other");
  await page.getByLabel("대학교명 직접 입력").fill("가상대학교");
  await page.getByText("1개", { exact: true }).click();
  await page.getByText("있음", { exact: true }).click();
  await page.getByText("자가", { exact: true }).click();
  await page.getByLabel("연락처", { exact: true }).fill(privatePhone);
  await page.getByText("개인정보 수집·이용 동의 (필수)", { exact: true }).click();
  if (countFormStart) await waitCount(page, "host_form_start", 1);
}

async function testEnabled(browser, app) {
  const { origin } = app;
  const { context, page } = await browserPage(browser, origin);
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));

  try {
    const direct = await page.goto(origin + printedPath);
    assert.equal(direct.status(), 200);
    assert.equal(direct.request().redirectedFrom(), null);
    assert.equal(page.url(), origin + printedPath);
    await page.locator("h1").waitFor();
    await page.getByRole("button", { name: "통계 수집 허용" }).waitFor();
    assert.deepEqual(await events(page), []);
    assert.equal(await page.evaluate(() => window.__fakeTagLoaded), undefined);

    await page.getByRole("button", { name: "통계 수집 허용" }).click();
    await waitCount(page, "host_landing_view", 1);
    assert.deepEqual(await events(page, "page_view"), []);
    const config = await page.evaluate(
      () =>
        (window.dataLayer ?? [])
          .map((entry) => Array.from(entry))
          .find(([type]) => type === "config")?.[2],
    );
    assert.equal(config.send_page_view, true);
    await page.waitForFunction(() => window.__fakeTagLoaded === true);
    assert.deepEqual(
      (await events(page, "host_section_view")).map((e) => e.parameters.section_id),
      ["hero"],
    );
    assert.equal(
      (await events(page, "host_landing_view"))[0].parameters.page_location,
      origin + printedPath,
    );

    await scrollPercent(page, 20);
    assert.deepEqual(await events(page, "host_scroll_depth"), []);
    for (const [index, [target, threshold]] of [
      [28, 25],
      [53, 50],
      [78, 75],
      [93, 90],
      [100, 100],
    ].entries()) {
      await scrollPercent(page, target);
      await waitCount(page, "host_scroll_depth", index + 1);
      assert.equal((await events(page, "host_scroll_depth")).at(-1).parameters.percent, threshold);
    }
    await scrollPercent(page, 20);
    await scrollPercent(page, 100);
    assert.equal((await events(page, "host_scroll_depth")).length, 5);

    // Landing starts with one FAQ open. An intentional expansion is the first event.
    assert.equal((await events(page, "host_faq_open")).length, 0);
    const faq2 = page.locator('[data-host-flyer-faq="2"]');
    await faq2.click();
    await faq2.click();
    assert.deepEqual(
      (await events(page, "host_faq_open")).map((e) => e.parameters.faq_id),
      [2],
    );
    for (const sectionId of [
      "benefits",
      "process",
      "community",
      "history",
      "partners",
      "guide",
      "registration",
      "top_questions",
      "faq",
      "customer_service",
    ]) {
      await page
        .locator(`[data-analytics-section="${sectionId}"]`)
        .locator("h2")
        .first()
        .evaluate((heading) => heading.scrollIntoView({ block: "center", behavior: "instant" }));
      await settleFrame(page);
      const sections = (await events(page, "host_section_view")).filter(
        (event) => event.parameters.section_id === sectionId,
      );
      assert.equal(sections.length, 1, sectionId);
    }

    // Preserve the actual controls and prevent external launch while testing their clicks.
    await page.evaluate(() => {
      document.addEventListener(
        "click",
        (event) => {
          if (
            event.target.closest(
              '[data-host-flyer-cta="telephone_footer"],[data-host-flyer-cta="kakao_footer"],[data-host-flyer-cta="register_band"]',
            )
          ) {
            event.preventDefault();
          }
        },
        true,
      );
    });
    for (const id of ["telephone_footer", "kakao_footer", "register_band"]) {
      await page.locator(`[data-host-flyer-cta="${id}"]`).click();
    }

    const openConsult = () => page.locator('[data-host-flyer-cta="consult_hero"]').click();
    await openConsult();
    await consultSubmit(page).click();
    assert.deepEqual(await events(page, "host_form_start"), []);
    assert.deepEqual(await events(page, "generate_lead"), []);
    assert.equal(
      requests.filter(
        ({ method, path }) => method === "POST" && path === "/host-consultation-requests",
      ).length,
      0,
    );
    await page.getByRole("button", { name: "닫기", exact: true }).click();
    assert.deepEqual(await events(page, "generate_lead"), []);

    await openConsult();
    await fillConsultation(page);
    for (const status of [409, 500, 200, 201]) {
      consultationStatus = status;
      const response = page.waitForResponse(
        (candidate) =>
          candidate.url().endsWith("/api/bff/host-consultation-requests") &&
          candidate.status() === status,
      );
      await consultSubmit(page).click();
      await response;
      if (status === 201) {
        await waitCount(page, "generate_lead", 1);
        await page.getByText("상담 신청이 접수되었습니다.", { exact: true }).waitFor();
      } else {
        await page.getByRole("alert").filter({ hasText: /접수/ }).waitFor();
        assert.deepEqual(await events(page, "generate_lead"), []);
      }
    }

    await page.getByRole("button", { name: "닫기", exact: true }).click();
    await openConsult();
    await fillConsultation(page);
    await consultSubmit(page).click();
    await page.getByText("상담 신청이 접수되었습니다.", { exact: true }).waitFor();
    assert.equal((await events(page, "generate_lead")).length, 1);
    assert.equal((await events(page, "host_form_start")).length, 1);
    await page.getByRole("button", { name: "닫기", exact: true }).click();

    const accepted = requests
      .filter(({ method, path }) => method === "POST" && path === "/host-consultation-requests")
      .at(-1);
    assertCrmAttribution(accepted.attribution);
    assert.equal(accepted.body.phone, normalizedPhone);
    assert.equal(Object.keys(accepted.body).includes("utm_source"), false);

    const consultEvents = await events(page);
    const clicked = new Set(
      consultEvents
        .filter((entry) => entry.name === "host_cta_click")
        .map((entry) => entry.parameters.cta_id),
    );
    for (const id of ["consult_hero", "telephone_footer", "kakao_footer", "register_band"])
      assert.ok(clicked.has(id), id);
    assertNoPrivateAnalytics(consultEvents);
    assert.deepEqual(errors, []);
    console.log(
      "PASS mobile landing, section headings, 5 scroll milestones, actual CTAs, FAQ, consultation validation and receipts",
    );

    await page.reload();
    await waitCount(page, "host_landing_view", 1);
    await openConsult();
    await fillConsultation(page, { countFormStart: false });
    await consultSubmit(page).click();
    await page.getByText("상담 신청이 접수되었습니다.", { exact: true }).waitFor();
    assert.deepEqual(await events(page, "generate_lead"), []);
    assert.deepEqual(await events(page, "host_form_start"), []);
    await page.getByRole("button", { name: "닫기", exact: true }).click();

    const floating = page.locator('[data-host-flyer-cta="register_floating"]');
    await floating.click();
    await page.waitForURL(/\/login\?error=login_required/);
    assert.equal(
      (await events(page, "host_cta_click")).at(-1).parameters.cta_id,
      "register_floating",
    );
    assert.equal(
      await page.evaluate(
        (key) => JSON.parse(sessionStorage.getItem(key)).attribution.utm_content,
        storageKey,
      ),
      "general",
    );
    await page.reload();
    assert.equal(
      await page.evaluate(
        (key) => JSON.parse(sessionStorage.getItem(key)).attribution.utm_content,
        storageKey,
      ),
      "general",
    );

    await context.addCookies([
      { name: "ht_access_token", value: "synthetic-session", url: origin },
    ]);
    await page.goto(origin + printedPath, { referer: origin + "/login" });
    await waitCount(page, "host_landing_view", 1);
    await page.locator('[data-host-flyer-cta="register_floating"]').click();
    await page.waitForURL(/\/listing\/new$/);
    assert.ok(
      (await events(page, "host_cta_click")).some(
        (event) => event.parameters.cta_id === "register_floating",
      ),
    );

    // Resume a pre-filled, synthetic draft at the app's real final step.
    const finalStep = origin + `/listing/new/steps/10?draftId=${draftId}`;
    const details = page.waitForResponse((candidate) => candidate.url().endsWith(draftPath));
    await page.goto(finalStep, { referer: origin + "/listing/new" });
    await details;
    await page.getByRole("heading", { name: "매물 등록 요청을 완료해주세요" }).waitFor();
    await page.waitForFunction(
      () => document.querySelector('input[placeholder="홍길동"]')?.value === "기존 임시 입력",
    );
    const submitListing = page.getByRole("button", { name: "등록 요청하기", exact: true });
    await submitListing.click();
    assert.deepEqual(await events(page, "generate_lead"), []);
    assert.deepEqual(await events(page, "host_form_start"), []);
    await page.getByRole("button", { name: "오전(9시-12시)" }).click();
    await waitCount(page, "host_form_start", 1);
    await page.getByLabel("이름", { exact: true }).fill(privateName);
    await page.getByLabel("연락처", { exact: true }).fill(privatePhone);
    await page.getByRole("button", { name: "전화", exact: true }).click();
    const agreements = page.locator("input[data-analytics-ignore]");
    for (const input of await agreements.all()) {
      await input.press("Space");
      assert.ok(await input.isChecked());
    }
    await waitCount(page, "host_form_start", 1);
    assert.equal((await events(page, "host_form_start"))[0].parameters.form_id, "room_listing");

    listingStatus = 500;
    const failed = page.waitForResponse(
      (candidate) => candidate.url().endsWith(draftPath + "/submit") && candidate.status() === 500,
    );
    await submitListing.click();
    await failed;
    await page
      .getByText("일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", { exact: true })
      .waitFor();
    assert.deepEqual(await events(page, "generate_lead"), []);

    listingStatus = 201;
    await submitListing.click();
    await page.waitForURL(/\/listing\/new\/complete$/);
    await waitCount(page, "generate_lead", 1);
    const registrationEvents = await events(page);
    assert.equal(registrationEvents.at(-1).parameters.lead_type, "room_listing");
    assert.equal(
      registrationEvents.at(-1).parameters.page_location,
      origin + "/listing/new/steps/10",
    );
    assertNoPrivateAnalytics(registrationEvents);
    const submitted = requests.filter(({ path }) => path === draftPath + "/submit").at(-1);
    assertCrmAttribution(submitted.attribution);
    assert.deepEqual(submitted.body, { expectedVersion: 2 });
    assert.ok(
      requests
        .filter(({ method, path }) => method === "PUT" && path === draftPath)
        .every(({ attribution }) => attribution === undefined),
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS SPA navigation, login guard, reload, room listing validation and accepted backend receipt",
    );
  } finally {
    await context.close();
  }
}

function assertCrmAttribution(value) {
  const { first_landed_at: firstLandedAt, ...attribution } = JSON.parse(value);
  assert.deepEqual(attribution, expectedAttribution);
  assert.equal(new Date(firstLandedAt).toISOString(), firstLandedAt);
  assert.ok(Math.abs(Date.now() - Date.parse(firstLandedAt)) < 60_000);
}

function assertNoPrivateAnalytics(log) {
  const serialized = JSON.stringify(log);
  for (const value of [
    privateMail,
    privatePhone,
    normalizedPhone,
    privateName,
    receiptId,
    draftId,
    roomId,
    "가상대학교",
  ]) {
    assert.ok(!serialized.includes(value), `Unexpected private data in analytics: ${value}`);
  }
  const allowed = new Set([
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "landing_path",
    "send_to",
    "page_location",
    "page_referrer",
    "page_title",
    "campaign_code",
    "percent",
    "section_id",
    "section_order",
    "cta_id",
    "cta_position",
    "cta_type",
    "faq_id",
    "form_id",
    "lead_type",
  ]);
  for (const event of log)
    assert.ok(
      Object.keys(event.parameters).every((key) => allowed.has(key)),
      event.name,
    );
}

async function testConsentAndOtherCampaign(browser, { origin }) {
  const { context, page } = await browserPage(browser, origin);
  try {
    await page.goto(origin + printedPath + "&email=" + encodeURIComponent(privateMail));
    await page.getByRole("button", { name: "건너뛰기" }).click();
    assert.deepEqual(await events(page), []);
    assert.equal(await page.evaluate((key) => sessionStorage.getItem(key), storageKey), null);
    await page.reload();
    await page.locator("h1").waitFor();
    assert.deepEqual(await events(page), []);
    assert.equal(await page.evaluate(() => window.__fakeTagLoaded), undefined);

    // A fresh QR entry with an explicitly allowed version code, with an unrelated query value.
    await page.goto(
      origin +
        printedPath.replace("general", "apt001") +
        "&email=" +
        encodeURIComponent(privateMail),
    );
    await page.getByRole("button", { name: "통계 수집 허용" }).click();
    await waitCount(page, "host_landing_view", 1);
    assert.equal((await events(page, "host_landing_view"))[0].parameters.utm_content, "apt001");
    assertNoPrivateAnalytics(await events(page));

    await page.evaluate(() => {
      let simulatedVisibility = "hidden";
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => simulatedVisibility,
      });
      window.__showTestTab = () => {
        simulatedVisibility = "visible";
        document.dispatchEvent(new Event("visibilitychange"));
      };
      document.dispatchEvent(new Event("visibilitychange"));
    });
    const previous = (await events(page)).length;
    await scrollPercent(page, 100);
    assert.equal((await events(page)).length, previous);
    await page.evaluate(() => window.__showTestTab());
    await settleFrame(page);
    assert.deepEqual(await events(page, "host_scroll_depth"), []);

    await scrollPercent(page, 0);
    await page.getByRole("button", { name: "통계 수집 중지" }).click();
    assert.equal(await page.evaluate((key) => sessionStorage.getItem(key), storageKey), null);
    assert.equal(await page.evaluate((id) => window["ga-disable-" + id], measurementId), true);
    await scrollPercent(page, 100);
    assert.deepEqual(await events(page, "host_scroll_depth"), []);

    await scrollPercent(page, 0);
    await page.getByRole("button", { name: "통계 수집 허용" }).click();
    await waitCount(page, "host_landing_view", 2);
    await page.evaluate(() => history.pushState({}, "", "/intro/host?utm_campaign=other"));
    await page.waitForFunction((key) => sessionStorage.getItem(key) === null, storageKey);
    await scrollPercent(page, 100);
    assert.deepEqual(await events(page, "host_scroll_depth"), []);

    for (const path of [
      "/intro/host?utm_source=other",
      printedPath.replace("general", encodeURIComponent(privateMail)),
      printedPath + "&utm_content=apt001",
    ]) {
      await page.goto(origin + path);
      await page.locator("h1").waitFor();
      assert.deepEqual(await events(page), []);
      assert.equal(await page.getByRole("complementary", { name: "방문 통계 설정" }).count(), 0);
    }
    console.log(
      "PASS decline, withdrawal, hidden tab, distinct apartment code, unknown or duplicated UTMs, and private query stripping",
    );
  } finally {
    await context.close();
  }
}

async function testKakaoReturn(browser, { origin }) {
  const { context, page } = await browserPage(browser, origin);
  try {
    await page.goto(origin + printedPath);
    await page.getByRole("button", { name: "통계 수집 허용" }).click();
    await waitCount(page, "host_landing_view", 1);
    const original = await page.evaluate(
      (key) => JSON.parse(sessionStorage.getItem(key)),
      storageKey,
    );
    await page.locator('[data-host-flyer-cta="register_floating"]').click();
    await page.waitForURL(/\/login\?error=login_required/);
    const callback = page.waitForResponse((response) =>
      response.url().startsWith(origin + "/auth/kakao/callback?"),
    );
    await page.getByRole("button", { name: "카카오로 시작하기", exact: true }).click();
    const returned = await callback;
    assert.match(returned.headers().location, new RegExp("flyer_resume=" + original.entryId));
    await page.waitForURL(origin + "/listing/new");
    await page.waitForFunction(
      (key) => JSON.parse(sessionStorage.getItem(key))?.firstLandedAt,
      storageKey,
    );
    const restored = await page.evaluate(
      (key) => JSON.parse(sessionStorage.getItem(key)),
      storageKey,
    );
    assert.equal(restored.entryId, original.entryId);
    assert.equal(restored.firstLandedAt, original.firstLandedAt);
    assert.equal(restored.attribution.utm_content, "general");
    console.log(
      "PASS Kakao OAuth callback delivers the same tab entry without relying on referrer",
    );
  } finally {
    await context.close();
  }
}

async function testExistingTag(browser, { origin }) {
  const { context, page } = await browserPage(browser, origin);
  try {
    await context.addInitScript(() => {
      window.gtag = (...command) => {
        (window.dataLayer ??= []).push(command);
      };
    });
    await page.goto(origin + printedPath);
    await page.getByRole("button", { name: "통계 수집 허용" }).click();
    await waitCount(page, "host_landing_view", 1);
    assert.equal((await events(page, "host_landing_view"))[0].parameters.send_to, measurementId);
    assert.deepEqual(await events(page, "page_view"), []);
    assert.equal(await page.evaluate(() => window.__fakeTagLoaded), undefined);
    assert.ok(
      await page.evaluate(() => window.dataLayer.every(([command]) => command === "event")),
    );
    console.log("PASS reuse of existing gtag without initialization or extra page_view");
  } finally {
    await context.close();
  }
}

async function checkForwarding(origin, expected) {
  const path = "/host-consultation-requests";
  for (const [value, valid] of [
    [{ ...expectedAttribution, first_landed_at: timestamp }, true],
    [{ ...expectedAttribution, first_landed_at: timestamp, email: privateMail }, false],
    [{ ...expectedAttribution, first_landed_at: timestamp, utm_content: privateMail }, false],
    [expectedAttribution, false],
  ]) {
    const response = await fetch(origin + "/api/bff" + path, {
      method: "POST",
      headers: { "content-type": "application/json", [headerName]: JSON.stringify(value) },
      body: "{}",
    });
    assert.equal(response.status, 201);
    const received = requests.at(-1).attribution;
    if (expected && valid) assert.deepEqual(JSON.parse(received), value);
    else assert.equal(received, undefined);
  }
}

const backendPort = await listen(backend);
const browser = await chromium.launch();
let app;
try {
  app = await startFrontend(backendPort, { measurement: measurementId, forward: true });
  await testEnabled(browser, app);
  await testConsentAndOtherCampaign(browser, app);
  await testKakaoReturn(browser, app);
  await testExistingTag(browser, app);
  await checkForwarding(app.origin, true);
  await app.stop();
  app = await startFrontend(backendPort);
  await checkForwarding(app.origin, false);
  const { context, page } = await browserPage(browser, app.origin);
  try {
    await page.goto(app.origin + printedPath);
    await page.locator("h1").waitFor();
    assert.equal(await page.getByRole("complementary", { name: "방문 통계 설정" }).count(), 0);
    await page.locator('[data-host-flyer-cta="consult_hero"]').click();
    await fillConsultation(page, { countFormStart: false });
    await consultSubmit(page).click();
    await page.getByText("상담 신청이 접수되었습니다.", { exact: true }).waitFor();
    assert.deepEqual(await events(page), []);
    assert.equal(requests.at(-1).attribution, undefined);
  } finally {
    await context.close();
  }
  console.log(
    "PASS BFF forwarding flag and strict allowlist, original consultation works without analytics configuration",
  );
} catch (error) {
  if (app) console.error(app.logs());
  throw error;
} finally {
  if (app) await app.stop();
  await browser.close();
  backend.close();
}
