import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { trackAnalyticsEvent } from './analytics';

const measurementId = 'G-TEST';
const sessionId = 1_791_234_567;
const calculation = { tool_slug: 'personal-loan-emi-calculator-india', tool_category: 'Loans' };

function storageStub() {
  const data = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => data.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { data.set(key, value); }),
  };
}

function stubBrowser(gtag: (...args: unknown[]) => void) {
  const browser = {
    gtag,
    location: new URL('https://www.rupeekit.co.in/tools/emi-calculator-india?rk_principal=123456#result'),
    localStorage: storageStub(),
    navigator: {} as { locks?: { request: ReturnType<typeof vi.fn> } },
  };
  const page = { title: 'EMI calculator', referrer: 'https://www.rupeekit.co.in/tools?rk_salary=99999' };
  vi.stubGlobal('window', browser);
  vi.stubGlobal('document', page);
  return { browser, page };
}

function respondingTag(getSession: () => unknown) {
  return vi.fn((...args: unknown[]) => {
    if (args[0] === 'get') (args[3] as (value: unknown) => void)(getSession());
  });
}

describe('valid calculation session deduplication', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('NEXT_PUBLIC_GA_ID', measurementId);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it('captures attribution before lookup without sending inputs or the session marker', async () => {
    const { trackValidCalculation } = await import('./analytics');
    const gtag = vi.fn();
    const { browser, page } = stubBrowser(gtag);

    const parameters = {
      ...calculation,
      time_to_first_calculation_ms: 4200,
      principal: 123456,
    };
    const result = trackValidCalculation(parameters);
    expect(gtag).toHaveBeenCalledExactlyOnceWith('get', measurementId, 'session_id', expect.any(Function));
    browser.location = new URL('https://www.rupeekit.co.in/tools/sip-calculator-india');
    page.title = 'SIP calculator';
    page.referrer = '';
    (gtag.mock.calls[0][3] as (value: unknown) => void)(sessionId);
    await expect(result).resolves.toBe(true);

    expect(gtag).toHaveBeenCalledWith('event', 'valid_calculation', {
      tool_slug: 'personal-loan-emi-calculator-india',
      tool_category: 'Loans',
      page_location: 'https://www.rupeekit.co.in/tools/emi-calculator-india',
      page_title: 'EMI calculator',
      page_referrer: 'https://www.rupeekit.co.in/tools',
      time_to_first_calculation_ms: 4200,
    });
  });

  it('tracks one event across tools and reloads, then allows a newer GA session', async () => {
    let activeSession = sessionId;
    const gtag = respondingTag(() => activeSession);
    const { browser } = stubBrowser(gtag);
    const firstDocument = await import('./analytics');
    const anotherTool = { tool_slug: 'sip-calculator-india', tool_category: 'Investments' };

    await expect(firstDocument.trackValidCalculation(calculation)).resolves.toBe(true);
    await expect(firstDocument.trackValidCalculation(anotherTool)).resolves.toBe(false);
    vi.resetModules();
    const secondDocument = await import('./analytics');
    await expect(secondDocument.trackValidCalculation(anotherTool)).resolves.toBe(false);

    activeSession += 3_600;
    await expect(secondDocument.trackValidCalculation(anotherTool)).resolves.toBe(true);
    expect(browser.localStorage.setItem).toHaveBeenNthCalledWith(1, expect.stringContaining(measurementId), String(sessionId));
    expect(browser.localStorage.setItem).toHaveBeenNthCalledWith(2, expect.stringContaining(measurementId), String(activeSession));
    expect(gtag.mock.calls.filter(([command]) => command === 'event')).toHaveLength(2);
  });

  it('keeps a newer session marker when an older lookup returns late', async () => {
    const firstDocument = await import('./analytics');
    vi.resetModules();
    const secondDocument = await import('./analytics');
    const gtag = vi.fn();
    const { browser } = stubBrowser(gtag);
    const older = firstDocument.trackValidCalculation(calculation);
    const newer = secondDocument.trackValidCalculation(calculation);
    (gtag.mock.calls[1][3] as (value: unknown) => void)(sessionId + 3_600);
    await expect(newer).resolves.toBe(true);
    (gtag.mock.calls[0][3] as (value: unknown) => void)(sessionId);
    await expect(older).resolves.toBe(false);
    expect(browser.localStorage.setItem).toHaveBeenCalledExactlyOnceWith(expect.stringContaining(measurementId), String(sessionId + 3_600));
  });

  it('serializes simultaneous events from two documents under one origin lock', async () => {
    const firstDocument = await import('./analytics');
    vi.resetModules();
    const secondDocument = await import('./analytics');
    const gtag = respondingTag(() => String(sessionId));
    const { browser } = stubBrowser(gtag);
    let queue = Promise.resolve();
    let lockHeld = false;
    const request = vi.fn((_name: string, _options: LockOptions, send: () => boolean) => {
      const pending = queue.then(() => {
        lockHeld = true;
        try { return send(); } finally { lockHeld = false; }
      });
      queue = pending.then(() => undefined);
      return pending;
    });
    browser.navigator.locks = { request };
    browser.localStorage.getItem.mockImplementation((key) => {
      expect(lockHeld).toBe(true);
      return browser.localStorage.setItem.mock.calls.find(([storedKey]) => storedKey === key)?.[1] ?? null;
    });

    await expect(Promise.all([
      firstDocument.trackValidCalculation(calculation),
      secondDocument.trackValidCalculation(calculation),
    ])).resolves.toEqual([true, false]);
    expect(request).toHaveBeenCalledTimes(2);
    expect(request.mock.calls[0][0]).toBe(request.mock.calls[1][0]);
    expect(gtag.mock.calls.filter(([command]) => command === 'event')).toHaveLength(1);
  });

  it('coalesces simultaneous lookups and deduplicates in memory when storage is blocked', async () => {
    const { trackValidCalculation } = await import('./analytics');
    const gtag = vi.fn();
    const { browser } = stubBrowser(gtag);
    Object.defineProperty(browser, 'localStorage', { get() { throw new Error('Storage denied'); } });
    const first = trackValidCalculation(calculation);
    const second = trackValidCalculation(calculation);
    expect(gtag).toHaveBeenCalledTimes(1);
    (gtag.mock.calls[0][3] as (value: unknown) => void)(sessionId);
    await expect(Promise.all([first, second])).resolves.toEqual([true, false]);
    expect(gtag.mock.calls.filter(([command]) => command === 'event')).toHaveLength(1);
  });

  it('drops the event when GA supplies no session or the tag is unavailable', async () => {
    const { trackValidCalculation } = await import('./analytics');
    const gtag = respondingTag(() => undefined);
    const { browser } = stubBrowser(gtag);
    await expect(trackValidCalculation(calculation)).resolves.toBe(false);
    vi.stubGlobal('window', { ...browser, gtag: undefined });
    await expect(trackValidCalculation(calculation)).resolves.toBe(false);
    expect(gtag.mock.calls.filter(([command]) => command === 'event')).toHaveLength(0);
    expect(browser.localStorage.setItem).not.toHaveBeenCalled();
  });

  it('ignores a session lookup callback that arrives after the deadline', async () => {
    vi.useFakeTimers();
    const { trackValidCalculation } = await import('./analytics');
    const gtag = vi.fn();
    stubBrowser(gtag);

    const pending = trackValidCalculation(calculation);
    await vi.runAllTimersAsync();
    await expect(pending).resolves.toBe(false);
    (gtag.mock.calls[0][3] as (value: unknown) => void)(sessionId);
    expect(gtag.mock.calls.filter(([command]) => command === 'event')).toHaveLength(0);
  });
});

