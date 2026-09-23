import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToBuffer } from '@react-pdf/renderer';
import { POST } from '../../app/api/pre-emi/report/route';
import { createDefaultPlan } from './engine';

vi.mock('@react-pdf/renderer', () => ({ renderToBuffer: vi.fn() }));
vi.mock('@/components/pre-emi/PreEmiReport', () => ({ default: () => null }));

const pdf = Buffer.from('%PDF-1.3\nreport');
const request = (input: unknown = createDefaultPlan()) => new Request('https://www.rupeekit.co.in/api/pre-emi/report', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ version: 1, mode: 'pre-emi', input }),
});
beforeEach(() => { vi.clearAllMocks(); vi.mocked(renderToBuffer).mockResolvedValue(pdf); });

describe('Node PDF endpoint', () => {
  it('returns a private PDF and rejects bad inputs before invoking the renderer', async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/pdf');
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(Buffer.from(await response.arrayBuffer()).toString()).toContain('%PDF-');
    const invalid = await POST(request({}));
    expect(invalid.status).toBe(400);
    expect(renderToBuffer).toHaveBeenCalledTimes(1);
  });
  it('limits simultaneous PDF renders and releases capacity when one completes', async () => {
    const releases: Array<(value: Buffer) => void> = [];
    vi.mocked(renderToBuffer).mockImplementation(() => new Promise<Buffer>(resolve => releases.push(resolve)));
    const first = POST(request());
    const second = POST(request());
    try {
      await vi.waitFor(() => expect(releases).toHaveLength(2));
      const busy = await POST(request());
      expect(busy.status).toBe(503);
      expect(busy.headers.get('retry-after')).toBe('5');
      releases[0](pdf);
      expect((await first).status).toBe(200);
      vi.mocked(renderToBuffer).mockResolvedValueOnce(pdf);
      expect((await POST(request())).status).toBe(200);
    } finally {
      releases.forEach(release => release(pdf));
      await Promise.all([first, second]);
    }
  });
});
