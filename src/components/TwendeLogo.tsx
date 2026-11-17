import { useEffect, useState } from 'react';
import { Check, Download, X } from 'lucide-react';
import {
  buildLockupSvgMarkup,
  buildMarkSvgMarkup,
  getLogoFilename,
  LOGO_PALETTES,
  type LogoAssetKind,
  type LogoSurface,
  type LogoWordmarkStyle,
} from '../utils/logo';

interface TwendeMarkProps {
  size?: number;
  surface?: LogoSurface;
  className?: string;
}

export function TwendeMark({ size = 28, surface, className = '' }: TwendeMarkProps) {
  if (surface) {
    const p = LOGO_PALETTES[surface];
    const borderStroke =
      surface === 'light' ? '#E5E5DF' : surface === 'dark' ? '#222F2A' : undefined;

    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={`shrink-0 ${className}`}
      >
        <rect
          x="0.5"
          y="0.5"
          width="31"
          height="31"
          rx="7.5"
          fill={p.bg}
          stroke={borderStroke}
          strokeWidth={borderStroke ? 1 : undefined}
        />
        <path d="M7.5 10.5H23.5" stroke={p.stroke} strokeWidth="2.8" strokeLinecap="round" />
        <path
          d="M19.5 6.8L24 10.5L19.5 14.2"
          stroke={p.stroke}
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M12.5 10.5V24" stroke={p.stroke} strokeWidth="2.8" strokeLinecap="round" />
        <circle cx="21.5" cy="21.5" r="2.7" fill={p.accent} />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <rect
        x="0.5"
        y="0.5"
        width="31"
        height="31"
        rx="7.5"
        className="fill-[#0E5A43] dark:fill-[#144736]"
      />
      <path
        d="M7.5 10.5H23.5"
        className="stroke-[#FAFAF8] dark:stroke-[#EEF3F0]"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path
        d="M19.5 6.8L24 10.5L19.5 14.2"
        className="stroke-[#FAFAF8] dark:stroke-[#EEF3F0]"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 10.5V24"
        className="stroke-[#FAFAF8] dark:stroke-[#EEF3F0]"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <circle cx="21.5" cy="21.5" r="2.7" className="fill-[#FFD23F]" />
    </svg>
  );
}

interface TwendeLockupProps {
  wordmarkStyle?: LogoWordmarkStyle;
  surface?: LogoSurface;
  markSize?: number;
  textClassName?: string;
}

export function TwendeLockup({
  wordmarkStyle = 'title',
  surface,
  markSize = 28,
  textClassName = 'text-lg',
}: TwendeLockupProps) {
  const firstWord = wordmarkStyle === 'compact' ? 'twende' : 'Twende';
  const secondWord = wordmarkStyle === 'compact' ? 'events' : ' Events';

  const primaryClass =
    surface === 'dark'
      ? 'text-[#EEF3F0]'
      : surface
        ? 'text-[#111714]'
        : 'text-[#111714] dark:text-[#EEF3F0]';

  const secondaryClass =
    surface === 'dark'
      ? 'text-[#4AD192]'
      : surface
        ? 'text-[#0E5A43]'
        : 'text-[#0E5A43] dark:text-[#4AD192]';

  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0">
      <TwendeMark size={markSize} surface={surface} />
      <span className={`font-display font-extrabold tracking-tight ${textClassName} ${primaryClass}`}>
        {firstWord}
        <span className={`font-semibold ${secondaryClass}`}>{secondWord}</span>
      </span>
    </span>
  );
}

interface BrandLogoModalProps {
  open: boolean;
  onClose: () => void;
}

