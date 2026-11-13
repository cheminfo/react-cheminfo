import { expect, test } from 'vitest';

import { figureOutputKey, readFigureOutput } from '../figureOutput.ts';
import type { HostOutputs } from '../hostOutputs.ts';
import type { ToolInterface } from '../protocol.ts';

const SVG = '<svg width="10" height="10"></svg>';

const TOOL: ToolInterface = {
  name: 'tex',
  inputs: [],
  outputs: [
    { key: 'conformer', kind: 'chem.molfile.3d' },
    { key: 'figure', kind: 'image.svg' },
  ],
};

test('the figure is the first output a tool declares as an SVG picture', () => {
  expect(figureOutputKey(TOOL)).toBe('figure');
  expect(
    figureOutputKey({
      ...TOOL,
      outputs: [{ key: 'plot', kind: 'image.svg.chart' }],
    }),
  ).toBe('plot');
  expect(
    figureOutputKey({
      ...TOOL,
      outputs: [
        { key: 'pictures', kind: 'image.svg[]' },
        { key: 'other', kind: 'image.svgz' },
      ],
    }),
  ).toBeUndefined();
});

test('a figure made on request is rendered, as a host get renders it', async () => {
  const outputs: HostOutputs = {
    read: () => [],
    subscribe: listenToNothing,
    render: {
      figure: async () => ({
        key: 'figure',
        kind: 'image.svg',
        value: { svg: SVG },
      }),
    },
  };

  await expect(readFigureOutput(outputs, 'figure')).resolves.toBe(SVG);
});

test('a figure among the values read is taken from them', async () => {
  const outputs: HostOutputs = {
    read: () => [
      { key: 'conformer', kind: 'chem.molfile.3d', value: { molfile: '' } },
      { key: 'figure', kind: 'image.svg', value: { svg: SVG } },
    ],
    subscribe: listenToNothing,
  };

  await expect(readFigureOutput(outputs, 'figure')).resolves.toBe(SVG);
});

test('a tool with nothing to draw yet gives no figure', async () => {
  const outputs: HostOutputs = {
    read: () => [],
    subscribe: listenToNothing,
    render: { figure: async () => undefined },
  };

  await expect(readFigureOutput(outputs, 'figure')).resolves.toBeUndefined();
});

function listenToNothing(): () => void {
  return stopListening;
}

function stopListening(): void {
  // Nothing was listened to.
}
