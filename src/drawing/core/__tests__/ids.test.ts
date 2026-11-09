import { expect, test } from 'vitest';

import { createIdAllocator, identified, nextId } from '../ids.ts';

const drawing = {
  atoms: [{ id: 'a3' }, { id: 'a1' }],
  objects: [{ id: 't2' }, { id: 'g7' }],
  groups: [{ id: 'grp1', members: ['t2', 'g7'] }],
  outline: [{ x: 0, y: 0 }],
  style: { color: '#000000' },
};

test('every list a drawing holds is read for identifiers', () => {
  expect(identified(drawing).map((item) => item.id)).toStrictEqual([
    'a3',
    'a1',
    't2',
    'g7',
    'grp1',
  ]);
});

test('each kind counts on from the highest identifier the drawing holds', () => {
  const ids = createIdAllocator(drawing, { atom: 'a', text: 't', bond: 'b' });

  expect([ids.atom(), ids.atom(), ids.text(), ids.bond()]).toStrictEqual([
    'a4',
    'a5',
    't3',
    'b1',
  ]);
  expect(nextId(drawing, 'g')).toBe('g8');
  expect(nextId(drawing, 'grp')).toBe('grp2');
});
