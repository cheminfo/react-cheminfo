import { expect, test } from 'vitest';

import {
  mergeScatterSelection,
  scatterSelectedIndices,
  scatterSelectionMask,
} from '../scatterSelection.ts';

const base = new Uint8Array([1, 1, 0, 0, 0, 0]);
const hits = new Uint8Array([0, 1, 1, 0, 0, 0]);

test('replace keeps only what the gesture caught', () => {
  expect(mergeScatterSelection(base, hits, 'replace')).toStrictEqual(
    new Uint8Array([0, 1, 1, 0, 0, 0]),
  );
});

test('add sets what the gesture caught beside what was there', () => {
  expect(mergeScatterSelection(base, hits, 'add')).toStrictEqual(
    new Uint8Array([1, 1, 1, 0, 0, 0]),
  );
});

test('remove clears what the gesture caught', () => {
  expect(mergeScatterSelection(base, hits, 'remove')).toStrictEqual(
    new Uint8Array([1, 0, 0, 0, 0, 0]),
  );
});

test('every entry written is a zero or a one whatever went in', () => {
  const loose = new Uint8Array([7, 0, 255, 0, 0, 0]);

  expect(mergeScatterSelection(loose, hits, 'add')).toStrictEqual(
    new Uint8Array([1, 1, 1, 0, 0, 0]),
  );
  expect(mergeScatterSelection(base, loose, 'replace')).toStrictEqual(
    new Uint8Array([1, 0, 1, 0, 0, 0]),
  );
});

test('a mask of the right length is written into rather than replaced', () => {
  const into = new Uint8Array([1, 1, 1, 1, 1, 1]);
  const merged = mergeScatterSelection(base, hits, 'replace', into);

  expect(merged).toBe(into);
  expect(merged).toStrictEqual(new Uint8Array([0, 1, 1, 0, 0, 0]));
});

test('a mask of the wrong length is replaced rather than written into', () => {
  const wrong = new Uint8Array(2);
  const merged = mergeScatterSelection(base, hits, 'add', wrong);

  expect(merged).not.toBe(wrong);
  expect(merged).toStrictEqual(new Uint8Array([1, 1, 1, 0, 0, 0]));
});

test('a short set of hits leaves the points past its end alone', () => {
  const short = new Uint8Array([1, 0]);

  expect(mergeScatterSelection(base, short, 'add')).toStrictEqual(
    new Uint8Array([1, 1, 0, 0, 0, 0]),
  );
  expect(mergeScatterSelection(base, short, 'replace')).toStrictEqual(
    new Uint8Array([1, 0, 0, 0, 0, 0]),
  );
});

test('a mask is built from the indices it holds', () => {
  expect(scatterSelectionMask([0, 5], 6)).toStrictEqual(
    new Uint8Array([1, 0, 0, 0, 0, 1]),
  );
});

test('an index outside the cloud is dropped rather than throwing', () => {
  expect(scatterSelectionMask([0, 5, -1, 99], 6)).toStrictEqual(
    new Uint8Array([1, 0, 0, 0, 0, 1]),
  );
  expect(scatterSelectionMask([1.5, Number.NaN, 2], 4)).toStrictEqual(
    new Uint8Array([0, 0, 1, 0]),
  );
  expect(scatterSelectionMask([0], Number.NaN)).toStrictEqual(
    new Uint8Array(0),
  );
  expect(scatterSelectionMask([0], -3)).toStrictEqual(new Uint8Array(0));
});

test('a repeated index sets the same point once', () => {
  expect(scatterSelectionMask([2, 2, 2], 3)).toStrictEqual(
    new Uint8Array([0, 0, 1]),
  );
});

test('a mask reads back as the ascending indices it selected', () => {
  expect(
    scatterSelectedIndices(new Uint8Array([1, 0, 0, 0, 0, 1])),
  ).toStrictEqual([0, 5]);
  expect(scatterSelectedIndices(new Uint8Array([0, 0, 0]))).toStrictEqual([]);
  expect(scatterSelectedIndices(new Uint8Array([7, 0, 255]))).toStrictEqual([
    0, 2,
  ]);
});

test('indices and mask round-trip through each other', () => {
  const mask = mergeScatterSelection(base, hits, 'add');
  const indices = scatterSelectedIndices(mask);

  expect(indices).toStrictEqual([0, 1, 2]);
  expect(scatterSelectionMask(indices, mask.length)).toStrictEqual(mask);
});
