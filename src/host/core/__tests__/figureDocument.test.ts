import { expect, test } from 'vitest';

import { withFigureSource } from '../../../download/core/figureSource.ts';
import {
  FIGURE_INPUT,
  figureToolDocument,
  loadedFigureState,
} from '../figureDocument.ts';
import type { LoadedInput } from '../selectInputs.ts';

const FIGURE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"><rect width="40" height="20"/></svg>';

test('a figure carrying what it was drawn from is handed back to its tool as one document', async () => {
  const spectrum = {
    kind: 'spectra.ir.jdx',
    key: 'spectra',
    label: 'ethanol.jdx',
    value: { jdx: '##TITLE=ethanol\n##END=', peaks: [{ wavenumber: 1050 }] },
  };
  const svg = await withFigureSource(FIGURE, {
    site: 'vibrations',
    href: 'https://vibrations.cheminfo.org/ir',
    inputs: [spectrum],
  });

  await expect(figureToolDocument(svg, 'figure:i3')).resolves.toStrictEqual({
    document: 'figure:i3',
    items: [spectrum],
  });
});

test('a figure whose address says it all, or none at all, needs no document', async () => {
  const addressed = await withFigureSource(FIGURE, {
    site: '3d',
    href: 'https://3d.cheminfo.org/?smiles=CCO',
  });

  await expect(figureToolDocument(addressed, 'figure:i1')).resolves.toBeNull();
  await expect(figureToolDocument(FIGURE, 'figure:i2')).resolves.toBeNull();
});

const STATE = { version: 2, value: { conformers: ['one', 'two'], shown: 1 } };

const TAKES_FIGURES = {
  name: '3d',
  inputs: [
    { key: 'structure', kinds: ['chem.smiles'], optional: true },
    FIGURE_INPUT,
  ],
};

test('a figure carrying its state is handed back whole to a tool that opens its figures', async () => {
  const svg = await withFigureSource(FIGURE, {
    site: '3d',
    href: 'https://3d.cheminfo.org/?smiles=CCO',
    state: STATE,
  });

  await expect(
    figureToolDocument(svg, 'figure:i4', TAKES_FIGURES),
  ).resolves.toStrictEqual({
    document: 'figure:i4',
    items: [{ key: 'figure', kind: 'image.svg', value: { svg } }],
  });
});

test('a tool that does not open its figures, or one not heard yet, is handed what it always was', async () => {
  const spectrum = {
    kind: 'spectra.ir.jdx',
    key: 'spectra',
    value: { jdx: '##TITLE=ethanol\n##END=' },
  };
  const svg = await withFigureSource(FIGURE, {
    site: 'vibrations',
    href: 'https://vibrations.cheminfo.org/ir',
    inputs: [spectrum],
    state: STATE,
  });
  const expected = { document: 'figure:i5', items: [spectrum] };

  await expect(figureToolDocument(svg, 'figure:i5')).resolves.toStrictEqual(
    expected,
  );
  await expect(
    figureToolDocument(svg, 'figure:i5', null),
  ).resolves.toStrictEqual(expected);
  await expect(
    figureToolDocument(svg, 'figure:i5', {
      name: 'vibrations',
      inputs: [{ key: 'spectra', kinds: ['spectra.ir.jdx'] }],
    }),
  ).resolves.toStrictEqual(expected);
  await expect(
    figureToolDocument(svg, 'figure:i5', { ...TAKES_FIGURES, name: 'lcao' }),
  ).resolves.toStrictEqual(expected);
});

test('a tool reads the state of the figure a host handed over, and refuses a figure not its own', async () => {
  const svg = await withFigureSource(FIGURE, {
    site: '3d',
    href: 'https://3d.cheminfo.org/?smiles=CCO',
    state: STATE,
  });

  await expect(loadedFigureState(handed(svg), '3d')).resolves.toStrictEqual({
    site: '3d',
    href: 'https://3d.cheminfo.org/?smiles=CCO',
    ...STATE,
    edited: false,
  });
  await expect(loadedFigureState([], '3d')).resolves.toBeUndefined();
  await expect(loadedFigureState(handed(svg), 'lcao')).rejects.toThrow(
    'That picture holds no figure of lcao to open again.',
  );
  await expect(loadedFigureState(handed(FIGURE), '3d')).rejects.toThrow(
    'That picture holds no figure of 3d to open again.',
  );
});

function handed(figure: string): LoadedInput[] {
  return [
    {
      key: 'figure',
      item: { key: 'figure', kind: 'image.svg', value: { svg: figure } },
      checked: { kind: 'image.svg', value: { svg: figure } },
    },
  ];
}
