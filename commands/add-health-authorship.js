const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://www.dmphysi0.com';
const DRY_RUN = process.argv.includes('--dry-run');
const HEALTH_DIRS = ['sustiqnia', 'en/sustiqnia'];
const STYLE = '/css/health-author.css?v=20260811';

function filesIn(directory, output = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) filesIn(file, output);
    else if (entry.isFile() && entry.name.endsWith('.html')) output.push(file);
  }
  return output;
}

function read(file) { return fs.readFileSync(file, 'utf8'); }
function write(file, value) { fs.writeFileSync(file, value, 'utf8'); }
function relative(file) { return path.relative(ROOT, file).replace(/\\/g, '/'); }
function first(html, expression) { const match = html.match(expression); return match ? match[1].trim() : ''; }
function clean(value) { return String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }

function historyDates(file) {
  const history = execFileSync('git', ['log', '--format=%aI', '--', relative(file)], {
    cwd: ROOT,
    encoding: 'utf8'
  }).trim().split(/\r?\n/).filter(Boolean);
  if (!history.length) throw new Error('No Git history for ' + relative(file));
  return {
    published: history[history.length - 1].slice(0, 10),
    modified: history[0].slice(0, 10)
  };
}

function replaceOrInsertMeta(html, property, value) {
  const expression = new RegExp('(<meta\\b(?=[^>]*\\bproperty=["\\\']' + property + '["\\\'])[^>]*\\bcontent=["\\\'])[^"\\\']*(["\\\'][^>]*>)', 'i');
  if (expression.test(html)) return html.replace(expression, '$1' + value + '$2');
  return html.replace('</head>', '  <meta property="' + property + '" content="' + value + '">\n</head>');
}

