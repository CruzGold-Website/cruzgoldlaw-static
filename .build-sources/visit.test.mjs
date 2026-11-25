import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildSession, geoFromCf, isSameSite, onRequestPost } from '../functions/api/visit.js';

const ID = 'web_3f2b8c1e-9a4d-4e7f-8b21-0c5d6e7f8a9b';
const ORIGIN = 'https://cruzgoldlaw.com';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Safari/604.1';
const CF = { city: 'Philadelphia', region: 'Pennsylvania', regionCode: 'PA', country: 'US',
  latitude: '39.95233', longitude: '-75.16379', timezone: 'America/New_York' };

function record(overrides = {}) {
  return {
    sessionId: ID,
    reason: 'time_selected',
    bookingPage: '/contact/',
    pageSource: 'website',
    first: {
      url: '/asylum-lawyer/?utm_source=google&utm_medium=cpc&gclid=abc123',
      referrer: 'https://www.google.com/',
      at: '2026-11-24T15:00:00.000Z',
      utm: { utm_source: 'google', utm_medium: 'cpc' },
      ids: { gclid: 'abc123' },
      tagged: true,
      nav: 'navigate',
      hist: 1,
    },
    last: null,
    pages: [
      { p: '/asylum-lawyer/', t: Date.parse('2026-11-24T15:00:00.000Z') },
      { p: '/contact/', t: Date.parse('2026-11-24T15:02:00.000Z') },
    ],
    events: [{ e: 'call_click', v: 'tel:+16099248500', p: '/contact/', t: Date.parse('2026-11-24T15:02:30.000Z') }],
    views: 2,
    ...overrides,
  };
}

