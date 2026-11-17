import fs from 'node:fs';
import path from 'node:path';
import { transformSync } from 'esbuild';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const assetsDir = path.join(distDir, 'assets');

const html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
const assetFiles = fs.readdirSync(assetsDir);

const cssFile = assetFiles.find((f) => f.endsWith('.css'));
const jsFile = assetFiles.find((f) => f.endsWith('.js'));

if (!cssFile || !jsFile) {
  throw new Error('Expected built CSS and JS files in dist/assets');
}

const cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');
const rawJsContent = fs.readFileSync(path.join(assetsDir, jsFile), 'utf8');

// Convert ESM bundle to a classic IIFE so it also runs cleanly over file:// URLs
const iifeResult = transformSync(rawJsContent, {
  format: 'iife',
  minify: true,
  legalComments: 'none',
});

// Prevent any literal </script> inside bundled strings from closing the HTML tag prematurely
let safeJs = iifeResult.code.replace(/<\/script/gi, '<\\/script');
const safeCss = cssContent.replace(/<\/style/gi, '<\\/style');

// Inline referenced local /assets/aistudio/*.jpg assets so twende-events.html works completely offline (including file://)
const assetMatches = safeJs.match(/\/assets\/aistudio\/[A-Za-z0-9_.-]+\.(?:jpg|jpeg|png|webp)/gi) ?? [];
const uniqueAssets = [...new Set(assetMatches)];
for (const assetUrl of uniqueAssets) {
  const localFile = path.join(rootDir, 'public', assetUrl.replace(/^\//, ''));
  if (fs.existsSync(localFile)) {
    const ext = path.extname(localFile).slice(1).toLowerCase();
    const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
    const b64 = fs.readFileSync(localFile).toString('base64');
    safeJs = safeJs.replaceAll(assetUrl, `data:${mime};base64,${b64}`);
  }
}

let standalone = html
  .replace(/<link[^>]+rel="stylesheet"[^>]*>/gi, '')
  .replace(/<script[^>]+type="module"[^>]*><\/script>/gi, '');

standalone = standalone.replace('</head>', () => `  <style>${safeCss}</style>\n  </head>`);
standalone = standalone.replace('</body>', () => `  <script>${safeJs}</script>\n  </body>`);

fs.writeFileSync(path.join(rootDir, 'twende-events.html'), standalone, 'utf8');
fs.mkdirSync(path.join(rootDir, 'public'), { recursive: true });
fs.writeFileSync(path.join(rootDir, 'public', 'twende-events.html'), standalone, 'utf8');

const sizeKb = (Buffer.byteLength(standalone, 'utf8') / 1024).toFixed(1);
console.log(`Generated twende-events.html (${sizeKb} KB, ${uniqueAssets.length} embedded images)`);
