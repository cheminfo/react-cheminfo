import { expect, test } from 'vitest';

import type { SiteId } from '../sites.ts';
import { ECOSYSTEM_SITES, siteUrl } from '../sites.ts';

test('the family is the sixteen sites, listed once each', () => {
  const ids = ECOSYSTEM_SITES.map((site) => site.id);

  expect(ids).toStrictEqual([
    'inchi',
    'vcl',
    'smiles',
    'chemcalc',
    'nmrium',
    'derepflow',
    'surge',
    'tex',
    'lcao',
    'regexp',
    'pdb',
    'elucidation',
    'equilibrium',
    'polycarp',
    '3d',
    'periodic-table',
  ] satisfies SiteId[]);
});

test('this site is one of them', () => {
  const vcl = ECOSYSTEM_SITES.find((site) => site.id === 'vcl');

  expect(vcl?.host).toBe('vcl.cheminfo.org');
  expect(vcl && siteUrl(vcl)).toBe('https://vcl.cheminfo.org/');
});

test('every site is a distinct https address', () => {
  const hosts = ECOSYSTEM_SITES.map((site) => site.host);

  expect(new Set(hosts).size).toBe(16);

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

test('every site names the repository its sources live in', () => {
  const repositories = ECOSYSTEM_SITES.map((site) => site.repository);

  expect(new Set(repositories).size).toBe(16);

  // The repository is named verbatim, dots and suffixes included, because that
  // is also the package its own workflow publishes.
  expect(repositories).toContain(
    'https://github.com/cheminfo/periodic-table.cheminfo.org',
  );
  expect(repositories).toContain('https://github.com/cheminfo/chemcalc.org');
  expect(repositories).toContain('https://github.com/cheminfo/nmrium');

  for (const site of ECOSYSTEM_SITES) {
    expect(site.repository.startsWith('https://github.com/cheminfo/')).toBe(
      true,
    );
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

test('no site leads with a colour another one has already claimed', () => {
  // The tightest pair the family currently keeps is vcl and lcao, two blues at
  // 4.7. Anything closer than 4 reads as the same colour in a row of tiles.
  for (let i = 0; i < ECOSYSTEM_SITES.length; i++) {
    for (let j = i + 1; j < ECOSYSTEM_SITES.length; j++) {
      const one = ECOSYSTEM_SITES[i];
      const other = ECOSYSTEM_SITES[j];
      if (one === undefined || other === undefined) continue;

      expect({
        pair: `${one.id} / ${other.id}`,
        apart: difference(one.brand, other.brand) > 4,
      }).toStrictEqual({ pair: `${one.id} / ${other.id}`, apart: true });
    }
  }
});

test("a mark's answering element separates from the plate and from white", () => {
  // Most glyphs put the accent beside white shapes, so what keeps a mark from
  // collapsing at 16px is that its colour differs from both — a difference of
  // hue as much as of lightness, which is why this is not a contrast ratio.
  // The family's own floor is 30.6 from the plate and 19.1 from white.
  for (const site of ECOSYSTEM_SITES) {
    expect(difference(site.mark.accent, site.mark.plate)).toBeGreaterThan(25);
    expect(difference(site.mark.accent, '#ffffff')).toBeGreaterThan(15);
  }
});

// Oklab, so two colours are compared the way an eye compares them rather than
// by a distance through the sRGB cube, where blues crowd and greens spread.
function difference(one: string, other: string): number {
  const [oneL, oneA, oneB] = oklab(one);
  const [otherL, otherA, otherB] = oklab(other);
  return Math.hypot(oneL - otherL, oneA - otherA, oneB - otherB) * 100;
}

function oklab(color: string): [number, number, number] {
  const [red, green, blue] = [0, 1, 2].map((channel) =>
    linearChannel(color, channel),
  ) as [number, number, number];
  const long = Math.cbrt(
    0.412_221_470_8 * red + 0.536_332_536_3 * green + 0.051_445_992_9 * blue,
  );
  const medium = Math.cbrt(
    0.211_903_498_2 * red + 0.680_699_545_1 * green + 0.107_396_956_6 * blue,
  );
  const short = Math.cbrt(
    0.088_302_461_9 * red + 0.281_718_837_6 * green + 0.629_978_700_5 * blue,
  );
  return [
    0.210_454_255_3 * long + 0.793_617_785 * medium - 0.004_072_046_8 * short,
    1.977_998_495_1 * long - 2.428_592_205 * medium + 0.450_593_709_9 * short,
    0.025_904_037_1 * long + 0.782_771_766_2 * medium - 0.808_675_766 * short,
  ];
}

function contrastOnWhite(color: string): number {
  return 1.05 / (relativeLuminance(color) + 0.05);
}

function relativeLuminance(color: string): number {
  const weights = [0.2126, 0.7152, 0.0722];
  let luminance = 0;
  for (let channel = 0; channel < 3; channel++) {
    luminance += (weights[channel] ?? 0) * linearChannel(color, channel);
  }
  return luminance;
}

function linearChannel(color: string, channel: number): number {
  const offset = 1 + channel * 2;
  const value = Number.parseInt(color.slice(offset, offset + 2), 16) / 255;
  return value <= 0.039_28 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}