function request(body, headers = {}) {
  return new Request(ORIGIN + '/api/visit', {
    method: 'POST',
    headers: { origin: ORIGIN, 'user-agent': UA, 'content-type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

test('builds the CRM session from a browser record', () => {
  const session = buildSession(record(), { origin: ORIGIN, cf: CF, userAgent: UA });
  assert.equal(session.sessionId, ID);
  assert.equal(session.data.funnelType, 'website');
  assert.deepEqual(session.data.attribution, {
    landingUrl: ORIGIN + '/asylum-lawyer/?utm_source=google&utm_medium=cpc&gclid=abc123',
    referrer: 'https://www.google.com/',
    utm: { utm_source: 'google', utm_medium: 'cpc' },
    gclid: 'abc123',
    capturedAt: '2026-11-24T15:00:00.000Z',
    navType: 'navigate',
    historyLength: 1,
    userAgent: UA,
  });
  const odd = buildSession(record({ first: { ...record().first, nav: 'weird', hist: 5000 } }), { origin: ORIGIN, cf: CF, userAgent: UA });
  assert.equal(odd.data.attribution.navType, null);
  assert.equal(odd.data.attribution.historyLength, null);
  assert.equal(session.data.visit.bookingPage, '/contact/');
  assert.equal(session.data.visit.pageSource, 'website');
  assert.equal(session.data.visit.pageViews, 2);
  assert.deepEqual(session.data.visit.pages.map((page) => page.p), ['/asylum-lawyer/', '/contact/']);
  assert.equal(session.data.visit.events[0].e, 'call_click');
  assert.deepEqual(session.data.visit.geo, { city: 'Philadelphia', region: 'Pennsylvania', regionCode: 'PA',
    country: 'US', latitude: 39.95, longitude: -75.16, timezone: 'America/New_York' });
});

test('rejects records this site would not send', () => {
  const context = { origin: ORIGIN, cf: CF, userAgent: UA };
  assert.equal(buildSession(record({ sessionId: 'abc' }), context), null);
  assert.equal(buildSession(record({ sessionId: '9f3c1a2b-0000-4000-8000-000000000000' }), context), null);
  assert.equal(buildSession(record({ first: null }), context), null);
  assert.equal(buildSession(record({ first: { url: '/', at: 'not a date' } }), context), null);
  assert.equal(buildSession(null, context), null);
});

test('drops fields it does not know and off-site paths', () => {
  const session = buildSession(record({
    pageSource: 'made_up',
    reason: 'made_up',
    bookingPage: 'https://evil.example/',
    pages: [{ p: 'javascript:alert(1)', t: 1 }, { p: '/about/', t: 1700000000000 }, { p: '/x/', t: 'soon' }],
    events: [{ e: 'made_up', t: 1 }],
    first: { url: '//evil.example', at: '2026-11-24T15:00:00.000Z', utm: { utm_source: 'x', other: 'y' }, ids: { nope: '1' } },
  }), { origin: ORIGIN, cf: null, userAgent: UA });
  assert.equal(session.data.visit.pageSource, null);
  assert.equal(session.data.visit.reason, null);
  assert.equal(session.data.visit.bookingPage, null);
  assert.deepEqual(session.data.visit.pages.map((page) => page.p), ['/about/']);
  assert.deepEqual(session.data.visit.events, []);
  assert.deepEqual(session.data.attribution.utm, { utm_source: 'x' });
  assert.equal(session.data.attribution.nope, undefined);
  assert.equal(session.data.visit.geo, null);
});

test('location is city-level and never includes an address', () => {
  assert.deepEqual(geoFromCf({ city: 'Houston', latitude: '29.76328', longitude: '-95.36327' }),
    { city: 'Houston', region: null, regionCode: null, country: null, latitude: 29.76, longitude: -95.36, timezone: null });
  assert.equal(geoFromCf({}), null);
  assert.equal(geoFromCf(undefined), null);
});

test('same-site check', () => {
  assert.equal(isSameSite(request(record())), true);
  assert.equal(isSameSite(request(record(), { origin: 'https://evil.example' })), false);
  const noOrigin = new Request(ORIGIN + '/api/visit', { method: 'POST', headers: { referer: ORIGIN + '/contact/' }, body: '{}' });
  assert.equal(isSameSite(noOrigin), true);
  const bare = new Request(ORIGIN + '/api/visit', { method: 'POST', body: '{}' });
  assert.equal(isSameSite(bare), false);
});

test('handler forwards a valid record to the CRM with the key', async (t) => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    calls.push({ url, init });
    return new Response('{}', { status: 200 });
  });
  const pending = [];
  const response = await onRequestPost({
    request: request(record()),
    env: { CRM_API_URL: 'https://crm.example/', LEAD_WEBHOOK_KEY: 'secret' },
    waitUntil: (promise) => pending.push(promise),
  });
  await Promise.all(pending);
  assert.equal(response.status, 204);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://crm.example/api/funnel-sessions');
  assert.equal(calls[0].init.headers['x-api-key'], 'secret');
  assert.equal(JSON.parse(calls[0].init.body).sessionId, ID);
});

test('handler refuses other sites, bad input and oversize bodies, and skips bots', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => new Response('{}'));
  const env = { CRM_API_URL: 'https://crm.example', LEAD_WEBHOOK_KEY: 'secret' };
  const run = (req) => onRequestPost({ request: req, env, waitUntil: () => {} });
  assert.equal((await run(request(record(), { origin: 'https://evil.example' }))).status, 403);
  assert.equal((await run(request('not json'))).status, 400);
  assert.equal((await run(request(record({ sessionId: 'x' })))).status, 400);
  assert.equal((await run(request(JSON.stringify(record()) + ' '.repeat(30000)))).status, 413);
  assert.equal((await run(request(record(), { 'user-agent': 'Googlebot/2.1' }))).status, 204);
  assert.equal(fetchMock.mock.callCount(), 0);
});

test('handler answers 204 and forwards nothing when the CRM settings are missing', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => new Response('{}'));
  const response = await onRequestPost({ request: request(record()), env: {}, waitUntil: () => {} });
  assert.equal(response.status, 204);
  assert.equal(fetchMock.mock.callCount(), 0);
});
