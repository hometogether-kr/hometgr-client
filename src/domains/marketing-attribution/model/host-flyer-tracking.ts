import { buildHostFlyerUrl, HOST_FLYER_HEADER, HOST_FLYER_PATH } from "./host-flyer-campaign";
import {
  type FlyerFormId,
  getHostFlyerSession,
  hostFlyerMeasurementId,
  type HostFlyerSession,
  storeSentHostFlyerReceipt,
  updateHostFlyerSession,
} from "./host-flyer-session";

const ctas = {
  consult_hero: { cta_position: "hero", cta_type: "consultation" },
  register_band: { cta_position: "registration_band", cta_type: "room_listing" },
  register_floating: { cta_position: "floating", cta_type: "room_listing" },
  telephone_footer: { cta_position: "footer", cta_type: "telephone" },
  kakao_footer: { cta_position: "footer", cta_type: "kakao" },
} as const;

const sectionIds = [
  "hero",
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
] as const;

type SectionId = (typeof sectionIds)[number];
type LeadType = "consultation" | "room_listing";

interface EventParameters {
  page_view: Record<string, never>;
  host_landing_view: { campaign_code: "host_a4_202611" };
  host_scroll_depth: { percent: number };
  host_section_view: { section_id: SectionId; section_order: number };
  host_cta_click: { cta_id: keyof typeof ctas; cta_position: string; cta_type: string };
  host_faq_open: { faq_id: number };
  host_form_start: { form_id: FlyerFormId };
  generate_lead: { form_id: FlyerFormId; lead_type: LeadType };
}

type Tag = (...command: unknown[]) => void;
type TagWindow = Window & {
  gtag?: Tag;
  dataLayer?: unknown[];
};

let ownedTag: Tag | undefined;
let ownedTagEnabled = false;

const consentDefaults = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
} as const;

function getTag(session: HostFlyerSession): Tag | undefined {
  const browser: TagWindow = window;
  if (browser.gtag) {
    if (browser.gtag === ownedTag && !ownedTagEnabled) {
      Reflect.set(window, `ga-disable-${hostFlyerMeasurementId}`, false);
      ownedTag("consent", "update", { ...consentDefaults, analytics_storage: "granted" });
      ownedTagEnabled = true;
    }
    return browser.gtag;
  }

  // Do not start another tag alongside an installed tag manager.
  if (
    document.querySelector(
      'script[src*="googletagmanager.com/gtm.js"], script[src*="googletagmanager.com/gtag/js"]',
    )
  )
    return;

  const dataLayer = browser.dataLayer ?? (browser.dataLayer = []);
  const tag: Tag = function (...command) {
    // The Google tag queue identifies gtag commands via the arguments object.
    // eslint-disable-next-line prefer-rest-params
    if (command.length) dataLayer.push(arguments);
  };
  browser.gtag = tag;
  ownedTag = tag;
  ownedTagEnabled = true;
  tag("consent", "default", { ...consentDefaults, analytics_storage: "granted" });
  tag("js", new Date());
  tag("config", hostFlyerMeasurementId, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_prefix: "ht_flyer",
    page_location: buildHostFlyerUrl(session.attribution.utm_content, location.origin).href,
    page_referrer: "",
  });

  const script = document.createElement("script");
  script.async = true;
  script.referrerPolicy = "no-referrer";
  script.src = `https://www.googletagmanager.com/gtag/js?id=${hostFlyerMeasurementId}`;
  document.head.append(script);
  return tag;
}

export function pauseHostFlyerTag() {
  pendingLeads.clear();
  if (!ownedTag || !ownedTagEnabled) return;
  Reflect.set(window, `ga-disable-${hostFlyerMeasurementId}`, true);
  ownedTag("consent", "update", { ...consentDefaults, analytics_storage: "denied" });
  ownedTagEnabled = false;
}

const LISTING_FORM_PATH = /^\/listing\/new\/steps\/(?:[1-9]|10)$/;

function emit<N extends keyof EventParameters>(
  name: N,
  parameters: EventParameters[N],
  session = getHostFlyerSession(),
): boolean {
  if (document.visibilityState !== "visible" || !session) return false;
  const path = window.location.pathname;
  const pageLocation = LISTING_FORM_PATH.test(path)
    ? new URL(path, window.location.origin)
    : buildHostFlyerUrl(session.attribution.utm_content, window.location.origin);
  try {
    const tag = getTag(session);
    if (!tag) return false;
    tag("event", name, {
      ...parameters,
      ...session.attribution,
      send_to: hostFlyerMeasurementId,
      page_location: pageLocation.href,
      page_referrer: "",
      page_title: LISTING_FORM_PATH.test(path) ? "홈투게더 방 등록" : "홈투게더 호스트 소개",
    });
  } catch {
    return false;
  }
  updateHostFlyerSession();
  return true;
}

