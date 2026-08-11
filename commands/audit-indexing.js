const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://www.dmphysi0.com';
const SKIP = new Set(['.git', '.next', '.vercel', '.codex-audit', '.codex-deploy-clean', 'backups', 'backup-before-seo-fixes', 'node_modules', 'pngs']);
const issues = [];
const counts = {};

function read(file) { return fs.readFileSync(file, 'utf8'); }
function rel(file) { return path.relative(ROOT, file).replace(/\\/g, '/'); }
function add(kind, file, detail) { issues.push({ kind, file: rel(file), detail }); }
function walk(dir, extension, output = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file, extension, output);
    else if (entry.isFile() && (!extension || entry.name.endsWith(extension))) output.push(file);
  }
  return output;
}
function first(text, re) { const match = text.match(re); return match ? match[1].trim() : ''; }
function jsonLd(html, file) {
  const objects = [];
  for (const match of html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { objects.push(JSON.parse(match[1].trim())); }
    catch (error) { add('invalid-json-ld', file, error.message); }
  }
  return objects;
}
function sitemapLocs(name) {
  const file = path.join(ROOT, name);
  return [...read(file).matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => match[1].replace(/&amp;/g, '&'));
}
function localPath(url, base = SITE) {
  try {
    const parsed = new URL(url, base);
    return parsed.origin === SITE ? decodeURIComponent(parsed.pathname) : '';
  } catch (_) { return ''; }
}
function targetFile(urlPath) {
  if (urlPath === '/') return path.join(ROOT, 'index.html');
  if (urlPath.endsWith('/')) return path.join(ROOT, urlPath.slice(1), 'index.html');
  return path.join(ROOT, urlPath.slice(1));
}

const vercelFile = path.join(ROOT, 'vercel.json');
const vercel = JSON.parse(read(vercelFile));
const redirects = new Map();
for (const redirect of vercel.redirects || []) {
  if (redirects.has(redirect.source)) add('duplicate-redirect-source', vercelFile, redirect.source);
  redirects.set(redirect.source, redirect.destination);
}
for (const [source, destination] of redirects) {
  if (source === destination) add('redirect-loop', vercelFile, source);
  if (redirects.has(destination)) add('redirect-chain', vercelFile, source + ' -> ' + destination + ' -> ' + redirects.get(destination));
}