export function BrandLogoModal({ open, onClose }: BrandLogoModalProps) {
  const [surface, setSurface] = useState<LogoSurface>('green');
  const [kind, setKind] = useState<LogoAssetKind>('lockup');
  const [wordmarkStyle, setWordmarkStyle] = useState<LogoWordmarkStyle>('compact');
  const [copiedSvg, setCopiedSvg] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const getCurrentSvg = () =>
    kind === 'mark'
      ? buildMarkSvgMarkup(surface, 512)
      : buildLockupSvgMarkup(surface, wordmarkStyle, 880);

  const handleDownloadSvg = () => {
    const svg = getCurrentSvg();
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = getLogoFilename(kind, surface, wordmarkStyle, 'svg');
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = () => {
    const svg = getCurrentSvg();
    const width = kind === 'mark' ? 512 : 880;
    const height = kind === 'mark' ? 512 : 176;
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((pngBlob) => {
          if (pngBlob) {
            const pngUrl = URL.createObjectURL(pngBlob);
            const link = document.createElement('a');
            link.href = pngUrl;
            link.download = getLogoFilename(kind, surface, wordmarkStyle, 'png');
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(pngUrl);
          }
        }, 'image/png');
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleCopySvg = async () => {
    try {
      await navigator.clipboard.writeText(getCurrentSvg());
      setCopiedSvg(true);
      window.setTimeout(() => setCopiedSvg(false), 1800);
    } catch {
      // Clipboard fallback not needed; download remains available
    }
  };

  const stageBgClass =
    surface === 'dark'
      ? 'bg-[#0D1210] border-[#222F2A]'
      : 'bg-[#FAFAF8] border-[#E5E5DF]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="brand-logo-modal-title"
    >
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A] p-6 sm:p-7 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="brand-logo-modal-title"
              className="font-display text-xl font-bold text-[#111714] dark:text-[#EEF3F0]"
            >
              Twende Events brand logo
            </h2>
            <p className="mt-1 text-sm text-[#4D5752] dark:text-[#A3B1AA]">
              A forward-pointing “T” route mark paired with an equatorial gold destination dot.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close brand logo modal"
            className="p-2 rounded-lg text-[#4D5752] dark:text-[#A3B1AA] hover:bg-[#F3F3EF] dark:hover:bg-[#1B2622] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live preview stage */}
        <div
          className={`mt-5 rounded-xl border ${stageBgClass} p-8 sm:p-10 flex flex-col items-center justify-center gap-6`}
        >
          {kind === 'lockup' ? (
            <TwendeLockup
              surface={surface}
              wordmarkStyle={wordmarkStyle}
              markSize={44}
              textClassName="text-3xl sm:text-4xl"
            />
          ) : (
            <TwendeMark size={96} surface={surface} />
          )}

          {/* Multi-size legibility check */}
          <div className="flex items-center gap-5 pt-4 border-t border-black/10 dark:border-white/10">
            <div className="flex items-center gap-2 text-xs text-[#5C6660] dark:text-[#9AA8A0]">
              <TwendeMark size={16} surface={surface} />
              <span className="font-mono-num">16px</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#5C6660] dark:text-[#9AA8A0]">
              <TwendeMark size={28} surface={surface} />
              <span className="font-mono-num">28px</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#5C6660] dark:text-[#9AA8A0]">
              <TwendeMark size={40} surface={surface} />
              <span className="font-mono-num">40px</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          <div className="sm:col-span-5">
            <span className="block font-medium text-[#5C6660] dark:text-[#9AA8A0] mb-1.5">
              Format
            </span>
            <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[#F3F3EF] dark:bg-[#101714]">
              <button
                type="button"
                onClick={() => setKind('lockup')}
                className={`py-1.5 px-2.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  kind === 'lockup'
                    ? 'bg-white dark:bg-[#1E2924] text-[#111714] dark:text-[#EEF3F0] shadow-2xs'
                    : 'text-[#4D5752] dark:text-[#A3B1AA]'
                }`}
              >
                Lockup
              </button>
              <button
                type="button"
                onClick={() => setKind('mark')}
                className={`py-1.5 px-2.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  kind === 'mark'
                    ? 'bg-white dark:bg-[#1E2924] text-[#111714] dark:text-[#EEF3F0] shadow-2xs'
                    : 'text-[#4D5752] dark:text-[#A3B1AA]'
                }`}
              >
                Emblem
              </button>
            </div>
          </div>

          <div className="sm:col-span-7">
            <span className="block font-medium text-[#5C6660] dark:text-[#9AA8A0] mb-1.5">
              Surface variant
            </span>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-[#F3F3EF] dark:bg-[#101714]">
              {(
                [
                  { id: 'green', label: 'Green' },
                  { id: 'light', label: 'Light' },
                  { id: 'dark', label: 'Dark' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSurface(item.id)}
                  className={`py-1.5 px-2.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    surface === item.id
                      ? 'bg-white dark:bg-[#1E2924] text-[#111714] dark:text-[#EEF3F0] shadow-2xs'
                      : 'text-[#4D5752] dark:text-[#A3B1AA]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-12">
            <span className="block font-medium text-[#5C6660] dark:text-[#9AA8A0] mb-1.5">
              Wordmark style
            </span>
            <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[#F3F3EF] dark:bg-[#101714]">
              <button
                type="button"
                disabled={kind === 'mark'}
                onClick={() => setWordmarkStyle('compact')}
                className={`py-1.5 px-3 rounded-md font-medium transition-colors whitespace-nowrap ${
                  kind === 'mark'
                    ? 'opacity-40 cursor-not-allowed text-[#4D5752] dark:text-[#A3B1AA]'
                    : wordmarkStyle === 'compact'
                      ? 'bg-white dark:bg-[#1E2924] text-[#111714] dark:text-[#EEF3F0] shadow-2xs cursor-pointer'
                      : 'text-[#4D5752] dark:text-[#A3B1AA] cursor-pointer'
                }`}
              >
                twendeevents
              </button>
              <button
                type="button"
                disabled={kind === 'mark'}
                onClick={() => setWordmarkStyle('title')}
                className={`py-1.5 px-3 rounded-md font-medium transition-colors whitespace-nowrap ${
                  kind === 'mark'
                    ? 'opacity-40 cursor-not-allowed text-[#4D5752] dark:text-[#A3B1AA]'
                    : wordmarkStyle === 'title'
                      ? 'bg-white dark:bg-[#1E2924] text-[#111714] dark:text-[#EEF3F0] shadow-2xs cursor-pointer'
                      : 'text-[#4D5752] dark:text-[#A3B1AA] cursor-pointer'
                }`}
              >
                Twende Events
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E5E5DF] dark:border-[#222F2A]">
          <button
            type="button"
            onClick={handleCopySvg}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] text-xs font-semibold text-[#3C4641] dark:text-[#C4D0C9] hover:bg-[#F3F3EF] dark:hover:bg-[#1B2622] transition-colors cursor-pointer"
          >
            {copiedSvg ? <Check className="w-3.5 h-3.5 text-[#0E5A43] dark:text-[#4AD192]" /> : null}
            <span>{copiedSvg ? 'SVG copied' : 'Copy SVG code'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPng}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] text-xs font-semibold text-[#111714] dark:text-[#EEF3F0] hover:bg-[#F3F3EF] dark:hover:bg-[#1B2622] transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadSvg}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0E5A43] hover:bg-[#0B4735] dark:bg-[#3DBE7C] dark:hover:bg-[#34A86D] text-white dark:text-[#071A11] text-xs font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download SVG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
