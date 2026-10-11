const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const read = name => fs.readFileSync(path.join(__dirname, name), 'utf8');
const html = read('index.html');
const css = read('style.css');
const js = read('script.js');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(ids.length, new Set(ids).size, 'Duplicate ids');
for (const match of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(match[1]), 'Broken anchor ' + match[1]);
assert.equal((html.match(/class="service-card"/g) || []).length, 6, 'All six services must remain');
assert(!/heroPause|hero-slider|hero-prev|hero-next/.test(html + js), 'Slider must be removed');
assert(!/localStorage|fetch\s*\(|setInterval/.test(js), 'No opaque submit, storage dependency or slideshow timer');
assert(/method="post"/.test(html) && /forms\/d\/e\/[^"]+\/formResponse/.test(html), 'Native form endpoint');
assert(!/novalidate/.test(html), 'Native validation must work without JS');
assert(!/energy-stroy-logo\.png/.test(html), 'All metadata must use approved logo');
assert(!/data-animate|opacity:\s*0[^.]/.test(html), 'Content visible without JS');
assert(css.includes('.site-header { position: sticky'), 'Sticky header');
JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
for (const match of html.matchAll(/(?:src|href)="([^"#?]+)(?:\?[^"]*)?"/g)) {
  if (!/^(https?:|tel:)/.test(match[1])) assert(fs.existsSync(path.join(__dirname, match[1])), 'Missing local asset ' + match[1]);
}
console.log('PASS: anchors, ids, six services, static hero, native form, assets and structured data');
