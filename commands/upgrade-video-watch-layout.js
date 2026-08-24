const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITEMAP = path.join(ROOT, 'video-sitemap.xml');
const STYLE_VERSION = '/css/video-watch.css?v=20260824-watch-focus-2';
const DRY_RUN = process.argv.includes('--dry-run');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, contents) {
  fs.writeFileSync(file, contents, 'utf8');
}

function clean(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function firstMatch(value, expression) {
  const match = String(value || '').match(expression);
  return match ? match[1].trim() : '';
}

function videoSchema(html) {
  for (const match of html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(match[1].trim());
      if (data && data['@type'] === 'VideoObject') return data;
    } catch (_) {}
  }
  return {};
}

function durationSeconds(duration) {
  const match = String(duration || '').match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
  if (!match) return 0;
  return (Number(match[1]) || 0) * 3600 + (Number(match[2]) || 0) * 60 + (Number(match[3]) || 0);
}

function firstSentence(value, fallback) {
  const text = clean(value) || clean(fallback);
  const match = text.match(/^(.{35,240}?[.!?])(?:\s|$)/);
  if (match) return match[1];
  if (text.length <= 240) return text;
  const part = text.slice(0, 239);
  const space = part.lastIndexOf(' ');
  return part.slice(0, Math.max(space, 1)).trim() + '…';
}

