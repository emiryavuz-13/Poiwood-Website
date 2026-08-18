import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import Logo from './Logo';

// clipPath kimliği useId ile üretiliyor. Tanımlanan id ile ona yapılan referans
// birbirini tutmazsa çıtalar kırpılamaz ve işaret ekranda görünmez olur.
function assertClipPathResolves(container) {
  const svg = container.querySelector('svg');
  const clipPath = svg.querySelector('clipPath');
  const consumer = svg.querySelector('[clip-path]');

  expect(clipPath).not.toBeNull();
  expect(consumer).not.toBeNull();
  expect(clipPath.id).not.toContain(':');
  expect(consumer.getAttribute('clip-path')).toBe(`url(#${clipPath.id})`);
}

describe('Logo', () => {
  test('kırpma yolu kimliği referansıyla eşleşir', () => {
    const { container } = render(<Logo />);
    assertClipPathResolves(container);
  });

  test('aynı sayfadaki iki logo çakışmayan kimlikler alır', () => {
    const { container } = render(
      <>
        <Logo />
        <Logo variant="light" />
      </>
    );
    const ids = [...container.querySelectorAll('clipPath')].map((node) => node.id);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });

  test('showWordmark yazıyı ekler, varsayılanda eklemez', () => {
    const { queryByText } = render(<Logo />);
    expect(queryByText('Panelistan')).toBeNull();

    const { getByText } = render(<Logo showWordmark />);
    expect(getByText('Panelistan')).toBeTruthy();
  });

  test('koyu zemin varyantı açık renkli çerçeve kullanır', () => {
    const { container } = render(<Logo variant="light" />);
    const stroked = container.querySelector('g[stroke]');
    expect(stroked.getAttribute('stroke')).toBe('#E8D5C4');
  });
});
