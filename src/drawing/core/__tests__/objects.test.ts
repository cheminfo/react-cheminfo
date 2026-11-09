import { expect, test } from 'vitest';

import {
  isObjectOf,
  mapObjects,
  objectOf,
  objectsOf,
  onlySelectedOf,
  replaceObject,
  selectedIdsOf,
  selectedOf,
  updateObject,
  withObjectsOf,
} from '../objects.ts';

interface Note {
  type: 'note';
  id: string;
  text: string;
}
interface Mark {
  type: 'mark';
  id: string;
  x: number;
}
type Item = Note | Mark;

function drawing(): { objects: Item[] } {
  return {
    objects: [
      { type: 'note', id: 'n1', text: 'a' },
      { type: 'mark', id: 'm1', x: 1 },
      { type: 'note', id: 'n2', text: 'b' },
    ],
  };
}

test('objects of a type are found, and narrowed, in the order they are drawn', () => {
  const notes = objectsOf(drawing(), 'note');

  expect(notes.map((note) => note.text)).toStrictEqual(['a', 'b']);
  expect(objectOf(drawing(), 'mark', 'm1')?.x).toBe(1);
  expect(objectOf(drawing(), 'note', 'm1')).toBeUndefined();
  expect(isObjectOf(drawing().objects[1], 'mark')).toBe(true);
});

test('the selection picks objects by type', () => {
  const selection = { objects: ['n2', 'm1'] };

  expect(selectedOf(drawing(), selection, 'note')).toStrictEqual([
    { type: 'note', id: 'n2', text: 'b' },
  ]);
  expect(selectedIdsOf(drawing(), selection, 'mark')).toStrictEqual(['m1']);
});

test('one object is the selection only when every list of it holds that one alone', () => {
  const alone = { objects: ['m1'], atoms: [] as string[] };

  expect(onlySelectedOf(drawing(), alone, 'mark')?.id).toBe('m1');

  const withAtom = { objects: ['m1'], atoms: ['a1'] };

  expect(onlySelectedOf(drawing(), withAtom, 'mark')).toBeUndefined();
  expect(
    onlySelectedOf(drawing(), { objects: ['m1', 'n1'] }, 'mark'),
  ).toBeUndefined();
});

test('objects are replaced and changed in their places', () => {
  const replaced = replaceObject(drawing(), {
    type: 'note',
    id: 'n1',
    text: 'z',
  });

  expect(replaced.objects.map((item) => item.id)).toStrictEqual([
    'n1',
    'm1',
    'n2',
  ]);
  expect(objectOf(replaced, 'note', 'n1')?.text).toBe('z');

  const moved = mapObjects(drawing(), 'mark', (mark) => ({ ...mark, x: 5 }));

  expect(objectOf(moved, 'mark', 'm1')?.x).toBe(5);

  const renamed = updateObject(drawing(), 'note', 'n2', (note) => ({
    ...note,
    text: 'c',
  }));

  expect(objectsOf(renamed, 'note').map((note) => note.text)).toStrictEqual([
    'a',
    'c',
  ]);
});

test('the objects of a type are swapped for others, those beyond on top', () => {
  const next = withObjectsOf(drawing(), 'note', [
    { type: 'note', id: 'n3', text: 'c' },
    { type: 'note', id: 'n4', text: 'd' },
    { type: 'note', id: 'n5', text: 'e' },
  ]);

  expect(next.objects.map((item) => item.id)).toStrictEqual([
    'n3',
    'm1',
    'n4',
    'n5',
  ]);
});
