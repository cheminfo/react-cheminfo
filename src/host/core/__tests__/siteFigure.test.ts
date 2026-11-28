/**
 * An editor's figure carries its document, opens it again, refuses a figure
 * of another version or one holding nothing, and is handed to a host.
 */

import { expect, test } from 'vitest';

import { withFigureSource } from '../../../download/core/figureSource.ts';
import { CHROME_CATALOG } from '../../../i18n/core/chromeCatalog.ts';
import type { LoadedInput } from '../selectInputs.ts';
import { createSiteFigure } from '../siteFigure.ts';

interface Bench {
  pieces: string[];
}

const FIGURE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"><rect width="40" height="20"/></svg>';

function stopNothing(): undefined {
  return undefined;
}

function readBench(value: unknown): Bench | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  const { pieces } = value as { pieces?: unknown };
  return Array.isArray(pieces) ? { pieces: pieces.map(String) } : undefined;
}

/**
 * A bench on screen, and its figure.
 * @param pieces - What the bench holds.
 * @returns The figure, what was opened and the listeners.
 */
function bench(pieces: string[]) {
  let shown: Bench = { pieces };
  const opened: Array<{ bench: Bench; forget: boolean }> = [];
  const listeners = new Set<(value: Bench) => void>();
  const figure = createSiteFigure<Bench>({
    site: 'mechanics',
    document: {
      peek: () => shown,
      subscribe: (listener) => {
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
        };
      },
    },
    read: readBench,
    isEmpty: (value) => value.pieces.length === 0,
    open: (value, { forget }) => {
      shown = value;
      opened.push({ bench: value, forget });
    },
    emptyMessage: 'This figure holds no bench.',
    draw: () => ({ markup: FIGURE, width: 40, height: 20 }),
  });
  return { figure, opened, listeners };
}

test('a figure carries the document on screen, and nothing for an empty one', () => {
  expect(bench(['spring']).figure.figureState()).toStrictEqual({
    data: { version: 1, value: { pieces: ['spring'] } },
  });
  expect(bench([]).figure.figureState()).toBeUndefined();
});

test('a figure of this version opens, another version or an empty one is refused', () => {
  const { figure, opened } = bench([]);
  figure.openFigure({ data: { version: 1, value: { pieces: ['mass'] } } });

  expect(opened).toStrictEqual([
    { bench: { pieces: ['mass'] }, forget: false },
  ]);
  expect(() =>
    figure.documentOf({ data: { version: 2, value: { pieces: [] } } }),
  ).toThrow(
    'This figure was saved by another version of mechanics.cheminfo.org.',
  );
  expect(() => figure.documentOf({ data: { version: 1, value: 7 } })).toThrow(
    'This figure holds no bench.',
  );
});

test('a refusal is said in the page’s language', async () => {
  await CHROME_CATALOG.load('fr');
  const figure = createSiteFigure<Bench>({
    site: 'optics',
    host: 'optics.cheminfo.org',
    version: 3,
    document: {
      peek: () => ({ pieces: [] }),
      subscribe: () => stopNothing,
    },
    read: readBench,
    isEmpty: () => true,
    open: () => undefined,
    emptyMessage: 'Cette figure ne contient aucun banc.',
    language: () => 'fr',
  });

  expect(() => figure.documentOf({ data: { version: 1, value: {} } })).toThrow(
    'Cette figure a été enregistrée par une autre version de optics.cheminfo.org.',
  );
});

test('a figure a host hands over opens with nothing to undo, and a paste reads its document', async () => {
  const svg = await withFigureSource(FIGURE, {
    site: 'mechanics',
    href: 'https://mechanics.cheminfo.org/',
    data: { version: 1, value: { pieces: ['pulley'] } },
  });
  const { figure, opened } = bench([]);
  const handed: LoadedInput[] = [
    {
      key: 'figure',
      item: { key: 'figure', kind: 'image.svg', value: { svg } },
      checked: { kind: 'image.svg', value: { svg } },
    },
  ];
  await figure.loadFromHost(handed);
  await figure.loadFromHost([]);

  expect(opened).toStrictEqual([
    { bench: { pieces: ['pulley'] }, forget: true },
  ]);
  await expect(figure.readSvg(svg)).resolves.toStrictEqual({
    pieces: ['pulley'],
  });
  await expect(figure.readSvg(FIGURE)).resolves.toBeUndefined();
});

test('the figure is written with its markup, and handed to a host unless empty', async () => {
  const { figure, listeners } = bench(['spring']);

  await expect(figure.writeFigure()).resolves.toStrictEqual({
    markup: FIGURE,
    width: 40,
    height: 20,
  });
  await expect(figure.hostOutputs.render?.figure?.()).resolves.toStrictEqual({
    key: 'figure',
    kind: 'image.svg',
    value: { svg: FIGURE },
  });
  expect(figure.hostOutputs.read()).toStrictEqual([]);

  let heard = 0;
  const stop = figure.hostOutputs.subscribe(() => {
    heard += 1;
  });
  for (const listener of listeners) listener({ pieces: [] });
  stop();

  expect(heard).toBe(1);
  expect(listeners.size).toBe(0);
  await expect(
    bench([]).figure.hostOutputs.render?.figure?.(),
  ).resolves.toBeUndefined();
});

test('a figure not on the page cannot be written', async () => {
  const figure = createSiteFigure<Bench>({
    site: 'mechanics',
    document: {
      peek: () => ({ pieces: ['a'] }),
      subscribe: () => stopNothing,
    },
    read: readBench,
    isEmpty: () => false,
    open: () => undefined,
    emptyMessage: 'This figure holds no bench.',
    figureId: 'bench-figure',
  });

  await expect(figure.writeFigure()).rejects.toThrow(
    'The figure is not on the page.',
  );
});
