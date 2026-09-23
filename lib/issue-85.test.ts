import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function read(path: string) {
  return readFileSync(path, 'utf8');
}

describe('issue #85 owned update channel', () => {
  it('uses provider-side double opt-in and keeps the API key server-only', () => {
    const route = read('app/api/updates/subscribe/route.ts');
    const env = read('.env.example');

    expect(route).toContain("type: 'unactivated'");
    expect(route).toContain('process.env.BUTTONDOWN_API_KEY');
    expect(route).not.toContain('NEXT_PUBLIC_BUTTONDOWN');
    expect(env).toContain('BUTTONDOWN_API_KEY=""');
    expect(env).not.toContain('NEXT_PUBLIC_BUTTONDOWN_API_KEY');
  });

  it('does not send email or calculator values to analytics', () => {
    const signup = read('components/updates/FinancialUpdatesSignup.tsx');
    const analytics = read('lib/analytics.ts');

    expect(analytics).toContain('newsletter_form_viewed');
    expect(analytics).toContain('newsletter_form_submitted');
    expect(analytics).toContain('newsletter_confirmed');
    expect(analytics).not.toMatch(/email_address|email:/);
    expect(signup).not.toMatch(/trackAnalyticsEvent\([^)]*email/);
  });

  it('shows capture only on high-intent calculator results and financial update pages', () => {
    const boundary = read('components/CalculatorAnalyticsBoundary.tsx');
    const updatePage = read('components/updates/OfficialFinancialUpdatePage.tsx');

    expect(boundary).toContain('UPDATE_ALERT_TOOL_SLUGS');
    expect(boundary).toContain("placement=\"calculator_result\"");
    expect(boundary).toContain('hasInteracted && UPDATE_ALERT_TOOL_SLUGS.has(toolSlug)');
    expect(updatePage).toContain("placement=\"financial_update\"");
  });

  it('keeps privacy and unsubscribe language visible', () => {
    const privacy = read('app/(en)/privacy-policy/page.tsx');
    const signup = read('components/updates/FinancialUpdatesSignup.tsx');
    const confirmed = read('app/(en)/updates/confirmed/page.tsx');

    expect(privacy).toContain('double opt-in');
    expect(privacy).toContain('Buttondown');
    expect(privacy).toContain('delete your subscription data');
    expect(signup).toContain('You can unsubscribe from every email');
    expect(confirmed).toContain('manage or unsubscribe');
  });
});
