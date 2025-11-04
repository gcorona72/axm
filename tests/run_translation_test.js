const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

async function run() {
  const htmlPath = path.join(__dirname, '..', 'index.html');
  const scriptPath = path.join(__dirname, '..', 'traductor-es.js');

  const html = fs.readFileSync(htmlPath, 'utf8');
  const transl = fs.readFileSync(scriptPath, 'utf8');

  // Create a JSDOM instance and inject the translation script
  const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });

  // Evaluate translation script in the window context
  dom.window.eval(transl);

  // Wait a bit for mutation observers and timeouts
  await new Promise(r => setTimeout(r, 1500));

  // Serialize resulting HTML and check for a known translation
  const bodyText = dom.window.document.body.textContent;
  const hasTranslated = bodyText.includes('Tienda') || bodyText.includes('Tienda');

  console.log('Translation detected (Tienda):', hasTranslated);
}

run().catch(err => { console.error(err); process.exit(1); });

