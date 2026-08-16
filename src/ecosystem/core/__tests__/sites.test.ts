import { expect, test } from 'vitest';

import type { SiteId } from '../sites.ts';
import { ECOSYSTEM_SITES, siteUrl } from '../sites.ts';

test('the family is the ten sites, listed once each', () => {
  const ids = ECOSYSTEM_SITES.map((site) => site.id);

  expect(ids).toStrictEqual([
    'inchi',
    'vcl',
    'smiles',
    'chemcalc',
    'nmrium',
    'surge',
    'tex',
    'lcao',
    'regexp',
    'pdb',
  ] satisfies SiteId[]);
});

test('this site is one of them', () => {
  const vcl = ECOSYSTEM_SITES.find((site) => site.id === 'vcl');

  expect(vcl?.host).toBe('vcl.cheminfo.org');
  expect(vcl && siteUrl(vcl)).toBe('https://vcl.cheminfo.org/');
});

test('every site is a distinct https address', () => {
  const hosts = ECOSYSTEM_SITES.map((site) => site.host);

  expect(new Set(hosts).size).toBe(10);

  for (const site of ECOSYSTEM_SITES) {
    expect(siteUrl(site)).toBe(`https://${site.host}/`);
  }
});

test('every site owns two colours for its name and two for its mark', () => {
  for (const site of ECOSYSTEM_SITES) {
    for (const color of [
      site.brand,
      site.brandAlt,
      site.mark.plate,
      site.mark.accent,
    ]) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/);
    }

    expect(site.brandAlt).not.toBe(site.brand);
    expect(site.mark.accent).not.toBe(site.mark.plate);
  }
});

test('both halves of a name are readable on white', () => {
  for (const site of ECOSYSTEM_SITES) {
    // 3:1, which is what a name set at 15px bold asks for. Two sites keep an
    // official colour that lands just under the 4.5:1 of body text.
    expect(contrastOnWhite(site.brand)).toBeGreaterThan(3);
    expect(contrastOnWhite(site.brandAlt)).toBeGreaterThan(3);
  }
});

function contrastOnWhite(color: string): number {
  return 1.05 / (relativeLuminance(color) + 0.05);
}

function relativeLuminance(color: string): number {
  const weights = [0.2126, 0.7152, 0.0722];
  let luminance = 0;
  for (let channel = 0; channel < 3; channel++) {
    const offset = 1 + channel * 2;
    const value = Number.parseInt(color.slice(offset, offset + 2), 16) / 255;
    const linear =
      value <= 0.039_28 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    luminance += (weights[channel] ?? 0) * linear;
  }
  return luminance;
}
