const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://www.dmphysi0.com';
const SITEMAPS = ['sitemap.xml', 'sitemap-en.xml'];
const FALLBACK_IMAGE = '/logo.webp';
const DEFAULT_RESULT_IMAGE = '/pngs/pain-conditions/new/backpain-Thumbnail.webp';

const exercisePaths = new Set([
  '/uprazhnenia.html',
  '/biblioteka-uprazhnenia.html',
  '/simptomi.html',
  '/diagnozi.html',
  '/zoni.html',
  '/celi.html',
  '/sesii.html',
  '/programi.html',
  '/trenirovki.html',
  '/individualna-programa.html',
  '/uprazhnenie.html',
  '/trenirovka.html',
  '/programa.html'
]);

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<header[\s\S]*?<\/header>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function attr(html, name) {
  const re = new RegExp('<meta[^>]+(?:name|property)=["\\\']' + name.replace(':', '[:]?') + '["\\\'][^>]+content=["\\\']([^"\\\']+)["\\\']', 'i');
  const match = html.match(re);
  return match ? match[1].trim() : '';
}

function firstMatch(html, re) {
  const match = html.match(re);
  return match ? stripTags(match[1]).trim() : '';
}

function makeAbsoluteImage(src) {
  if (!src) return FALLBACK_IMAGE;
  if (/^https?:\/\//i.test(src)) return src.replace(SITE_URL, '');
  return src.startsWith('/') ? src : '/' + src.replace(/^(\.\.\/)+/, '');
}

function localAssetExists(src) {
  const local = makeAbsoluteImage(src);
  if (!local || /^https?:\/\//i.test(local)) return true;
  try {
    return fs.existsSync(path.join(ROOT, decodeURIComponent(local).replace(/^\//, '')));
  } catch (_) {
    return false;
  }
}

function isUsefulImage(src) {
  const local = makeAbsoluteImage(src).toLowerCase();
  if (!local || local === FALLBACK_IMAGE) return false;
  if (/(^|\/)(?:logo|favicon|apple-touch-icon)(?:\.|$)/i.test(local)) return false;
  if (/\/pngs\/social\//i.test(local)) return false;
  if (/embedsocial-logo/i.test(local)) return false;
  if (/\/(?:facebook|instagram|youtube|tiktok|phone|clock|location)\./i.test(local)) return false;
  return localAssetExists(src);
}

function uniqueImages(images) {
  const seen = new Set();
  const useful = [];
  for (const src of images) {
    const image = makeAbsoluteImage(src);
    const key = image.toLowerCase();
    if (!isUsefulImage(image) || seen.has(key)) continue;
    seen.add(key);
    useful.push(image);
  }
  if (!useful.length && localAssetExists(DEFAULT_RESULT_IMAGE)) useful.push(DEFAULT_RESULT_IMAGE);
  return useful.slice(0, 8);
}

function urlToLocalPath(url) {
  const parsed = new URL(url);
  let pathname = decodeURIComponent(parsed.pathname);
  if (pathname === '/') pathname = '/index.html';
  if (pathname === '/en/') pathname = '/en/index.html';
  if (pathname === '/book') return null;
  return pathname.replace(/^\//, '').replace(/\//g, path.sep);
}

function pageType(pathname) {
  if (pathname.includes('/procedures/') || pathname.endsWith('/kinesitherapy.html') || pathname.endsWith('/massages.html') || pathname.endsWith('/services.html')) return 'procedure';
  if (pathname.includes('/sustiqnia/') || pathname.startsWith('/pain-')) return 'condition';
  if (pathname.includes('/videos/')) return 'video';
  if (pathname.endsWith('/contacts.html')) return 'contact';
  if (pathname === '/' || pathname.endsWith('/index.html')) return 'page';
  return 'page';
}

function shouldExclude(url) {
  const pathname = new URL(url).pathname;
  if (pathname.startsWith('/videos/')) return true;
  if (pathname.startsWith('/en/videos/')) return true;
  if (pathname.startsWith('/procedures/online-')) return true;
  if (pathname.startsWith('/en/procedures/online-')) return true;
  if (pathname === '/online-recovery.html' || pathname === '/en/online-recovery.html') return true;
  if (pathname.startsWith('/_next/') || pathname.includes('/node_modules/')) return true;
  if (exercisePaths.has(pathname)) return true;
  if (pathname.startsWith('/en/') && exercisePaths.has(pathname.slice(3))) return true;
  return false;
}

function urlsFromSitemap(file) {
  if (!fs.existsSync(path.join(ROOT, file))) return [];
  const xml = read(file);
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1].trim());
}

function htmlUrlsFromFiles() {
  const urls = [];
  const blockedDirs = new Set(['.git', 'backup-before-seo-fixes', 'backups', 'node_modules', 'videos']);
  const blockedFiles = new Set([
    'about.html',
    'footer-preview.html',
    'index-home-demo.html',
    'online-questionnaire.html',
    'online-recovery.html'
  ]);

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(ROOT, full).replace(/\\/g, '/');
      const parts = rel.split('/');
      if (entry.isDirectory()) {
        if (blockedDirs.has(entry.name)) continue;
        if (parts.includes('videos')) continue;
        walk(full);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
      if (blockedFiles.has(entry.name)) continue;
      if (parts.includes('videos')) continue;
      if (parts.some((part) => part.startsWith('backup'))) continue;

      const pathname = '/' + rel;
      if (shouldExclude(SITE_URL + pathname)) continue;
      urls.push(SITE_URL + (pathname === '/index.html' ? '/' : pathname));
    }
  }

  walk(ROOT);
  return urls;
}

function buildPage(url) {
  const parsed = new URL(url);
  const local = urlToLocalPath(url);
  const locale = parsed.pathname.startsWith('/en/') ? 'en' : 'bg';

  if (url.endsWith('/book')) {
    return {
      title: locale === 'en' ? 'Book an appointment' : '\u0421\u0432\u043e\u0431\u043e\u0434\u043d\u0438 \u0447\u0430\u0441\u043e\u0432\u0435',
      url: '/book',
      excerpt: locale === 'en' ? 'Choose an available appointment time for DM Physio.' : '\u0418\u0437\u0431\u0435\u0440\u0438 \u0441\u0432\u043e\u0431\u043e\u0434\u0435\u043d \u0447\u0430\u0441 \u0437\u0430 \u043f\u043e\u0441\u0435\u0449\u0435\u043d\u0438\u0435 \u0432 DM Physio.',
      thumbnail: DEFAULT_RESULT_IMAGE,
      images: [DEFAULT_RESULT_IMAGE],
      locale,
      type: 'booking',
      tags: locale === 'en' ? 'book,appointment,physiotherapy,sofia' : '\u0437\u0430\u043f\u0430\u0437\u0438 \u0447\u0430\u0441,\u0441\u0432\u043e\u0431\u043e\u0434\u043d\u0438 \u0447\u0430\u0441\u043e\u0432\u0435,\u043a\u0438\u043d\u0435\u0437\u0438\u0442\u0435\u0440\u0430\u043f\u0438\u044f,\u0441\u043e\u0444\u0438\u044f'
    };
  }

  if (!local) return null;
  const filePath = path.join(ROOT, local);
  if (!fs.existsSync(filePath)) return null;
  const html = fs.readFileSync(filePath, 'utf8');
  if (/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)) return null;

  const main = (html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i) || [null, html])[1];
  const title = stripTags((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [null, ''])[1]) ||
    firstMatch(main, /<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
    parsed.pathname;
  const excerpt = attr(html, 'description') || stripTags(main).slice(0, 180);
  const ogImage = attr(html, 'og:image');
  const firstImg = (main.match(/<img[^>]+src=["']([^"']+)["']/i) || [null, ''])[1];
  const pageImages = uniqueImages([
    ogImage,
    ...Array.from(main.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)).map((match) => match[1])
  ]);
  const thumbnail = pageImages[0] || makeAbsoluteImage(isUsefulImage(firstImg) ? firstImg : DEFAULT_RESULT_IMAGE);
  const type = pageType(parsed.pathname);
  const bodyText = stripTags(main).slice(0, 5000);

  return {
    title,
    url: parsed.pathname === '/index.html' ? '/' : parsed.pathname,
    excerpt,
    thumbnail,
    images: pageImages,
    locale,
    type,
    tags: [type, locale].join(','),
    text: [title, excerpt, bodyText].join(' ')
  };
}

const seen = new Set();
const pages = [];

for (const sitemap of SITEMAPS) {
  for (const url of urlsFromSitemap(sitemap)) {
    if (!url.startsWith(SITE_URL)) continue;
    if (shouldExclude(url)) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    const page = buildPage(url);
    if (page) pages.push(page);
  }
}

for (const url of htmlUrlsFromFiles()) {
  if (!url.startsWith(SITE_URL)) continue;
  if (shouldExclude(url)) continue;
  if (seen.has(url)) continue;
  seen.add(url);
  const page = buildPage(url);
  if (page) pages.push(page);
}

const uniquePages = [];
const emittedUrls = new Set();
for (const page of pages) {
  if (emittedUrls.has(page.url)) continue;
  emittedUrls.add(page.url);
  uniquePages.push(page);
}

uniquePages.sort((a, b) => a.locale.localeCompare(b.locale) || a.type.localeCompare(b.type) || a.title.localeCompare(b.title));

fs.writeFileSync(
  path.join(ROOT, 'search-index.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), pages: uniquePages }, null, 2),
  'utf8'
);

console.log('Search index pages:', uniquePages.length);