const htmlFiles = walk(ROOT, '.html');
const htmlByPath = new Map();
for (const file of htmlFiles) {
  const pagePath = '/' + rel(file);
  htmlByPath.set(pagePath, file);
  if (pagePath.endsWith('/index.html')) htmlByPath.set(pagePath.slice(0, -10), file);
  if (pagePath === '/index.html') htmlByPath.set('/', file);
}
const videoFiles = htmlFiles.filter((file) => /^(?:en\/)?videos\//.test(rel(file)));
const videoRedirects = new Map([...redirects].filter(([source]) => /^\/(?:en\/)?videos\//.test(source)));
const videoSitemap = new Set(sitemapLocs('video-sitemap.xml'));
const prioritySitemaps = ['sitemap.xml', 'sitemap-en.xml'];

counts.htmlFiles = htmlFiles.length;
counts.videoPages = videoFiles.length;
counts.videoRedirects = videoRedirects.size;
counts.primaryVideoPages = videoFiles.length - videoRedirects.size;
counts.videoSitemapEntries = videoSitemap.size;

for (const file of videoFiles) {
  const relative = rel(file);
  const pagePath = '/' + relative;
  const self = SITE + pagePath;
  const destination = videoRedirects.get(pagePath);
  const expected = destination ? SITE + destination : self;
  const html = read(file);
  const canonical = first(html, /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*\bhref=["']([^"']+)["']/i);
  const objects = jsonLd(html, file);
  const videos = objects.filter((item) => item && item['@type'] === 'VideoObject');
  const alternates = [...html.matchAll(/<link\b(?=[^>]*\brel=["']alternate["'])[^>]*\bhref=["']([^"']+)["']/gi)].map((match) => match[1]);
  if (canonical !== expected) add('video-canonical', file, canonical + ' expected ' + expected);
  if (videos.length !== 1) add('video-object-count', file, String(videos.length));
  if (videos.length === 1) {
    const video = videos[0];
    for (const key of ['name', 'description', 'thumbnailUrl', 'uploadDate', 'duration', 'contentUrl', 'url', 'mainEntityOfPage', 'inLanguage', 'publisher']) {
      if (!video[key] || (Array.isArray(video[key]) && !video[key].length)) add('video-object-field', file, key);
    }
    if (video.url !== expected) add('video-object-url', file, String(video.url));
    const mediaPath = localPath(video.contentUrl);
    if (!mediaPath || !fs.existsSync(targetFile(mediaPath))) add('missing-video-file', file, String(video.contentUrl));
    const thumbnails = Array.isArray(video.thumbnailUrl) ? video.thumbnailUrl : [video.thumbnailUrl];
    for (const thumbnail of thumbnails.filter(Boolean)) {
      const thumbnailPath = localPath(thumbnail);
      if (!thumbnailPath || !fs.existsSync(targetFile(thumbnailPath))) add('missing-thumbnail', file, String(thumbnail));
    }
  }
  for (const alternate of alternates) {
    const alternatePath = localPath(alternate);
    if (videoRedirects.has(alternatePath)) add('hreflang-to-redirect', file, alternate);
  }
  if (destination && videoSitemap.has(self)) add('redirected-video-in-sitemap', file, self);
  if (!destination && !videoSitemap.has(self)) add('primary-video-missing-sitemap', file, self);
}

for (const loc of videoSitemap) {
  const pagePath = localPath(loc);
  if (!htmlByPath.has(pagePath)) add('video-sitemap-missing-page', path.join(ROOT, 'video-sitemap.xml'), loc);
  if (videoRedirects.has(pagePath)) add('video-sitemap-redirect', path.join(ROOT, 'video-sitemap.xml'), loc);
}

for (const sitemapName of prioritySitemaps) {
  const file = path.join(ROOT, sitemapName);
  const locs = sitemapLocs(sitemapName);
  counts[sitemapName] = locs.length;
  for (const loc of locs) {
    const pagePath = localPath(loc);
    if (/^\/(?:en\/)?videos\//.test(pagePath)) add('video-in-priority-sitemap', file, loc);
    if (redirects.has(pagePath)) add('redirect-in-priority-sitemap', file, loc);
    if (pagePath === '/book' || pagePath === '/en/book') continue;
    const page = htmlByPath.get(pagePath);
    if (!page) { add('sitemap-missing-page', file, loc); continue; }
    const canonical = first(read(page), /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*\bhref=["']([^"']+)["']/i);
    if (canonical !== loc) add('sitemap-canonical-mismatch', page, canonical + ' expected ' + loc);
  }
}

let hrefsChecked = 0;
let healthPagesChecked = 0;
for (const file of htmlFiles) {
  const html = read(file);
  const relative = rel(file);
  if (/https:\/\/dmphysi0\.com(?:[\/'"])/i.test(html)) add('non-www-absolute-url', file, 'https://dmphysi0.com');
  if (/\/(?:node_modules\/playwright-core|_next\/static\/media)\//i.test(html)) add('stale-crawl-path', file, 'node_modules or old _next media URL');
  if (/^(?:en\/)?sustiqnia\//.test(relative)) {
    healthPagesChecked += 1;
    const canonical = first(html, /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*\bhref=["']([^"']+)["']/i);
    const objects = jsonLd(html, file);
    const pageObjects = objects.flatMap((item) => item && Array.isArray(item['@graph']) ? item['@graph'] : [item])
      .filter((item) => item && ['MedicalWebPage', 'WebPage'].includes(item['@type']));
    if (!/class=["'][^"']*health-author\b/i.test(html)) add('missing-health-author-block', file, 'visible author block');
    if (!/health-author\.css/i.test(html)) add('missing-health-author-style', file, 'health-author.css');
    if (!/<meta\b(?=[^>]*\bname=["']author["'])[^>]*\bcontent=["'](?:Даниел Митев|Daniel Mitev)["']/i.test(html)) add('health-meta-author', file, 'Daniel Mitev');
    if (!pageObjects.length) add('missing-health-page-schema', file, 'MedicalWebPage or WebPage');
    for (const object of pageObjects) {
      if (object.url !== canonical) add('health-schema-url', file, String(object.url) + ' expected ' + canonical);
      if (!object.datePublished || !object.dateModified) add('health-schema-date', file, 'datePublished/dateModified');
      if (!object.author || object.author['@type'] !== 'Person' || !object.author.url) add('health-schema-author', file, 'Person with profile URL');
    }
  }
  for (const match of html.matchAll(/\bhref=["']([^"'#]+)(?:#[^"']*)?["']/gi)) {
    const href = match[1];
    const pageUrl = SITE + '/' + rel(file);
    const pagePath = localPath(href, pageUrl);
    if (!pagePath) continue;
    hrefsChecked += 1;
    if (videoRedirects.has(pagePath)) add('internal-link-to-video-redirect', file, pagePath);
    if (!pagePath.endsWith('.html')) continue;
    if (redirects.has(pagePath) || htmlByPath.has(pagePath)) continue;
    add('broken-html-link', file, href);
  }
}
counts.internalHrefsChecked = hrefsChecked;
counts.healthPagesChecked = healthPagesChecked;

const kinds = issues.reduce((result, issue) => {
  result[issue.kind] = (result[issue.kind] || 0) + 1;
  return result;
}, {});
console.log(JSON.stringify({ counts, issueCount: issues.length, kinds, issues: issues.slice(0, 250) }, null, 2));
process.exitCode = issues.length ? 1 : 0;