function articles(html) {
  const section = firstMatch(html, /<section\s+class=["'][^"']*(?:body-section|watch-context)[^"']*["'][^>]*>([\s\S]*?)<\/section>/i);
  const output = [];
  for (const match of section.matchAll(/<article[^>]*>[\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>[\s\S]*?<\/article>/gi)) {
    output.push({ heading: clean(match[1]), paragraph: clean(match[2]) });
  }
  if (output.length < 2) {
    for (const match of section.matchAll(/<aside[^>]*>[\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>[\s\S]*?<\/aside>/gi)) {
      output.push({ heading: clean(match[1]), paragraph: clean(match[2]) });
    }
  }
  return output;
}

function actionAnchor(html) {
  const actions = firstMatch(html, /<div\s+class=["'][^"']*\bactions\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  return firstMatch(actions, /(<a\b[\s\S]*?<\/a>)/i);
}

function videoNavigation(html) {
  const nav = html.match(/<nav\s+class=["'][^"']*(?:video-nav|prototype-video-nav)[^"']*["'][^>]*>([\s\S]*?)<\/nav>/i);
  return nav ? nav[1].trim() : '';
}

function addVideoDescription(video, id) {
  if (/\baria-describedby=["'][^"']+["']/i.test(video)) return video;
  return video.replace(/<video\b/i, '<video aria-describedby="' + id + '"');
}

function addVideoPoster(video, thumbnail) {
  const resource = Array.isArray(thumbnail) ? thumbnail[0] : thumbnail;
  if (!resource) return video;
  if (/\bposter=["'][^"']*["']/i.test(video)) {
    return video.replace(/(\bposter=["'])[^"']*(["'])/i, '$1' + resource + '$2');
  }
  return video.replace(/<video\b/i, '<video poster="' + resource + '"');
}

function removePrototypeStyle(html) {
  return html.replace(/\s*<style>\s*[\s\S]*?video-watch-page--prototype[\s\S]*?<\/style>\s*/i, '\n');
}

function transform(file, relative) {
  const locale = relative.startsWith('en/') ? 'en' : 'bg';
  const original = read(file);
  const schema = videoSchema(original);
  const breadcrumb = firstMatch(original, /(<nav\s+class=["']site-breadcrumb["'][^>]*>[\s\S]*?<\/nav>)/i);
  const video = firstMatch(original, /(<video\b[\s\S]*?<\/video>)/i);
  const title = clean(firstMatch(original, /<h1[^>]*>([\s\S]*?)<\/h1>/i));
  const lead = clean(firstMatch(original, /<p\s+class=["'][^"']*(?:lead|watch-focus__intro)[^"']*["'][^>]*>([\s\S]*?)<\/p>/i));
  const cards = articles(original);
  const related = actionAnchor(original);
  const navigation = videoNavigation(original);
  const seconds = durationSeconds(schema.duration);

  if (!breadcrumb || !video || !title || !related || cards.length < 2) {
    throw new Error('Incomplete watch-page structure: ' + relative);
  }

  const labels = locale === 'bg'
    ? {
        eyebrow: seconds ? 'Видео · ' + seconds + ' сек.' : 'Видео',
        language: 'Български',
        type: 'Образователна визуализация',
        context: 'Контекст към видеото',
        navigation: 'Свързани видеа'
      }
    : {
        eyebrow: seconds ? 'Video · ' + seconds + ' sec.' : 'Video',
        language: 'English',
        type: 'Educational visual',
        context: 'Video context',
        navigation: 'Related videos'
      };

  const summary = firstSentence(cards[0].paragraph, lead);
  const describedVideo = addVideoPoster(addVideoDescription(video, 'video-summary'), schema.thumbnailUrl);
  const navigationHtml = navigation
    ? '\n    <nav class="watch-related-videos" aria-label="' + labels.navigation + '">' + navigation + '</nav>'
    : '';

  const main = [
    '  <main id="content" class="video-watch-page video-watch-page--focus">',
    '    ' + breadcrumb,
    '',
    '    <section class="watch-focus" aria-labelledby="video-title">',
    '      <div class="video-shell">' + describedVideo + '</div>',
    '      <div class="watch-focus__copy">',
    '        <p class="eyebrow">' + escapeHtml(labels.eyebrow) + '</p>',
    '        <h1 id="video-title">' + escapeHtml(title) + '</h1>',
    '        <p class="watch-focus__intro" id="video-summary">' + escapeHtml(summary) + '</p>',
    '        <ul class="watch-facts" aria-label="' + escapeHtml(labels.context) + '">',
    '          ' + (seconds ? '<li>' + escapeHtml(locale === 'bg' ? 'Продължителност: ' + seconds + ' сек.' : 'Duration: ' + seconds + ' sec.') + '</li>' : ''),
    '          <li>' + escapeHtml(labels.language) + '</li>',
    '          <li>' + escapeHtml(labels.type) + '</li>',
    '        </ul>',
    '        <div class="actions">' + related + '</div>',
    '      </div>',
    '    </section>',
    '',
    '    <section class="watch-context" aria-label="' + escapeHtml(labels.context) + '">',
    '      <article><h2>' + escapeHtml(cards[0].heading) + '</h2><p>' + escapeHtml(cards[0].paragraph) + '</p></article>',
    '      <aside><h2>' + escapeHtml(cards[1].heading) + '</h2><p>' + escapeHtml(cards[1].paragraph) + '</p></aside>',
    '    </section>' + navigationHtml,
    '  </main>'
  ].join('\n');

  let updated = removePrototypeStyle(original);
  updated = updated.replace(/<link\s+rel=["']stylesheet["']\s+href=["']\/css\/video-watch\.css[^"']*["']\s*\/?\s*>/i, '<link rel="stylesheet" href="' + STYLE_VERSION + '">');
  updated = updated.replace(/\s*<main\s+id=["']content["'][^>]*>[\s\S]*?<\/main>/i, '\n' + main);
  return updated;
}

const sitemap = read(SITEMAP);
const relativeUrls = Array.from(sitemap.matchAll(/<loc>https:\/\/www\.dmphysi0\.com\/((?:en\/)?videos\/[^<]+)<\/loc>/g), (match) => match[1]);
const errors = [];
let changed = 0;

for (const relative of relativeUrls) {
  const decoded = decodeURIComponent(relative);
  const file = path.join(ROOT, ...decoded.split('/'));
  try {
    const original = read(file);
    const updated = transform(file, decoded);
    if (updated !== original) {
      if (!DRY_RUN) write(file, updated);
      changed += 1;
    }
  } catch (error) {
    errors.push({ file: decoded, error: error.message });
  }
}

console.log(JSON.stringify({ mode: DRY_RUN ? 'dry-run' : 'written', sitemapEntries: relativeUrls.length, changed, errors }, null, 2));
if (errors.length) process.exit(1);
