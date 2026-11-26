/**
 * POST /api/visit — first-party visit collector (Cloudflare Pages Function).
 *
 * js/calendly-init.v2.js sends a visitor's record here when they engage with
 * the booking widget: how they first arrived and the pages they viewed. This
 * function:
 *   1. accepts same-site requests only, with a size cap and a strict shape;
 *   2. adds city-level location from Cloudflare's own lookup (request.cf).
 *      The visitor's IP address is never read, stored or forwarded;
 *   3. forwards the record to the CRM's existing funnel-session endpoint,
 *      keyed by the visit id. Calendly echoes the same id in its booking
 *      webhook (tracking.salesforce_uuid), which is how the CRM attaches the
 *      visit to the lead.
 *
 * Pages project settings (Settings → Variables and Secrets, Production and Preview):
 *   CRM_API_URL       base URL of the CRM backend, no trailing path
 *   LEAD_WEBHOOK_KEY  secret; the same key the CRM checks on /api/funnel-sessions
 * Without both, the function answers 204 and forwards nothing, so the site
 * keeps working before the settings exist.
 */

const SESSION_ID = /^web_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const MAX_BODY_CHARS = 24000;
const MAX_PAGES = 60;
const MAX_EVENTS = 20;
const BOT_UA = /bot\b|bot\/|crawl|spider|slurp|headless|lighthouse|pingdom|uptimerobot|facebookexternalhit/i;
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
const CLICK_ID_KEYS = ['gclid', 'gbraid', 'wbraid', 'dclid', 'gclsrc', 'fbclid', 'msclkid'];
const EVENT_KINDS = ['call_click', 'email_click'];
const REASONS = ['widget_focus', 'time_selected', 'booked', 'scheduler_link'];
const NAV_TYPES = ['navigate', 'reload', 'back_forward', 'prerender'];
const PAGE_SOURCES =['website', 'ewing', 'houston', 'philadelphia', 'hackensack'];

function text(value, max) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

function isoDate(value) {
  if (typeof value !== 'string') return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
}

function pick(source, keys, max) {
  const out = {};
  if (!source || typeof source !== 'object') return out;
  for (const key of keys) {
    const value = text(source[key], max);
    if (value) out[key] = value;
  }
  return out;
}

function sitePath(value) {
  const path = text(value, 500);
  return path && path.startsWith('/') ? path : null;
}

/** One arrival (first or last touch) in the shape the CRM stores. */
function touch(raw, origin) {
  if (!raw || typeof raw !== 'object') return null;
  const path = sitePath(raw.url);
  return {
    landingUrl: path ? origin + path : null,
    referrer: text(raw.referrer, 500),
    utm: pick(raw.utm, UTM_KEYS, 200),
    ...pick(raw.ids, CLICK_ID_KEYS, 300),
    capturedAt: isoDate(raw.at),
    // How the page was opened and how much history the tab had. Used by the
    // CRM to read arrivals that carry no referrer.
    navType: NAV_TYPES.includes(raw.nav) ? raw.nav : null,
    historyLength: Number.isInteger(raw.hist) && raw.hist > 0 && raw.hist < 100 ? raw.hist : null,
  };
}

/** City-level location from Cloudflare. Coordinates are rounded to ~1 km. */
export function geoFromCf(cf) {
  if (!cf || typeof cf !== 'object') return null;
  const coordinate = (value) => {
    const n = Number(value);
    return value !== undefined && value !== null && value !== '' && Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
  };
  const geo = {
    city: text(cf.city, 100),
    region: text(cf.region, 100),
    regionCode: text(cf.regionCode, 10),
    country: text(cf.country, 2),
    latitude: coordinate(cf.latitude),
    longitude: coordinate(cf.longitude),
    timezone: text(cf.timezone, 60),
  };
  return Object.values(geo).some((value) => value !== null) ? geo : null;
}

/**
 * Validate the browser's record and build what the CRM stores.
 * Returns null when the record is not one this site's script would send.
 */
export function buildSession(body, { origin, cf, userAgent }) {
  if (!body || typeof body !== 'object') return null;
  if (typeof body.sessionId !== 'string' || !SESSION_ID.test(body.sessionId)) return null;
  const first = touch(body.first, origin);
  if (!first || !first.capturedAt) return null;

  const pages = (Array.isArray(body.pages) ? body.pages : [])
    .filter((page) => page && sitePath(page.p) && Number.isFinite(page.t))
    .slice(-MAX_PAGES)
    .map((page) => ({ p: sitePath(page.p).slice(0, 200), t: new Date(page.t).toISOString() }));
  const events = (Array.isArray(body.events) ? body.events : [])
    .filter((event) => event && EVENT_KINDS.includes(event.e) && Number.isFinite(event.t))
    .slice(-MAX_EVENTS)
    .map((event) => ({
      e: event.e,
      v: text(event.v, 60),
      p: sitePath(event.p),
      t: new Date(event.t).toISOString(),
    }));
  const views = Number.isInteger(body.views) && body.views > 0 ? Math.min(body.views, 10000) : pages.length;

  return {
    sessionId: body.sessionId,
    data: {
      funnelType: 'website',
      attribution: { ...first, userAgent: text(userAgent, 300) },
      visit: {
        firstSeenAt: first.capturedAt,
        lastTouch: touch(body.last, origin),
        bookingPage: sitePath(body.bookingPage),
        pageSource: PAGE_SOURCES.includes(body.pageSource) ? body.pageSource : null,
        reason: REASONS.includes(body.reason) ? body.reason : null,
        pageViews: views,
        pages,
        events,
        geo: geoFromCf(cf),
      },
    },
  };
}

/** Only this site's own pages may post. */
export function isSameSite(request) {
  const host = new URL(request.url).host;
  const hostOf = (value) => {
    try { return new URL(value).host; } catch { return null; }
  };
  const origin = request.headers.get('origin');
  if (origin) return hostOf(origin) === host;
  const referer = request.headers.get('referer');
  if (referer) return hostOf(referer) === host;
  return request.headers.get('sec-fetch-site') === 'same-origin';
}

async function forward(env, session) {
  const url = env.CRM_API_URL.replace(/\/+$/, '') + '/api/funnel-sessions';
  const send = () => fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': env.LEAD_WEBHOOK_KEY },
    body: JSON.stringify(session),
  });
  try {
    let response = await send();
    if (response.status === 409) response = await send(); // CRM write conflict: it asks for one retry
    if (!response.ok) console.error('[visit] CRM answered ' + response.status + ' for ' + session.sessionId);
  } catch (error) {
    console.error('[visit] CRM unreachable for ' + session.sessionId + ': ' + (error && error.message));
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!isSameSite(request)) return new Response(null, { status: 403 });

  const userAgent = request.headers.get('user-agent') || '';
  if (BOT_UA.test(userAgent)) return new Response(null, { status: 204 });

  const raw = await request.text();
  if (raw.length > MAX_BODY_CHARS) return new Response(null, { status: 413 });
  let body;
  try { body = JSON.parse(raw); } catch { return new Response(null, { status: 400 }); }

  const session = buildSession(body, { origin: new URL(request.url).origin, cf: request.cf, userAgent });
  if (!session) return new Response(null, { status: 400 });

  if (env.CRM_API_URL && env.LEAD_WEBHOOK_KEY) context.waitUntil(forward(env, session));
  return new Response(null, { status: 204 });
}
