# Money guide discovery and AI visibility

The goal is qualified traffic and useful decisions, not a promised “top position” in an AI Overview. Google chooses when an Overview appears and which pages it cites. A public crawl can establish technical eligibility; only the site's Search Console account can establish Google's indexed/canonical state.

## Weekly public check

The Monday GitHub Actions job **Money guide public discovery audit** also runs after a successful production deployment. It requests all ten guides and four linked calculators. It checks HTTP status, self canonical, index/snippet directives, textual HTML, robots status and sitemap inclusion. Download its `money-guide-discovery` artifact to see failures. Run locally with:

```sh
node scripts/audit-money-guide-discovery.mjs --output=discovery.json
```

This audit does not prove indexing, an AI citation or Google's canonical choice. For each of the ten guide URLs, use **URL Inspection** in the verified `https://www.rupeekit.co.in/` or domain Search Console property, recording the chosen canonical, coverage/index verdict, last crawl and screenshot or export date. Fix a discovered issue; request indexing for important corrected pages where the UI offers it. Do not treat a `site:` search as an indexing report.

## Weekly measurement

Export **Generative AI performance (Search)** chart and Pages table for the same complete 7-day range. Export regular **Web Search** Pages and GA4 **Pages and screens** for that range. AI feature impressions include AI Overviews and AI Mode, without query or click breakdown. The question list in `data/ai-visibility-questions.json` is an editorial sample. Record actual observations (one row per question check, country/locale and device) in a copy of `data/ai-visibility-observations-template.csv`; write `yes` or `no`, an exact cited URL if present, and a note about the answer and source quality. Do not record an invented rank or “position 1.”

```sh
node scripts/ai-visibility-report.mjs --as-of 2026-09-30 \
  --gsc-ai-chart exports/ai-chart.csv --gsc-ai-pages exports/ai-pages.csv \
  --gsc-web-pages exports/web-pages.csv --ga4-pages exports/ga4-pages.csv \
  --observations exports/observations.csv
```

The script works with any subset of inputs and marks missing values `null`; it writes `automation/reports/ai-visibility/<as-of>/summary.json`. Chart totals are taken from the chart, not summed page rows. Page engagement is GA4's average seconds **per active user**, not time per pageview. Web clicks are not attributed to AI results. Compare the same week lengths and examine trends over several weeks after Google has crawled the new content.

## Editorial and source review

The new comparisons use dated lender or authority disclosures with a common *illustrative* model. A published range, a maximum fee and a lender's own KFS are different evidence. The ₹5 lakh loan and two salary structures are modelling choices, not applications or real payslips. Recheck lender pages when terms change; update the checked date and revision note only after verifying the linked text and recomputing numbers. Do not claim an external specialist signoff until a qualified person actually reviews the page and agrees to attribution.

Google guidance: [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features), [Generative AI performance report](https://support.google.com/webmasters/answer/16984139?hl=en). The existing general pipeline is documented in `docs/gsc-reporting-pipeline.md`.
