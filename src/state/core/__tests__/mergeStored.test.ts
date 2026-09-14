import { expect, test } from 'vitest';

import { isPlainRecord, mergeStored } from '../mergeStored.ts';

function defaults() {
  return {
    quality: 'standard',
    peaks: true,
    selectedAtom: null as number | null,
    tags: ['a'],
    flags: { sigma: true, pi: true },
    byExercise: {} as Record<string, { attempts: number }>,
  };
}

test('nothing stored gives back every default', () => {
  expect(mergeStored(defaults(), undefined)).toStrictEqual({
    quality: 'standard',
    peaks: true,
    selectedAtom: null,
    tags: ['a'],
    flags: { sigma: true, pi: true },
    byExercise: {},
  });
});

test('a stored payload lands on top of the defaults, field by field', () => {
  expect(
    mergeStored(defaults(), {
      quality: 'high',
      tags: ['b', 'c'],
      flags: { pi: false },
    }),
  ).toStrictEqual({
    quality: 'high',
    peaks: true,
    selectedAtom: null,
    tags: ['b', 'c'],
    flags: { sigma: true, pi: false },
    byExercise: {},
  });
});

test('a field of the wrong shape is discarded, its neighbours are not', () => {
  expect(
    mergeStored(defaults(), {
      quality: 3,
      peaks: 'yes',
      tags: { 0: 'a' },
      flags: 'nope',
      selectedAtom: 7,
    }),
  ).toStrictEqual({
    quality: 'standard',
    peaks: true,
    selectedAtom: 7,
    tags: ['a'],
    flags: { sigma: true, pi: true },
    byExercise: {},
  });
});

test('a null default accepts anything, including a stored null', () => {
  expect(mergeStored(defaults(), { selectedAtom: 4 }).selectedAtom).toBe(4);
  expect(
    mergeStored(defaults(), { selectedAtom: null }).selectedAtom,
  ).toBeNull();
  expect(mergeStored(defaults(), { quality: null }).quality).toBe('standard');
});

test('a key the defaults do not name survives, so a dictionary is kept whole', () => {
  expect(
    mergeStored(defaults(), {
      byExercise: { alkanes: { attempts: 2 }, alkenes: { attempts: 1 } },
      retired: 'kept',
    }),
  ).toStrictEqual({
    quality: 'standard',
    peaks: true,
    selectedAtom: null,
    tags: ['a'],
    flags: { sigma: true, pi: true },
    byExercise: { alkanes: { attempts: 2 }, alkenes: { attempts: 1 } },
    retired: 'kept',
  });
});

test('a stored value that is not an object is discarded whole', () => {
  const fallback = mergeStored(defaults(), ['high']);

  expect(fallback.quality).toBe('standard');
  expect(mergeStored(defaults(), 12).tags).toStrictEqual(['a']);
  expect(mergeStored(defaults(), null).flags).toStrictEqual({
    sigma: true,
    pi: true,
  });
});

test('the merged value shares no object with the defaults', () => {
  const original = defaults();
  const merged = mergeStored(original, { quality: 'high' });
  merged.flags.pi = false;
  merged.tags.push('z');
  merged.byExercise.alkanes = { attempts: 1 };

  expect(original.flags).toStrictEqual({ sigma: true, pi: true });
  expect(original.tags).toStrictEqual(['a']);
  expect(original.byExercise).toStrictEqual({});
});

test('isPlainRecord accepts an object and refuses an array, null and a primitive', () => {
  expect(isPlainRecord({ a: 1 })).toBe(true);
  expect(isPlainRecord([])).toBe(false);
  expect(isPlainRecord(null)).toBe(false);
  expect(isPlainRecord('a')).toBe(false);
});
