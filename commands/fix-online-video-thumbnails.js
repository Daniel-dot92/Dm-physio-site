const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const fixes = {
  'videos/procedures-online-5proceduri-5proceduri.html': '5proceduri-Thumbnail.jpg',
  'videos/procedures-online-podrujka-konsultaciq2.html': 'konsultaciq2-Thumbnail.jpg',
  'videos/procedures-online-podrujka-videoupr2.html': 'videoupr2-Thumbnail.jpg',
  'videos/procedures-online-sesiq-konsultaciq.html': 'konsultaciq-Thumbnail.jpg',
  'videos/procedures-online-sesiq-tech-check.html': 'tech-check-Thumbnail.jpg',
  'videos/procedures-online-sesiq-trenirovka.html': 'trenirovka-Thumbnail.jpg',
  'videos/procedures-online-videos-videoupr.html': 'videoupr-Thumbnail.jpg'
};

let changed = 0;
for (const [relative, filename] of Object.entries(fixes)) {
  const file = path.join(ROOT, ...relative.split('/'));
  const thumbnail = 'https://www.dmphysi0.com/pngs/online/gif/' + filename;
  const original = fs.readFileSync(file, 'utf8');
  let html = original
    .replace(/(<meta\s+property=["']og:image["']\s+content=["'])[^"']+(["'])/i, '$1' + thumbnail + '$2')
    .replace(/(<meta\s+name=["']twitter:image["']\s+content=["'])[^"']+(["'])/i, '$1' + thumbnail + '$2')
    .replace(/("thumbnailUrl"\s*:\s*\[\s*")[^"]+("\s*\])/i, '$1' + thumbnail + '$2')
    .replace(/(<video\b[^>]*\bposter=["'])[^"']+(["'])/i, '$1' + thumbnail + '$2');
  if (html !== original) {
    fs.writeFileSync(file, html, 'utf8');
    changed += 1;
  }
}

console.log(JSON.stringify({ checked: Object.keys(fixes).length, changed }, null, 2));
