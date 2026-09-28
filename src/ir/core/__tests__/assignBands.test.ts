import { expect, test } from 'vitest';

import { assignBands, bandLabel, countAssigned } from '../assignBands.ts';
import { BAND_ASSIGNMENTS } from '../bandAssignments.ts';
import type { IrBand, IrBandStrength } from '../irBand.ts';

/**
 * One band, of the little of it an assignment needs.
 * @param wavenumber - Where it sits.
 * @param strength - How strong it is. Defaults to strong.
 * @returns The band.
 */
function band(wavenumber: number, strength: IrBandStrength = 'S'): IrBand {
  return {
    spectrumId: 'film',
    wavenumber,
    absorbance: 0.5,
    transmittance: 32,
    strength,
  };
}

test('a carbonyl at 1715 is offered every carbonyl it could be', () => {
  const [assigned] = assignBands([band(1715)]);
  const groups = assigned?.candidates.map((candidate) => candidate.group) ?? [];

  expect(groups).toContain('ketone');
  expect(groups).toContain('carboxylic acid');
  expect(groups).toContain('aldehyde');
  // An ester sits at 1735 and up and an anhydride higher still, so neither is
  // offered twenty wavenumbers early.
  expect(groups).not.toContain('ester');
  expect(groups).not.toContain('anhydride');
});

test('the narrowest claim reads first, being the most specific', () => {
  const [assigned] = assignBands([band(1715)]);

  // The ketone's twenty-wavenumber window is a tighter claim than the acid's
  // twenty-five, which is tighter again than the amide's sixty.
  expect(assigned?.candidates.map((one) => one.group)).toStrictEqual([
    'ketone',
    'aldehyde',
    'carboxylic acid',
  ]);
});

test('a band just outside a range is still offered it', () => {
  // A ketone runs 1705–1725; a real one at 1703 is still a ketone.
  const [tight] = assignBands([band(1703)], { tolerance: 0 });
  const [loose] = assignBands([band(1703)]);

  expect(tight?.candidates.map((one) => one.group)).not.toContain('ketone');
  expect(loose?.candidates.map((one) => one.group)).toContain('ketone');
});

test('a band in the fingerprint silence is assigned nothing, and says so', () => {
  const [assigned] = assignBands([band(1900)]);

  expect(assigned?.candidates).toStrictEqual([]);
  expect(bandLabel(assigned as never)).toBeNull();
});

test('a nitrile is named where almost nothing else absorbs', () => {
  const [assigned] = assignBands([band(2240, 'm')]);

  expect(bandLabel(assigned as never)).toBe('nitrile C≡N stretch');
});

test('a strength mismatch is kept by default and can be filtered out', () => {
  const weakCarbonyl = [band(1715, 'w')];

  expect(assignBands(weakCarbonyl)[0]?.candidates.length).toBeGreaterThan(0);
  expect(
    assignBands(weakCarbonyl, { keepStrengthMismatch: false })[0]?.candidates,
  ).toStrictEqual([]);
});

test('the assigned count is bands with a candidate, not candidates', () => {
  const assigned = assignBands([band(1715), band(1900), band(3350)]);

  expect(assigned).toHaveLength(3);
  expect(countAssigned(assigned)).toBe(2);
});

test('every range in the table is the right way round and plausible', () => {
  const wrong = BAND_ASSIGNMENTS.filter(
    (assignment) =>
      assignment.from >= assignment.to ||
      assignment.from < 400 ||
      assignment.to > 4000,
  );

  expect(wrong).toStrictEqual([]);
});

test('the table has no duplicate identities', () => {
  const ids = new Set(BAND_ASSIGNMENTS.map((assignment) => assignment.id));

  expect(ids.size).toBe(BAND_ASSIGNMENTS.length);
});
