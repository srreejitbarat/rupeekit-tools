# Hindi and Bengali catalog in the browser

The full translation catalogs (`lib/i18n/catalogs/hi.json`, `bn.json`, about
4–5 MB each) are only used on the server. Shipping them to the browser added
about 1.1–1.2 MB (gzip) of JavaScript to every Hindi and Bengali page.

## How strings reach the browser

- `package.json` `imports` maps `#i18n-catalog/<lang>` to the full catalog under
  the `react-server` condition (server components, route handlers, metadata
  routes) and to a small generated base catalog everywhere else (SSR of client
  components and the browser).
- `scripts/i18n/generate.mjs` writes one slice per source file to
  `lib/i18n/slices/<lang>/`. Every localized module that can run in the browser
  imports the slices for its own file and for the non-localized modules (data,
  lib) it imports, and registers them with `__i18n.add(...)`.
- When a server module renders a client component, the generator wraps it in
  `<__i18n.Scope>`. On the server this collects translations for the element's
  props and passes them to `lib/i18n/client-scope.tsx`, which registers them
  before the child renders during SSR and hydration.

Slices, the base catalogs and `sources.json` are generated and git-ignored.

## Safety net

SSR of client components uses the same restricted catalog as the browser, so a
string the browser cannot translate also renders in English in the prerendered
HTML, and `validate:languages-rendered` fails the build. Content that renders
only in the browser (for example behind `useSearchParams`) is not covered by
that check; test such pages in a browser after changing them.
