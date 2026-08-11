const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://www.dmphysi0.com';
const VIDEO_DIRS = ['videos', 'en/videos'];
const IGNORED_DIRS = new Set([
  '.git', '.next', '.vercel', '.codex-audit', 'backups',
  'backup-before-seo-fixes', 'node_modules'
]);

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, contents) {
  fs.writeFileSync(file, contents, 'utf8');
}

function walkHtml(directory, output) {
  const files = output || [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walkHtml(file, files);
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(file);
  }
  return files;
}

function first(html, expression) {
  const match = html.match(expression);
  return match ? match[1].trim() : '';
}

function absolute(value) {
  try {
    return new URL(value, SITE_URL).href;
  } catch (_) {
    return '';
  }
}

function cleanText(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function jsonLdObjects(html) {
  const objects = [];
  for (const match of html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      objects.push(JSON.parse(match[1].trim()));
    } catch (_) {
      // Invalid legacy JSON-LD is preserved and reported by the audit.
    }
  }
  return objects;
}

function recordFor(file) {
  const html = read(file);
  const relative = path.relative(ROOT, file).replace(/\\/g, '/');
  const locale = relative.startsWith('en/') ? 'en' : 'bg';
  const video = (html.match(/<video\b[\s\S]*?<\/video>/i) || [''])[0];
  const source = absolute(first(video, /<source\b[^>]*\bsrc=["']([^"']+)["']/i));
  const poster = absolute(first(video, /\bposter=["']([^"']+)["']/i));
  const actionHref = first(html, /<div\s+class=["']actions["']>[\s\S]*?<a[^>]+href=["']([^"']+)["']/i);
  const h1 = cleanText(first(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i));
  const description = first(html, /<meta\b(?=[^>]*\bname=["']description["'])[^>]*\bcontent=["']([^"']*)["']/i);
  const lead = cleanText(first(html, /<p\s+class=["'][^"']*\blead\b[^"']*["'][^>]*>([\s\S]*?)<\/p>/i));
  const durationText = cleanText(html).match(locale === 'bg'
    ? /Продължителност:\s*(\d+)\s*секунди?/i
    : /Duration:\s*(\d+)\s*seconds?/i);
  const existingVideoObject = jsonLdObjects(html).find((item) => item && item['@type'] === 'VideoObject') || {};
  if (!source) throw new Error('Missing video source: ' + relative);
  return {
    file,
    html,
    relative,
    urlPath: '/' + relative,
    canonical: SITE_URL + '/' + relative,
    locale,
    source,
    poster,
    actionHref,
    h1,
    description,
    lead,
    duration: existingVideoObject.duration || (durationText ? 'PT' + durationText[1] + 'S' : 'PT1S')
  };
}

function score(record) {
  const mediaPath = new URL(record.source).pathname.toLowerCase();
  const parent = record.actionHref.toLowerCase();
  const relative = record.relative.toLowerCase();
  let value = 0;

  if (mediaPath.includes('/muscles/') && /(?:muskuli|muscles)/.test(parent)) value += 500;
  if (/(?:nerv|dermatom)/.test(mediaPath) && /(?:nevralg|neuralg|nerv)/.test(parent)) value += 450;
  if (mediaPath.includes('/procedures/') && /procedures/.test(parent)) value += 450;
  if (/(?:luxation|dislocation)/.test(mediaPath) && /(?:luxation|dislocation)/.test(parent)) value += 300;
  if (/sciatic|piriform/.test(mediaPath) && /(?:sciatic|piriform)/.test(parent)) value += 300;
  if (/disc|disk|hernia/.test(mediaPath) && /(?:disc|disk|hernia)/.test(parent)) value += 250;
  if (/muskuli|muscles/.test(relative)) value += 40;
  if (/procedures-online/.test(relative)) value -= 100;
  value += Math.max(0, 100 - relative.length / 2);
  return value;
}

function best(records) {
  return records.slice().sort((a, b) => {
    const difference = score(b) - score(a);
    return difference || a.relative.length - b.relative.length || a.relative.localeCompare(b.relative);
  })[0];
}

function replaceCanonical(html, canonical) {
  const expression = /(<link\b(?=[^>]*\brel=["']canonical["'])[^>]*\bhref=["'])[^"']*(["'][^>]*>)/i;
  if (expression.test(html)) return html.replace(expression, '$1' + canonical + '$2');
  return html.replace('</head>', '  <link rel="canonical" href="' + canonical + '" />\n</head>');
}

function replaceMeta(html, property, value) {
  const expression = new RegExp('(<meta\\b(?=[^>]*\\bproperty=["\']' + property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '["\'])[^>]*\\bcontent=["\'])[^"\']*(["\'][^>]*>)', 'i');
  return expression.test(html) ? html.replace(expression, '$1' + value + '$2') : html;
}

function replaceAlternates(html, bgCanonical, enCanonical) {
  const without = html.replace(/\s*<link\b(?=[^>]*\brel=["']alternate["'])[^>]*>\s*/gi, '');
  if (!bgCanonical || !enCanonical) return without.replace(/\s*<\/head>/i, '\n</head>');
  const links = [
    '  <link rel="alternate" hreflang="bg-BG" href="' + bgCanonical + '" />',
    '  <link rel="alternate" hreflang="en" href="' + enCanonical + '" />',
    '  <link rel="alternate" hreflang="x-default" href="' + bgCanonical + '" />'
  ].join('\n');
  return without.replace(/\s*<\/head>/i, '\n' + links + '\n</head>');
}

function replaceJsonLdUrls(html, canonical) {
  return html.replace(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi, (whole, raw) => {
    let data;
    try {
      data = JSON.parse(raw.trim());
    } catch (_) {
      return whole;
    }
    if (data && data['@type'] === 'VideoObject') {
      data['@id'] = canonical + '#video';
      data.url = canonical;
      data.mainEntityOfPage = { '@type': 'WebPage', '@id': canonical };
    }
    if (data && data['@type'] === 'BreadcrumbList' && Array.isArray(data.itemListElement) && data.itemListElement.length) {
      data.itemListElement[data.itemListElement.length - 1].item = canonical;
    }
    return '<script type="application/ld+json">\n' + JSON.stringify(data, null, 2) + '\n  </script>';
  });
}

function ensureVideoSchema(html, record, canonical) {
  let found = false;
  let updated = html.replace(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi, (whole, raw) => {
    let data;
    try {
      data = JSON.parse(raw.trim());
    } catch (_) {
      return whole;
    }
    if (!data || data['@type'] !== 'VideoObject') return whole;
    found = true;
    data['@id'] = canonical + '#video';
    data.name = data.name || record.h1;
    data.description = data.description || record.description || record.lead;
    data.thumbnailUrl = data.thumbnailUrl || [record.poster];
    data.uploadDate = data.uploadDate || '2025-10-06T09:00:00+03:00';
    data.datePublished = data.datePublished || data.uploadDate;
    data.duration = data.duration || record.duration;
    data.contentUrl = record.source;
    data.url = canonical;
    data.mainEntityOfPage = { '@type': 'WebPage', '@id': canonical };
    data.inLanguage = record.locale === 'bg' ? 'bg-BG' : 'en';
    data.isFamilyFriendly = true;
    data.transcript = data.transcript || record.lead;
    data.publisher = data.publisher || {
      '@type': 'Organization',
      name: 'DM Physio',
      logo: { '@type': 'ImageObject', url: SITE_URL + '/logo.webp' }
    };
    return '<script type="application/ld+json">\n' + JSON.stringify(data, null, 2) + '\n  </script>';
  });
  if (!found) {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      '@id': canonical + '#video',
      name: record.h1,
      description: record.description || record.lead,
      thumbnailUrl: [record.poster],
      uploadDate: '2025-10-06T09:00:00+03:00',
      datePublished: '2025-10-06T09:00:00+03:00',
      duration: record.duration,
      contentUrl: record.source,
      url: canonical,
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
      inLanguage: record.locale === 'bg' ? 'bg-BG' : 'en',
      isFamilyFriendly: true,
      transcript: record.lead,
      publisher: {
        '@type': 'Organization',
        name: 'DM Physio',
        logo: { '@type': 'ImageObject', url: SITE_URL + '/logo.webp' }
      }
    };
    updated = updated.replace('</head>', '  <script type="application/ld+json">\n' + JSON.stringify(data, null, 2) + '\n  </script>\n</head>');
  }
  return updated;
}

function updatePage(record, canonical, bgCanonical, enCanonical) {
  let html = record.html;
  html = replaceCanonical(html, canonical);
  html = replaceMeta(html, 'og:url', canonical);
  html = replaceAlternates(html, bgCanonical, enCanonical);
  html = replaceJsonLdUrls(html, canonical);
  html = ensureVideoSchema(html, record, canonical);
  return html;
}

function rewriteHref(html, redirects) {
  return html.replace(/(\bhref=["'])([^"']+)(["'])/gi, (whole, start, href, end) => {
    let parsed;
    try {
      parsed = new URL(href, SITE_URL);
    } catch (_) {
      return whole;
    }
    if (parsed.origin !== SITE_URL) return whole;
    const destination = redirects.get(parsed.pathname);
    if (!destination) return whole;
    const replacement = href.startsWith('http')
      ? SITE_URL + destination + parsed.search + parsed.hash
      : destination + parsed.search + parsed.hash;
    return start + replacement + end;
  });
}

function xmlEscape(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function secondsFromDuration(value) {
  const match = String(value || '').match(/^PT(?:(\d+)M)?(?:(\d+)S)?$/i);
  if (!match) return 1;
  return Math.max(1, Number(match[1] || 0) * 60 + Number(match[2] || 0));
}

function buildVideoSitemap(primaryRecords) {
  const entries = primaryRecords
    .slice()
    .sort((a, b) => a.canonical.localeCompare(b.canonical))
    .map((record) => [
      '  <url>',
      '    <loc>' + xmlEscape(record.canonical) + '</loc>',
      '    <video:video>',
      '      <video:thumbnail_loc>' + xmlEscape(record.poster) + '</video:thumbnail_loc>',
      '      <video:title>' + xmlEscape(record.h1) + '</video:title>',
      '      <video:description>' + xmlEscape(record.description || record.lead || record.h1) + '</video:description>',
      '      <video:content_loc>' + xmlEscape(record.source) + '</video:content_loc>',
      '      <video:duration>' + secondsFromDuration(record.duration) + '</video:duration>',
      '      <video:publication_date>2025-10-06T09:00:00+03:00</video:publication_date>',
      '      <video:family_friendly>yes</video:family_friendly>',
      '    </video:video>',
      '  </url>'
    ].join('\n'));
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">',
    entries.join('\n'),
    '</urlset>',
    ''
  ].join('\n');
}

function syncVercelRedirects(redirects) {
  const file = path.join(ROOT, 'vercel.json');
  const config = JSON.parse(read(file));
  const managedSources = new Set(redirects.keys());
  const isGeneratedVideoRedirect = (entry) =>
    /^\/(?:en\/)?videos\//.test(entry.source || '') &&
    /^\/(?:en\/)?videos\//.test(entry.destination || '');
  const preserved = (config.redirects || []).filter((entry) =>
    !managedSources.has(entry.source) && !isGeneratedVideoRedirect(entry)
  );
  const generated = [...redirects.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([source, destination]) => ({ source, destination, permanent: true }));
  config.redirects = preserved.concat(generated);
  return JSON.stringify(config, null, 2) + '\n';
}

const dryRun = process.argv.includes('--dry-run');
const records = VIDEO_DIRS.flatMap((directory) =>
  fs.readdirSync(path.join(ROOT, directory))
    .filter((name) => name.endsWith('.html'))
    .sort()
    .map((name) => recordFor(path.join(ROOT, directory, name)))
);

const groups = new Map();
for (const record of records) {
  if (!groups.has(record.source)) groups.set(record.source, []);
  groups.get(record.source).push(record);
}

const redirects = new Map();
const primaryCanonicals = new Set();
const primaryRecords = [];
const updatedPages = new Map();
let pairedGroups = 0;

for (const group of groups.values()) {
  const bg = group.filter((record) => record.locale === 'bg');
  const en = group.filter((record) => record.locale === 'en');
  const primaryBg = bg.length ? best(bg) : null;
  let primaryEn = null;
  if (primaryBg && en.length) {
    const matchingName = en.find((record) => path.basename(record.relative) === path.basename(primaryBg.relative));
    primaryEn = matchingName || best(en);
  } else if (en.length) {
    primaryEn = best(en);
  }
  if (primaryBg && primaryEn) pairedGroups += 1;

  const bgCanonical = primaryBg ? primaryBg.canonical : '';
  const enCanonical = primaryEn ? primaryEn.canonical : '';
  if (primaryBg) {
    primaryCanonicals.add(primaryBg.canonical);
    primaryRecords.push(primaryBg);
  }
  if (primaryEn) {
    primaryCanonicals.add(primaryEn.canonical);
    primaryRecords.push(primaryEn);
  }

  for (const record of group) {
    const primary = record.locale === 'bg' ? primaryBg : primaryEn;
    if (!primary) continue;
    updatedPages.set(record.file, updatePage(record, primary.canonical, bgCanonical, enCanonical));
    if (record.urlPath !== primary.urlPath) redirects.set(record.urlPath, primary.urlPath);
  }
}

const allHtml = walkHtml(ROOT);
let rewrittenFiles = 0;
const rewrittenExamples = [];
const rewrittenDetails = [];
for (const file of allHtml) {
  const current = read(file);
  const original = updatedPages.has(file) ? updatedPages.get(file) : current;
  const updated = rewriteHref(original, redirects);
  if (updated !== current) {
    rewrittenFiles += 1;
    if (rewrittenExamples.length < 12) rewrittenExamples.push(path.relative(ROOT, file).replace(/\\/g, '/'));
    if (dryRun && rewrittenDetails.length < 3) {
      let index = 0;
      while (index < current.length && index < updated.length && current[index] === updated[index]) index += 1;
      rewrittenDetails.push({
        file: path.relative(ROOT, file).replace(/\\/g, '/'),
        current: current.slice(Math.max(0, index - 80), index + 160),
        updated: updated.slice(Math.max(0, index - 80), index + 160)
      });
    }
  }
  if (!dryRun && updated !== current) write(file, updated);
}

const sitemap = buildVideoSitemap(primaryRecords);
const vercel = syncVercelRedirects(redirects);
if (!dryRun) {
  write(path.join(ROOT, 'video-sitemap.xml'), sitemap);
  write(path.join(ROOT, 'vercel.json'), vercel);
}

console.log(JSON.stringify({
  mode: dryRun ? 'dry-run' : 'written',
  videoPages: records.length,
  mediaFiles: groups.size,
  primaryPages: primaryCanonicals.size,
  redirects: redirects.size,
  pairedMediaGroups: pairedGroups,
  rewrittenHtmlFiles: rewrittenFiles,
  rewrittenExamples,
  rewrittenDetails,
  videoSitemapEntries: (sitemap.match(/<url>/g) || []).length
}, null, 2));