function replaceMetaAuthor(html, name) {
  const expression = /(<meta\b(?=[^>]*\bname=["']author["'])[^>]*\bcontent=["'])[^"']*(\s*["'][^>]*>)/i;
  if (expression.test(html)) return html.replace(expression, '$1' + name + '$2');
  return html.replace('</head>', '  <meta name="author" content="' + name + '">\n</head>');
}

function author(locale) {
  return {
    '@type': 'Person',
    '@id': SITE + '/therapists/daniel-mitev.html#person',
    name: locale === 'bg' ? 'Даниел Митев' : 'Daniel Mitev',
    jobTitle: locale === 'bg' ? 'Кинезитерапевт' : 'Kinesiotherapist',
    description: locale === 'bg'
      ? 'Кинезитерапевт с 10 години практически опит в работата с мускулно-скелетни, периферни нервни и ортопедични проблеми.'
      : 'Kinesiotherapist with 10 years of practical experience working with musculoskeletal, peripheral nerve and orthopedic problems.',
    url: SITE + (locale === 'bg' ? '/therapists/daniel-mitev.html' : '/en/therapists/daniel-mitev.html'),
    image: SITE + '/assets/therapists/daniel.jpg',
    worksFor: { '@id': SITE + '/#org' },
    knowsAbout: locale === 'bg'
      ? ['Кинезитерапия', 'Мускулно-скелетни проблеми', 'Периферни нервни увреди', 'Ортопедични проблеми']
      : ['Kinesiotherapy', 'Musculoskeletal problems', 'Peripheral nerve injuries', 'Orthopedic problems']
  };
}

function updateStructuredData(html, page) {
  let updatedPageSchema = false;
  const updated = html.replace(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi, (whole, raw) => {
    let data;
    try { data = JSON.parse(raw.trim()); } catch (_) { return whole; }
    const objects = Array.isArray(data) ? data : (Array.isArray(data['@graph']) ? data['@graph'] : [data]);
    let changed = false;
    for (const object of objects) {
      if (!object || !['MedicalWebPage', 'WebPage'].includes(object['@type'])) continue;
      object['@id'] = page.canonical + '#webpage';
      object.url = page.canonical;
      object.datePublished = page.published;
      object.dateModified = page.modified;
      object.author = author(page.locale);
      changed = true;
      updatedPageSchema = true;
    }
    return changed
      ? '<script type="application/ld+json">\n' + JSON.stringify(data, null, 2) + '\n  </script>'
      : whole;
  });

  if (updatedPageSchema) return updated;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    '@id': page.canonical + '#webpage',
    url: page.canonical,
    name: page.title,
    description: page.description,
    inLanguage: page.locale === 'bg' ? 'bg-BG' : 'en',
    datePublished: page.published,
    dateModified: page.modified,
    author: author(page.locale),
    publisher: { '@id': SITE + '/#org' }
  };
  return updated.replace('</head>', '  <script type="application/ld+json">\n' + JSON.stringify(schema, null, 2) + '\n  </script>\n</head>');
}

function authorBlock(page) {
  const bg = page.locale === 'bg';
  const profile = bg ? '/therapists/daniel-mitev.html' : '/en/therapists/daniel-mitev.html';
  return [
    '  <!-- health-author:start -->',
    '  <aside class="health-author" aria-label="' + (bg ? 'Автор на здравната информация' : 'Health content author') + '">',
    '    <div class="health-author__inner">',
    '      <img class="health-author__photo" src="/assets/therapists/daniel.jpg" alt="' + (bg ? 'Даниел Митев, кинезитерапевт' : 'Daniel Mitev, kinesiotherapist') + '" width="82" height="82" loading="lazy" decoding="async">',
    '      <div>',
    '        <p class="health-author__label">' + (bg ? 'Автор на здравната информация' : 'Health content author') + '</p>',
    '        <h2 class="health-author__name">' + (bg ? 'Даниел Митев · кинезитерапевт' : 'Daniel Mitev · kinesiotherapist') + '</h2>',
    '        <p class="health-author__bio">' + (bg
      ? 'Кинезитерапевт с 10 години практически опит в работата с мускулно-скелетни, периферни нервни, ортопедични и свързани двигателни проблеми.'
      : 'Kinesiotherapist with 10 years of practical experience working with musculoskeletal, peripheral nerve, orthopedic and related movement problems.') + '</p>',
    '        <p class="health-author__meta"><span>' + (bg ? 'Публикувано' : 'Published') + ': <time datetime="' + page.published + '">' + page.published.split('-').reverse().join('.') + '</time></span><span>' + (bg ? 'Последна редакция' : 'Last updated') + ': <time datetime="' + page.modified + '">' + page.modified.split('-').reverse().join('.') + '</time></span></p>',
    '        <a class="health-author__profile" href="' + profile + '">' + (bg ? 'Виж опита, квалификацията и подхода на Даниел' : 'See Daniel’s experience, qualifications and approach') + ' <span aria-hidden="true">→</span></a>',
    '      </div>',
    '    </div>',
    '  </aside>',
    '  <!-- health-author:end -->'
  ].join('\n');
}

function updateFile(file) {
  const original = read(file);
  const locale = relative(file).startsWith('en/') ? 'en' : 'bg';
  const canonical = first(original, /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*\bhref=["']([^"']+)["']/i);
  if (!canonical) throw new Error('Missing canonical: ' + relative(file));
  const dates = historyDates(file);
  const page = {
    locale,
    canonical,
    published: dates.published,
    modified: dates.modified,
    title: clean(first(original, /<h1[^>]*>([\s\S]*?)<\/h1>/i)) || clean(first(original, /<title[^>]*>([\s\S]*?)<\/title>/i)),
    description: first(original, /<meta\b(?=[^>]*\bname=["']description["'])[^>]*\bcontent=["']([^"']*)["']/i)
  };
  let html = original;
  html = html.replace(/\s*<!-- health-author:start -->[\s\S]*?<!-- health-author:end -->\s*/i, '\n');
  html = replaceMetaAuthor(html, locale === 'bg' ? 'Даниел Митев' : 'Daniel Mitev');
  html = replaceOrInsertMeta(html, 'article:published_time', page.published);
  html = replaceOrInsertMeta(html, 'article:modified_time', page.modified);
  if (!html.includes(STYLE)) html = html.replace('</head>', '  <link rel="stylesheet" href="' + STYLE + '">\n</head>');
  html = updateStructuredData(html, page);
  html = html.replace(/\s*<\/main>/i, '\n' + authorBlock(page) + '\n</main>');
  if (!DRY_RUN && html !== original) write(file, html);
  return { file: relative(file), changed: html !== original, ...dates };
}

const files = HEALTH_DIRS.flatMap((directory) => filesIn(path.join(ROOT, directory))).sort();
const results = files.map(updateFile);
console.log(JSON.stringify({
  mode: DRY_RUN ? 'dry-run' : 'written',
  pages: results.length,
  changed: results.filter((item) => item.changed).length,
  firstPublished: results.reduce((min, item) => !min || item.published < min ? item.published : min, ''),
  latestModified: results.reduce((max, item) => !max || item.modified > max ? item.modified : max, '')
}, null, 2));
