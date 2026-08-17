import { expect, test } from 'vitest';

import { contrastRatio, readableInk, relativeLuminance } from '../contrast.ts';

test('luminance runs from black to white', () => {
  expect(relativeLuminance('#000000')).toBe(0);
  expect(relativeLuminance('#ffffff')).toBe(1);
  expect(relativeLuminance('#808080')).toBeCloseTo(0.2159, 4);
});

test('the three channels are weighted the way the eye reads them', () => {
  expect(relativeLuminance('#ff0000')).toBeCloseTo(0.2126, 4);
  expect(relativeLuminance('#00ff00')).toBeCloseTo(0.7152, 4);
  expect(relativeLuminance('#0000ff')).toBeCloseTo(0.0722, 4);
});

test('contrast reaches 21 for black on white and 1 for a colour on itself', () => {
  expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 10);
  expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 10);
  expect(contrastRatio('#2563eb', '#2563eb')).toBe(1);
});

test('the ink flips once the background is dark enough to need it', () => {
  expect(readableInk('#ffffff')).toBe('#182026');
  expect(readableInk('#b4de2c')).toBe('#182026');
  expect(readableInk('#440154')).toBe('#ffffff');
  expect(readableInk('#000000')).toBe('#ffffff');
});

test('the chosen ink is always the one with the higher contrast', () => {
  for (const background of ['#ffffff', '#b4de2c', '#31688e', '#440154']) {
    const ink = readableInk(background);
    const other = ink === '#ffffff' ? '#182026' : '#ffffff';

    expect(contrastRatio(background, ink)).toBeGreaterThanOrEqual(
      contrastRatio(background, other),
    );
  }
});

test('a site may name its own pair of inks', () => {
  expect(readableInk('#ffffff', { dark: '#1a2733', light: '#fff' })).toBe(
    '#1a2733',
  );
  expect(readableInk('#1c3d6e', { dark: '#1a2733', light: '#fff' })).toBe(
    '#fff',
  );
});

test('a colour the parser cannot read throws rather than being guessed at', () => {
  expect(() => relativeLuminance('teal')).toThrow('not a hex colour: teal');
  expect(() => contrastRatio('#fff', 'teal')).toThrow('not a hex colour: teal');
});