describe('issue #82 calculator journey analytics', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('records a compact session summary with recalculation count and result visibility', () => {
    const gtag = vi.fn();
    vi.stubGlobal('window', { gtag });

    trackAnalyticsEvent('calculator_session_summary', {
      tool_slug: 'sip-calculator-india',
      tool_category: 'Investments',
      calculations: 3,
      recalculations: 2,
      result_panel_viewed: true,
      engagement_time_msec: 18000,
    });

    expect(gtag).toHaveBeenCalledWith('event', 'calculator_session_summary', {
      tool_slug: 'sip-calculator-india',
      tool_category: 'Investments',
      calculations: 3,
      recalculations: 2,
      result_panel_viewed: true,
      engagement_time_msec: 18000,
    });
  });

  it('records abandonment before a calculation without PII', () => {
    const gtag = vi.fn();
    vi.stubGlobal('window', { gtag });

    trackAnalyticsEvent('calculator_abandoned', {
      tool_slug: 'income-tax-calculator-old-vs-new-regime-india',
      tool_category: 'Tax',
      engagement_time_msec: 3100,
      reason: 'pagehide',
    });

    const payload = gtag.mock.calls[0]?.[2] as Record<string, unknown>;
    expect(payload).not.toHaveProperty('salary');
    expect(payload).not.toHaveProperty('income');
    expect(payload).not.toHaveProperty('tax');
    expect(payload).not.toHaveProperty('email');
  });
});
