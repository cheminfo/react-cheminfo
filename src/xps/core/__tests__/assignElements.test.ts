import { expect, test } from 'vitest';

import type { ElementCandidate } from '../assignElements.ts';
import {
  assignElements,
  assignSpectrum,
  countedElements,
} from '../assignElements.ts';
import type { ReferenceLevel } from '../referenceLevels.ts';
import { referenceEnergies, referenceLevels } from '../referenceLevels.ts';
import type { XpsPeak } from '../xpsSpectrum.ts';

/**
 * One candidate, spelled out for the counting tests.
 * @param element - Element symbol.
 * @param orbital - The level.
 * @param bindingEnergy - Where the published level sits, in eV.
 * @returns The candidate, sitting exactly on its reference.
 */
function candidate(
  element: string,
  orbital: string,
  bindingEnergy: number,
): ElementCandidate {
  return { element, orbital, bindingEnergy, delta: 0 };
}

/**
 * One picked peak, with only what the assignment reads filled in.
 * @param id - Identity.
 * @param bindingEnergy - Where it sits, in eV.
 * @returns The peak.
 */
function peak(id: string, bindingEnergy: number): XpsPeak {
  return { id, bindingEnergy, intensity: 1000, width: 1 };
}

test('the reference table is sorted, distinct and parallel to its axis', () => {
  expect(referenceEnergies).toHaveLength(referenceLevels.length);

  const keys = new Set<string>();
  for (let index = 0; index < referenceLevels.length; index++) {
    const level = referenceLevels[index] as ReferenceLevel;
    keys.add(`${level.element} ${level.orbital} ${level.bindingEnergy}`);

    expect(referenceEnergies[index]).toBe(level.bindingEnergy);
  }

  for (let index = 1; index < referenceEnergies.length; index++) {
    expect(referenceEnergies[index]).toBeGreaterThanOrEqual(
      referenceEnergies[index - 1] as number,
    );
  }

  expect(keys.size).toBe(referenceLevels.length);
});

test('a peak at the published carbon line is carbon, exactly on it', () => {
  const candidates = assignElements(284);

  expect(candidates[0]).toStrictEqual({
    element: 'C',
    orbital: '1s',
    bindingEnergy: 284,
    delta: 0,
  });
  // Two, not the five levels the table holds within the window: the Eu 4p1/2
  // and the two Tb 4p among them are minor lines, and a minor line is not an
  // answer to what a peak is.
  expect(candidates).toHaveLength(2);
});

test('the candidates are ranked by strength, and by distance within it', () => {
  const candidates = assignElements(284.8, { tolerance: 3, limit: 20 });

  // C 1s is a principal line and Ru 3d3/2 the weaker partner of one, so the
  // carbon comes first even though the two sit the same distance away.
  expect(
    candidates.map((found) => `${found.element} ${found.orbital}`),
  ).toStrictEqual(['C 1s', 'Ru 3d3/2']);

  const everyLevel = assignElements(284.8, {
    tolerance: 3,
    limit: 20,
    minimumStrength: 2,
  });

  expect(
    everyLevel.map((found) => `${found.element} ${found.orbital}`),
  ).toStrictEqual(['C 1s', 'Ru 3d3/2', 'Eu 4p1/2', 'Tb 4p3/2', 'Tb 4p']);

  // Within one strength the nearest still comes first.
  for (let index = 1; index < candidates.length; index++) {
    const previous = candidates[index - 1] as ElementCandidate;
    const current = candidates[index] as ElementCandidate;

    expect(Math.abs(current.delta)).toBeGreaterThanOrEqual(
      Math.abs(previous.delta),
    );
  }
});

test('the shift is signed the way a chemical shift is quoted', () => {
  const above = assignElements(284.5, { tolerance: 1, limit: 1 });
  const below = assignElements(283.5, { tolerance: 1, limit: 1 });

  expect(above[0]?.element).toBe('C');
  expect(above[0]?.delta).toBeCloseTo(0.5, 10);
  expect(below[0]?.element).toBe('C');
  expect(below[0]?.delta).toBeCloseTo(-0.5, 10);
});

test('the limit keeps the closest candidates and no more', () => {
  expect(assignElements(284, { limit: 1 })).toHaveLength(1);
  expect(assignElements(284, { limit: 2 })).toHaveLength(2);
  expect(assignElements(284, { limit: 0 })).toStrictEqual([]);
});

test('a window nothing falls in answers nothing', () => {
  expect(assignElements(284, { tolerance: 0 })).toStrictEqual([]);
  expect(assignElements(1e9)).toStrictEqual([]);
  expect(assignElements(-1000)).toStrictEqual([]);
  expect(assignElements(Number.NaN)).toStrictEqual([]);
});

test('a spectrum is assigned peak by peak and misses are left out', () => {
  const assignments = assignSpectrum([
    peak('carbon', 284),
    peak('oxygen', 532),
    peak('nothing', 1e9),
  ]);

  expect(assignments.size).toBe(2);
  expect(assignments.get('carbon')?.[0]?.element).toBe('C');
  expect(assignments.get('oxygen')?.[0]?.element).toBe('O');
  expect(assignments.get('nothing')).toBeUndefined();
});

test('the summary counts an element once per peak, most seen first', () => {
  const assignments = new Map<string, ElementCandidate[]>([
    ['a', [candidate('C', '1s', 284), candidate('Ru', '3d3/2', 284)]],
    ['b', [candidate('C', '1s', 284)]],
    ['c', [candidate('O', '1s', 532)]],
  ]);

  expect(countedElements(assignments)).toStrictEqual([
    { element: 'C', peaks: 2 },
    { element: 'O', peaks: 1 },
    { element: 'Ru', peaks: 1 },
  ]);
});

test('two levels of one element on one peak are still one peak', () => {
  const assignments = new Map<string, ElementCandidate[]>([
    ['a', [candidate('C', '1s', 284), candidate('C', '2s', 284)]],
  ]);

  expect(countedElements(assignments)).toStrictEqual([
    { element: 'C', peaks: 1 },
  ]);
});

test('nothing assigned summarises to nothing', () => {
  expect(countedElements(new Map())).toStrictEqual([]);
});
