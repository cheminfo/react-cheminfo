import { expect, test } from 'vitest';

import { withFigureSource } from '../../../download/core/figureSource.ts';
import type { CarriedFigureStates } from '../../../download/core/figureState.ts';
import { createScreenFigure, figureTool } from '../figureTool.ts';
import type { LoadedInput } from '../selectInputs.ts';

const SVG = '<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>';

test('the registry hands back the figure of the page on screen, or nothing', async () => {
  const screen = createScreenFigure();

  await expect(screen.svg()).resolves.toBeUndefined();
  expect(screen.states()).toBeUndefined();

  const forget = screen.register({
    svg: async () => SVG,
    states: () => ({ data: { version: 1, value: 'cell' } }),
  });

  await expect(screen.svg()).resolves.toBe(SVG);
  expect(screen.states()).toStrictEqual({
    data: { version: 1, value: 'cell' },
  });

  forget();

  await expect(screen.svg()).resolves.toBeUndefined();
});

test('the tool takes its own figures in, and hands its figure back when asked', async () => {
  const screen = createScreenFigure();
  screen.register({ svg: async () => SVG, states: () => undefined });
  const opened: CarriedFigureStates[] = [];
  const { tool, outputs, load } = figureTool({
    name: 'symmetry',
    figure: screen.svg,
    open: (states) => opened.push(states),
  });

  expect(tool).toStrictEqual({
    name: 'symmetry',
    inputs: [{ key: 'figure', kinds: ['image.svg'], optional: true }],
    outputs: [{ key: 'figure', kind: 'image.svg' }],
  });
  expect(outputs.read()).toStrictEqual([]);
  await expect(outputs.render?.figure?.()).resolves.toStrictEqual({
    key: 'figure',
    kind: 'image.svg',
    value: { svg: SVG },
  });

  await load([]);

  expect(opened).toStrictEqual([]);

  const figure = await withFigureSource(SVG, {
    site: 'symmetry',
    href: 'https://symmetry.cheminfo.org/viewer',
    data: { version: 1, value: { structure: 'nacl' } },
  });
  const input: LoadedInput = {
    key: 'figure',
    item: { kind: 'image.svg', value: { svg: figure } },
    checked: { kind: 'image.svg', value: { svg: figure } },
  };
  await load([input]);

  expect(opened).toHaveLength(1);
  expect(opened[0]?.data).toStrictEqual({
    version: 1,
    value: { structure: 'nacl' },
  });
});
