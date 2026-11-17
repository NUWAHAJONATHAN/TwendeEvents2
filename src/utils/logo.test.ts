import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildLockupSvgMarkup,
  buildMarkSvgMarkup,
  getLogoFilename,
  LOGO_PALETTES,
} from './logo';

test('buildMarkSvgMarkup produces valid square vector SVG with brand palette', () => {
  const svg = buildMarkSvgMarkup('green', 128);
  assert.ok(svg.startsWith('<svg '));
  assert.ok(svg.includes('viewBox="0 0 32 32"'));
  assert.ok(svg.includes(`fill="${LOGO_PALETTES.green.bg}"`));
  assert.ok(svg.includes(`fill="${LOGO_PALETTES.green.accent}"`));
  assert.ok(svg.endsWith('</svg>'));
});

test('buildLockupSvgMarkup supports compact twendeevents and title Twende Events wordmarks', () => {
  const compactSvg = buildLockupSvgMarkup('green', 'compact', 440);
  const titleSvg = buildLockupSvgMarkup('dark', 'title', 440);

  assert.ok(compactSvg.includes('>twende<tspan'));
  assert.ok(compactSvg.includes('>events</tspan>'));
  assert.ok(titleSvg.includes('>Twende<tspan'));
  assert.ok(titleSvg.includes('dx="5"'));
  assert.ok(titleSvg.includes('>Events</tspan>'));
  assert.ok(titleSvg.includes('fill="#0D1210"'));
});

test('getLogoFilename produces predictable filenames across variants', () => {
  assert.equal(getLogoFilename('mark', 'green', 'compact', 'svg'), 'twendeevents-mark-green.svg');
  assert.equal(getLogoFilename('lockup', 'dark', 'title', 'png'), 'twende-events-logo-dark.png');
});
