// Runs after `vite build`: writes robots.txt and sitemap.xml into dist/.
// Set VITE_SITE_URL (e.g. https://www.yourhospital.ug) in the deployment
// environment so the sitemap uses absolute URLs, as search engines require.

import { writeFileSync, existsSync } from 'node:fs';
import { routes } from '../src/config/routes.js';

const dist = new URL('../dist/', import.meta.url);
if (!existsSync(dist)) {
  console.error('[seo] dist/ not found — run vite build first.');
  process.exit(1);
}

const site = (process.env.VITE_SITE_URL || '').replace(/\/$/, '');
const today = new Date().toISOString().slice(0, 10);

let robots = 'User-agent: *\nAllow: /\n';
if (site) {
  const urls = routes
    .map(
      (r) =>
        `  <url>\n    <loc>${site}${r.path === '/' ? '/' : r.path}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${r.priority}</priority>\n  </url>`,
    )
    .join('\n');
  writeFileSync(
    new URL('sitemap.xml', dist),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  );
  robots += `\nSitemap: ${site}/sitemap.xml\n`;
  console.log(`[seo] sitemap.xml written for ${site} (${routes.length} URLs)`);
} else {
  console.warn('[seo] VITE_SITE_URL is not set — skipped sitemap.xml. Set it once the domain is known.');
}
writeFileSync(new URL('robots.txt', dist), robots);
console.log('[seo] robots.txt written');
