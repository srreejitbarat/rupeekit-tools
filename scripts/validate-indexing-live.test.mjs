import { execFile } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { expect, it } from 'vitest';

const exec = promisify(execFile);
const validator = fileURLToPath(new URL('./validate-indexing-live.mjs', import.meta.url));
const site = 'https://example.invalid';
const page = `${site}/article`;
const sitemap = `<urlset><url><loc>${page}</loc></url></urlset>`;

async function validateWithLinkHeader(linkHeader) {
  const server = createServer((request, response) => {
    switch (request.url) {
      case '/sitemap.xml':
      case '/image-sitemap.xml':
        response.end(sitemap);
        break;
      case '/robots.txt':
        response.end(`Sitemap: ${site}/sitemap.xml\nSitemap: ${site}/image-sitemap.xml\n`);
        break;
      case '/article':
        response.setHeader('Content-Type', 'text/html');
        response.setHeader('Link', linkHeader);
        response.end(`<html><head><link rel="canonical" href="${page}"></head><body>Article</body></html>`);
        break;
      default:
        response.writeHead(404).end();
    }
  }).listen(0, '127.0.0.1');
  try {
    await once(server, 'listening');
    return await exec(process.execPath, [validator], {
      env: {
        ...process.env,
        INDEXING_CHECK_ORIGIN: `http://127.0.0.1:${server.address().port}`,
        NEXT_PUBLIC_SITE_URL: site,
      },
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

it('accepts a matching HTTP canonical and ignores a preload with quoted punctuation', async () => {
  const { stdout } = await validateWithLinkHeader(
    '</static/fonts/a,b.woff2>; rel=preload; title="Font, labels; rel=canonical", </article>; rel=canonical',
  );
  expect(stdout).toContain('1/1 sitemap pages passed');
});

it('rejects a conflicting HTTP canonical even when the HTML canonical is correct', async () => {
  await expect(validateWithLinkHeader([
    '</article>; rel=canonical',
    '<https://unrelated.invalid/>; ReL="alternate CaNoNiCaL"',
  ])).rejects.toMatchObject({
    code: 1,
    stderr: expect.stringContaining('conflicting HTTP Link canonical: https://unrelated.invalid/'),
  });
});
