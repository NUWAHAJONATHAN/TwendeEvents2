export type LogoSurface = 'green' | 'light' | 'dark';
export type LogoWordmarkStyle = 'title' | 'compact';
export type LogoAssetKind = 'lockup' | 'mark';

export interface LogoPalette {
  bg: string;
  stroke: string;
  accent: string;
  wordmarkPrimary: string;
  wordmarkSecondary: string;
}

export const LOGO_PALETTES: Record<LogoSurface, LogoPalette> = {
  green: {
    bg: '#0E5A43',
    stroke: '#FAFAF8',
    accent: '#FFD23F',
    wordmarkPrimary: '#111714',
    wordmarkSecondary: '#4D5752',
  },
  light: {
    bg: '#FAFAF8',
    stroke: '#0E5A43',
    accent: '#D99B16',
    wordmarkPrimary: '#111714',
    wordmarkSecondary: '#4D5752',
  },
  dark: {
    bg: '#101815',
    stroke: '#3DBE7C',
    accent: '#FFD23F',
    wordmarkPrimary: '#EEF3F0',
    wordmarkSecondary: '#A3B1AA',
  },
};

export function getLogoFilename(
  kind: LogoAssetKind,
  surface: LogoSurface,
  wordmarkStyle: LogoWordmarkStyle,
  ext: 'svg' | 'png',
): string {
  const namePart = wordmarkStyle === 'compact' ? 'twendeevents' : 'twende-events';
  return kind === 'mark'
    ? `${namePart}-mark-${surface}.${ext}`
    : `${namePart}-logo-${surface}.${ext}`;
}

export function buildMarkSvgMarkup(surface: LogoSurface = 'green', size = 256): string {
  const p = LOGO_PALETTES[surface];
  const borderAttr =
    surface === 'light'
      ? ' stroke="#E5E5DF" stroke-width="1"'
      : surface === 'dark'
        ? ' stroke="#222F2A" stroke-width="1"'
        : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" role="img" aria-label="Twende Events mark">
  <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" fill="${p.bg}"${borderAttr}/>
  <path d="M7.5 10.5H23.5" stroke="${p.stroke}" stroke-width="2.8" stroke-linecap="round"/>
  <path d="M19.5 6.8L24 10.5L19.5 14.2" stroke="${p.stroke}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12.5 10.5V24" stroke="${p.stroke}" stroke-width="2.8" stroke-linecap="round"/>
  <circle cx="21.5" cy="21.5" r="2.7" fill="${p.accent}"/>
</svg>`;
}

export function buildLockupSvgMarkup(
  surface: LogoSurface = 'green',
  wordmarkStyle: LogoWordmarkStyle = 'compact',
  width = 640,
): string {
  const p = LOGO_PALETTES[surface];
  const height = Math.round((width / 220) * 44);
  const bgFill = surface === 'dark' ? '#0D1210' : '#FAFAF8';
  const primaryText = surface === 'dark' ? '#EEF3F0' : '#111714';
  const secondaryText = surface === 'dark' ? '#4AD192' : '#0E5A43';
  const borderAttr =
    surface === 'light'
      ? ' stroke="#E5E5DF" stroke-width="1"'
      : surface === 'dark'
        ? ' stroke="#222F2A" stroke-width="1"'
        : '';

  const firstWord = wordmarkStyle === 'compact' ? 'twende' : 'Twende';
  const secondWord = wordmarkStyle === 'compact' ? 'events' : 'Events';
  const tspanDx = wordmarkStyle === 'title' ? ' dx="5"' : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 220 44" fill="none" role="img" aria-label="twendeevents logo">
  <rect width="220" height="44" rx="8" fill="${bgFill}"/>
  <g transform="translate(8 6)">
    <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" fill="${p.bg}"${borderAttr}/>
    <path d="M7.5 10.5H23.5" stroke="${p.stroke}" stroke-width="2.8" stroke-linecap="round"/>
    <path d="M19.5 6.8L24 10.5L19.5 14.2" stroke="${p.stroke}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12.5 10.5V24" stroke="${p.stroke}" stroke-width="2.8" stroke-linecap="round"/>
    <circle cx="21.5" cy="21.5" r="2.7" fill="${p.accent}"/>
  </g>
  <text x="50" y="28" font-family="'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="20" font-weight="800" letter-spacing="-0.03em" fill="${primaryText}">${firstWord}<tspan${tspanDx} font-weight="600" fill="${secondaryText}">${secondWord}</tspan></text>
</svg>`;
}
