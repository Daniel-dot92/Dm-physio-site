const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://www.dmphysi0.com/';

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function text(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function matches(html, expression) {
  return Array.from(html.matchAll(expression));
}

function one(html, expression) {
  const match = html.match(expression);
  return match ? text(match[1]) : '';
}

function jsonLd(html, type) {
  for (const match of html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const value = JSON.parse(match[1].trim());
      if (value && value['@type'] === type) return value;
    } catch (_) {}
  }
  return null;
}

function localPath(url) {
  try {
    const parsed = new URL(url, SITE);
    if (parsed.hostname !== 'www.dmphysi0.com') return null;
    return path.join(ROOT, ...decodeURIComponent(parsed.pathname).split('/').filter(Boolean));
  } catch (_) {
    return null;
  }
}

const sitemap = read(path.join(ROOT, 'video-sitemap.xml'));
const urls = Array.from(sitemap.matchAll(/<loc>(https:\/\/www\.dmphysi0\.com\/((?:en\/)?videos\/[^<]+))<\/loc>/g), m => ({ url: m[1], relative: m[2] }));
const issues = [];
const warnings = [];
const summaries = new Map();
const titles = new Map();

function issue(file, kind, detail) {
  issues.push({ file, kind, detail });
}

function warning(file, kind, detail) {
  warnings.push({ file, kind, detail });
}

for (const entry of urls) {
  const relative = decodeURIComponent(entry.relative);
  const file = path.join(ROOT, ...relative.split('/'));
  if (!fs.existsSync(file)) {
    issue(relative, 'missing-file', entry.url);
    continue;
  }

  const html = read(file);
  const isEnglish = relative.startsWith('en/');
  const title = one(html, /<title>([\s\S]*?)<\/title>/i);
  const h1s = matches(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi).map(m => text(m[1]));
  const description = one(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  const canonical = one(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  const robots = one(html, /<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
  const videos = matches(html, /<video\b[\s\S]*?<\/video>/gi);
  const summary = one(html, /<p\s+class=["']watch-focus__intro["'][^>]*>([\s\S]*?)<\/p>/i);
  const contextBlocks = matches(html, /<(?:article|aside)\b[^>]*>[\s\S]*?<h2\b[^>]*>([\s\S]*?)<\/h2>[\s\S]*?<p\b[^>]*>([\s\S]*?)<\/p>[\s\S]*?<\/(?:article|aside)>/gi);
  const schema = jsonLd(html, 'VideoObject');

  if (!html.includes('video-watch-page--focus')) issue(relative, 'layout', 'missing focus layout class');
  if (!html.includes('/css/video-watch.css?v=20260824-watch-focus')) issue(relative, 'stylesheet', 'unexpected stylesheet version');
  if (!/<nav\s+class=["']site-breadcrumb["']/i.test(html)) issue(relative, 'breadcrumb', 'missing breadcrumb');
  if (h1s.length !== 1 || !h1s[0]) issue(relative, 'h1', 'expected one non-empty H1, found ' + h1s.length);
  if (videos.length !== 1) issue(relative, 'video-count', 'expected one video, found ' + videos.length);
  if (contextBlocks.length !== 2) issue(relative, 'context', 'expected two information blocks, found ' + contextBlocks.length);
  if (!summary || summary.length < 35 || summary.length > 245) issue(relative, 'summary-length', String(summary.length));
  if (!title) issue(relative, 'title', 'missing');
  else if (title.length > 70) warning(relative, 'long-title', String(title.length));
  if (!description || description.length < 60 || description.length > 180) issue(relative, 'description-length', String(description.length));
  if (canonical !== entry.url) issue(relative, 'canonical', canonical || 'missing');
  if (!/index\s*,\s*follow/i.test(robots)) issue(relative, 'robots', robots || 'missing');
  if (!/<div\s+class=["']actions["'][^>]*>[\s\S]*?<a\b/i.test(html)) issue(relative, 'related-cta', 'missing related-page link');
  if (!/<video\b[^>]*\baria-describedby=["']video-summary["']/i.test(html)) issue(relative, 'video-accessibility', 'missing aria-describedby');

  if (!schema) {
    issue(relative, 'video-schema', 'missing VideoObject');
  } else {
    for (const property of ['name', 'description', 'thumbnailUrl', 'uploadDate', 'contentUrl', 'duration', 'url', 'mainEntityOfPage', 'inLanguage']) {
      if (!schema[property]) issue(relative, 'video-schema-' + property, 'missing');
    }
    const mainEntityUrl = typeof schema.mainEntityOfPage === 'string'
      ? schema.mainEntityOfPage
      : schema.mainEntityOfPage && (schema.mainEntityOfPage['@id'] || schema.mainEntityOfPage.url);
    if (schema.url !== entry.url || mainEntityUrl !== entry.url) issue(relative, 'video-schema-url', 'not self-referencing');
    for (const property of ['thumbnailUrl', 'contentUrl']) {
      const resource = Array.isArray(schema[property]) ? schema[property][0] : schema[property];
      const local = localPath(resource);
      if (local && !fs.existsSync(local)) issue(relative, 'missing-' + property, schema[property]);
      if (property === 'thumbnailUrl' && !/\.(?:avif|gif|jpe?g|png|webp)(?:\?|$)/i.test(String(resource || ''))) {
        issue(relative, 'invalid-thumbnailUrl', String(resource || 'missing'));
      }
    }
  }

  if (/(гарантираме|100%|ще изчезне|излекуван[иа]? пациент|guaranteed cure|pain will disappear)/i.test(html)) {
    issue(relative, 'medical-claim', 'potentially unsafe promise');
  }

  const letters = summary.replace(/[^A-Za-zА-Яа-я]/g, '');
  if (letters) {
    const cyrillic = (letters.match(/[А-Яа-я]/g) || []).length / letters.length;
    if (isEnglish && cyrillic > 0.2) issue(relative, 'language', 'English summary is mostly Cyrillic');
    if (!isEnglish && cyrillic < 0.2) issue(relative, 'language', 'Bulgarian summary is mostly Latin');
  }

  titles.set(title, (titles.get(title) || []).concat(relative));
  summaries.set(summary, (summaries.get(summary) || []).concat(relative));
}

for (const [value, files] of titles) {
  if (value && files.length > 1) files.forEach(file => warning(file, 'duplicate-title', value));
}
for (const [value, files] of summaries) {
  if (value && files.length > 2) files.forEach(file => warning(file, 'duplicate-summary', value));
}

const kinds = issues.reduce((all, current) => {
  all[current.kind] = (all[current.kind] || 0) + 1;
  return all;
}, {});
const warningKinds = warnings.reduce((all, current) => {
  all[current.kind] = (all[current.kind] || 0) + 1;
  return all;
}, {});

console.log(JSON.stringify({
  pages: urls.length,
  issueCount: issues.length,
  kinds,
  warningCount: warnings.length,
  warningKinds,
  issues: issues.slice(0, 200),
  warningExamples: warnings.slice(0, 30)
}, null, 2));
if (issues.length) process.exitCode = 1;
