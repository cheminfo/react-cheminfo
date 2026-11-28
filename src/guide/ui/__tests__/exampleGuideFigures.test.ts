import { expect, test } from 'vitest';

import type {
  EmptyGuideFigure,
  EmptyGuideFigureStack,
} from '../GuideFigures.tsx';
import {
  exampleGuideFigures,
  guideFigureLookup,
} from '../exampleGuideFigures.ts';

const figureOf = guideFigureLookup({
  './figures/benzene.svg': '/assets/benzene.svg',
  './figures/glucose.svg': '/assets/glucose.svg',
  './figures/caffeine.svg': '/assets/caffeine.svg',
});

test('a figure is found by the example’s id, and none for an example without', () => {
  expect(figureOf('benzene')).toBe('/assets/benzene.svg');
  expect(figureOf('missing')).toBeUndefined();
});

test('the first figure takes half the room, the others stack beside it', () => {
  const opened: string[] = [];
  const layout = exampleGuideFigures(
    [
      { id: 'benzene' },
      { id: 'missing' },
      { id: 'glucose' },
      { id: 'caffeine' },
    ],
    {
      src: (example) => figureOf(example.id),
      name: (example) => example.id,
      open: (example) => opened.push(example.id),
    },
  );

  expect(layout).toHaveLength(2);

  const [first, rest] = layout as [EmptyGuideFigure, EmptyGuideFigureStack];

  expect(first).toMatchObject({
    src: '/assets/benzene.svg',
    alt: 'benzene',
    title: 'Open the example “benzene”',
  });
  expect(rest.stack.map((figure) => figure.alt)).toStrictEqual([
    'glucose',
    'caffeine',
  ]);

  rest.stack[1]?.onSelect?.();

  expect(opened).toStrictEqual(['caffeine']);
});

test('no figure gives no layout', () => {
  expect(
    exampleGuideFigures([{ id: 'missing' }], {
      src: (example) => figureOf(example.id),
      name: (example) => example.id,
      open: () => undefined,
    }),
  ).toStrictEqual([]);
});