export { getHostFlyerSession as captureHostFlyerSubmission } from "./host-flyer-session";

export function hostFlyerSubmissionHeaders(
  session: HostFlyerSession | null,
): HeadersInit | undefined {
  if (!session) return;
  return {
    [HOST_FLYER_HEADER]: JSON.stringify({
      ...session.attribution,
      first_landed_at: session.firstLandedAt,
    }),
  };
}

interface PendingLead {
  entryId: string;
  formId: FlyerFormId;
  leadType: LeadType;
}

const pendingLeads = new Map<string, PendingLead>();

export function flushHostFlyerLeads() {
  const session = getHostFlyerSession();
  if (!session || document.visibilityState !== "visible") return;
  for (const [receipt, lead] of pendingLeads) {
    pendingLeads.delete(receipt);
    if (session.entryId !== lead.entryId || session.sentReceipts.includes(receipt)) continue;
    if (emit("generate_lead", { form_id: lead.formId, lead_type: lead.leadType }, session)) {
      storeSentHostFlyerReceipt(receipt);
    }
  }
}

export function trackHostFlyerLead(
  session: HostFlyerSession | null,
  formId: FlyerFormId,
  receiptId: string,
) {
  if (!session || session.entryId !== getHostFlyerSession()?.entryId) return;
  const receipt = `${formId}:${receiptId}`;
  if (session.sentReceipts.includes(receipt)) return;

  pendingLeads.set(receipt, {
    entryId: session.entryId,
    formId,
    leadType: formId === "host_consultation" ? "consultation" : "room_listing",
  });
  flushHostFlyerLeads();
}

function trackFormStart(formId: FlyerFormId) {
  const session = getHostFlyerSession();
  if (!session) return;
  if (session.startedForms.includes(formId)) {
    updateHostFlyerSession();
    return;
  }

  if (emit("host_form_start", { form_id: formId }, session)) updateHostFlyerSession(formId);
}

export function watchHostFlyerForms() {
  function handleInput(event: Event) {
    if (!event.isTrusted || !getHostFlyerSession()) return;
    const path = window.location.pathname;
    const isListing = LISTING_FORM_PATH.test(path);
    if (path !== HOST_FLYER_PATH && !isListing) return;
    const field = event.target;
    if (field instanceof HTMLInputElement) {
      if (field.type === "radio" || field.type === "checkbox") {
        if (!field.checked) return;
      } else if (field.type === "file") {
        if (!field.files?.length) return;
      } else if (
        ["hidden", "submit", "button", "password"].includes(field.type) ||
        !field.value.trim()
      )
        return;
    } else if (field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
      if (!field.value.trim()) return;
    } else return;

    if (path === HOST_FLYER_PATH && field.closest('[data-host-flyer-form="host_consultation"]')) {
      if (!(field instanceof HTMLInputElement && field.type === "checkbox"))
        trackFormStart("host_consultation");
    }
    if (isListing && field.closest("main") && !field.hasAttribute("data-analytics-ignore"))
      trackFormStart("room_listing");
  }

  function handleChoice(event: MouseEvent) {
    if (
      event.isTrusted &&
      LISTING_FORM_PATH.test(window.location.pathname) &&
      event.target instanceof Element &&
      event.target.closest('main button[aria-pressed="false"]:enabled')
    )
      trackFormStart("room_listing");
  }

  document.addEventListener("click", handleChoice, true);
  document.addEventListener("input", handleInput, true);
  document.addEventListener("change", handleInput, true);
  return () => {
    document.removeEventListener("click", handleChoice, true);
    document.removeEventListener("input", handleInput, true);
    document.removeEventListener("change", handleInput, true);
  };
}

const depths = [25, 50, 75, 90, 100] as const;

interface LandingEvents {
  visitorEntry: string | undefined;
  sentPageView: boolean;
  sentLandingView: boolean;
  depthsSeen: Set<number>;
  sectionsSeen: Set<SectionId>;
}

let landing: LandingEvents | undefined;

