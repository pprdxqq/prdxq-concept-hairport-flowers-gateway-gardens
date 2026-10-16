import { existsSync, readFileSync } from 'node:fs';
const pages = ['index.html', 'damen.html', 'herren.html', 'blumen.html', 'kontakt.html', 'konzept.html'];
const failures = [];
for (const page of pages) {
  if (!existsSync(page)) { failures.push('Missing page: ' + page); continue; }
  const html = readFileSync(page, 'utf8');
  if (!/<meta\s+name="robots"\s+content="noindex, nofollow"/i.test(html)) failures.push(page + ': missing noindex metadata');
  if (!/<main\s+id="main"/i.test(html)) failures.push(page + ': missing main landmark');
  if (!/Unabhängiger Konzeptentwurf/.test(html)) failures.push(page + ': missing independent-concept disclosure');
  if (!/<title>[^<]+<\/title>/.test(html)) failures.push(page + ': missing page title');
  if (!/assets\/site\.css/.test(html) || !/assets\/site\.js/.test(html)) failures.push(page + ': missing local style or script');
  for (const [, href] of html.matchAll(/\bhref="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|#)/i.test(href)) continue;
    const file = href.split(/[?#]/)[0];
    if (file && !existsSync(file)) failures.push(page + ': broken local link ' + href);
  }
}
for (const asset of ['assets/site.css', 'assets/site.js', 'assets/mark.svg']) if (!existsSync(asset)) failures.push('Missing asset: ' + asset);
const css = readFileSync('assets/site.css', 'utf8');
if (/@import\s+url\(/i.test(css)) failures.push('CSS should not use remote imported assets');
if (!/@media\s*\(prefers-reduced-motion:\s*reduce\)/i.test(css)) failures.push('Missing reduced-motion support');
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log('Static checks passed: ' + pages.length + ' pages, links, assets, disclosure, metadata, and reduced-motion support.');
