import { readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'https://cruzgoldlaw.com';
const OUTPUT_DIR = join(process.cwd(), 'output');
const today = new Date().toISOString().split('T')[0];

const htmlFiles = readdirSync(OUTPUT_DIR)
  .filter(f => f.endsWith('.html'))
  .sort();

const urls = htmlFiles.map(file => {
  const isHome = file === 'index.html';
  const loc = isHome ? `${BASE_URL}/` : `${BASE_URL}/${file.replace('.html', '')}/`;
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <priority>${isHome ? '1.0' : '0.8'}</priority>
  </url>`;
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemapindex.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

writeFileSync(join(OUTPUT_DIR, 'sitemap.xml'), sitemap);
console.log(`Generated sitemap.xml with ${htmlFiles.length} URLs`);
