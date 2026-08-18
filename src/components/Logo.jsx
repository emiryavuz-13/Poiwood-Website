import React, { useId } from 'react';
import { cn } from '../lib/utils';

// Aydınlık ve koyu zemin için iki renk kurgusu. Tonların tamamı tailwind.config.js paletinden.
const PALETTE = {
  dark: { frame: '#3D2914', slatA: '#8B5A2B', slatB: '#C67D4A', wordmark: '#3D2914' },
  light: { frame: '#E8D5C4', slatA: '#C67D4A', slatB: '#D4A574', wordmark: '#FAF6F0' },
};

/**
 * Panelistan marka işareti: 45° kaydırılmış iki kareden oluşan sekiz köşeli yıldız
 * ve ortada kare boşluk bırakan dört çıtalık örgü. Çıta tek kez tanımlanıp
 * 90°'lik dönüşlerle tekrarlanır.
 *
 * @param {'dark'|'light'} variant  Zemin rengine göre seçilir: aydınlık zeminde 'dark'.
 * @param {boolean} showWordmark    Yanına "Panelistan" yazısını ekler.
 */
const Logo = ({
  variant = 'dark',
  showWordmark = false,
  className,
  markClassName,
  wordmarkClassName,
}) => {
  // Aynı sayfada birden fazla logo bulunabilir; kırpma yolu kimliği benzersiz olmalı.
  // useId ":r0:" gibi iki nokta içerir — url(#...) referansında sorun çıkarmasın diye ayıklanır.
  const clipId = `pnl-star-${useId().replace(/:/g, '')}`;
  const { frame, slatA, slatB, wordmark } = PALETTE[variant] ?? PALETTE.dark;

  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <svg
        viewBox="0 0 64 64"
        fill="none"
        role="img"
        aria-label="Panelistan"
        className={cn('w-9 h-9 shrink-0', markClassName)}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x="12" y="12" width="40" height="40" rx="2.5" />
            <rect x="12" y="12" width="40" height="40" rx="2.5" transform="rotate(45 32 32)" />
          </clipPath>
        </defs>

        <g clipPath={`url(#${clipId})`}>
          <g transform="rotate(45 32 32)">
            <rect x="-2" y="12.5" width="39.2" height="13" fill={slatA} />
            <rect x="-2" y="12.5" width="39.2" height="13" fill={slatB} transform="rotate(90 32 32)" />
            <rect x="-2" y="12.5" width="39.2" height="13" fill={slatA} transform="rotate(180 32 32)" />
            <rect x="-2" y="12.5" width="39.2" height="13" fill={slatB} transform="rotate(270 32 32)" />
          </g>
        </g>

        <g stroke={frame} strokeWidth="3.2" strokeLinejoin="round">
          <rect x="12" y="12" width="40" height="40" rx="2.5" />
          <rect x="12" y="12" width="40" height="40" rx="2.5" transform="rotate(45 32 32)" />
        </g>
      </svg>

      {showWordmark && (
        <span
          className={cn('font-heading font-bold text-[1.75rem] leading-none', wordmarkClassName)}
          style={{ color: wordmark }}
        >
          Panelistan
        </span>
      )}
    </span>
  );
};

export default Logo;