export function resetHostFlyerLanding() {
  landing = undefined;
}

export function watchHostFlyerLanding() {
  const session = getHostFlyerSession();
  if (!session) return;

  if (!landing || landing.visitorEntry !== session.entryId) {
    landing = {
      visitorEntry: session.entryId,
      sentPageView: false,
      sentLandingView: false,
      depthsSeen: new Set(),
      sectionsSeen: new Set(),
    };
  }
  const measurements = landing;
  let frame = 0;
  let scrollChanged = false;
  let previousScrollY = window.scrollY;

  function sample() {
    frame = 0;
    if (document.visibilityState !== "visible" || window.location.pathname !== HOST_FLYER_PATH)
      return;
    const current = getHostFlyerSession();
    if (!current || current.entryId !== measurements.visitorEntry) return;

    // Only a newly initialized tag needs a manual landing page_view.
    if (!measurements.sentPageView) {
      const browser: TagWindow = window;
      measurements.sentPageView =
        (Boolean(browser.gtag) && browser.gtag !== ownedTag) || emit("page_view", {}, current);
    }
    if (!measurements.sentLandingView) {
      measurements.sentLandingView = emit(
        "host_landing_view",
        {
          campaign_code: current.attribution.utm_campaign,
        },
        current,
      );
    }

    const viewportHeight = window.innerHeight;
    const stickyBottom =
      document.querySelector("[data-sticky-site-header]")?.getBoundingClientRect().bottom ?? 0;
    document.querySelectorAll<HTMLElement>("[data-analytics-section]").forEach((section, index) => {
      const id = section.dataset.analyticsSection;
      const sectionId = sectionIds.find((candidate) => candidate === id);
      if (!sectionId || measurements.sectionsSeen.has(sectionId)) return;
      const heading = section.querySelector("h1,h2");
      if (!heading) return;
      const rect = heading.getBoundingClientRect();
      if (rect.height > 0 && rect.bottom > stickyBottom && rect.top < viewportHeight) {
        if (
          emit("host_section_view", { section_id: sectionId, section_order: index + 1 }, current)
        ) {
          measurements.sectionsSeen.add(sectionId);
        }
      }
    });

    if (!scrollChanged) {
      previousScrollY = window.scrollY;
      return;
    }
    scrollChanged = false;
    const max = (document.scrollingElement?.scrollHeight ?? 0) - viewportHeight;
    const scrollY = window.scrollY;
    if (max <= 0 || scrollY <= previousScrollY) {
      previousScrollY = scrollY;
      return;
    }
    previousScrollY = scrollY;
    const progress = (scrollY / max) * 100;
    for (const percent of depths) {
      const reached = percent === 100 ? max - scrollY < 1 : progress >= percent;
      if (
        reached &&
        !measurements.depthsSeen.has(percent) &&
        emit("host_scroll_depth", { percent }, current)
      ) {
        measurements.depthsSeen.add(percent);
      }
    }
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(sample);
  }
  function handleScroll() {
    if (document.visibilityState === "visible") scrollChanged = true;
    else previousScrollY = window.scrollY;
    schedule();
  }
  function handleClick(event: MouseEvent) {
    if (!event.isTrusted || !(event.target instanceof Element)) return;
    const cta = event.target.closest<HTMLElement>("[data-host-flyer-cta]")?.dataset.hostFlyerCta;
    const ctaId = (Object.keys(ctas) as Array<keyof typeof ctas>).find((id) => id === cta);
    if (ctaId) emit("host_cta_click", { cta_id: ctaId, ...ctas[ctaId] });

    const faq = event.target.closest<HTMLButtonElement>(
      'button[data-host-flyer-faq][aria-expanded="false"]',
    );
    const faqId = faq ? Number(faq.dataset.hostFlyerFaq) : NaN;
    if (Number.isInteger(faqId) && faqId > 0 && faqId <= 99)
      emit("host_faq_open", { faq_id: faqId });
  }

  const resize = new ResizeObserver(schedule);
  const content = document.querySelector("main");
  if (content) resize.observe(content);
  schedule();
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", schedule);
  document.addEventListener("visibilitychange", schedule);
  document.addEventListener("click", handleClick, true);
  return () => {
    resize.disconnect();
    cancelAnimationFrame(frame);
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", schedule);
    document.removeEventListener("visibilitychange", schedule);
    document.removeEventListener("click", handleClick, true);
  };
}
