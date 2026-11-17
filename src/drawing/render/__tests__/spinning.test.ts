import { expect, test } from 'vitest';

import type { PathPrimitive, Primitive } from '../primitives.ts';
import { spinClass, spinRuns } from '../spinning.ts';

function path(d: string, extra: Partial<PathPrimitive> = {}): PathPrimitive {
  return { kind: 'path', d, width: 1, extent: [], ...extra };
}

function shapeOf(runs: ReturnType<typeof spinRuns>) {
  return runs.map(({ spins, primitives }) => ({
    spins,
    paths: primitives.map((one) => (one.kind === 'path' ? one.d : one.kind)),
  }));
}

test('primitives are cut where what spins starts, stops or changes way, in their order', () => {
  const primitives: Primitive[] = [
    path('M0 0'),
    { kind: 'dot', x: 0, y: 0, r: 1 },
    path('M1 1', { spins: 'clockwise' }),
    path('M2 2', { spins: 'clockwise' }),
    path('M3 3', { spins: 'anticlockwise' }),
    path('M4 4'),
  ];

  expect(shapeOf(spinRuns(primitives))).toStrictEqual([
    { spins: undefined, paths: ['M0 0', 'dot'] },
    { spins: 'clockwise', paths: ['M1 1', 'M2 2'] },
    { spins: 'anticlockwise', paths: ['M3 3'] },
    { spins: undefined, paths: ['M4 4'] },
  ]);
  expect(spinRuns([])).toStrictEqual([]);
});

test('a rotor spinning back carries the class that reverses it', () => {
  expect(spinClass('clockwise')).toBe('glass-spinning');
  expect(spinClass('anticlockwise')).toBe('glass-spinning glass-spinning-back');
});
