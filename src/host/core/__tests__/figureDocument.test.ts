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

const STATE = { version: 2, value: { conformers: ['one', 'two'], shown: 1 } };

test('a figure carrying its state is handed back whole, on the figure input', async () => {
  const svg = await withFigureSource(FIGURE, {
    site: '3d',
    href: 'https://3d.cheminfo.org/?smiles=CCO',
    state: STATE,
  });

  await expect(figureToolDocument(svg, 'figure:i4')).resolves.toStrictEqual({
    document: 'figure:i4',
    items: [{ key: FIGURE_INPUT.key, kind: 'image.svg', value: { svg } }],
  });
});

test('a figure carrying no state, or no source at all, cannot be opened again', async () => {
  const addressed = await withFigureSource(FIGURE, {
    site: '3d',
    href: 'https://3d.cheminfo.org/?smiles=CCO',
  });

  await expect(figureToolDocument(addressed, 'figure:i1')).resolves.toBeNull();
  await expect(figureToolDocument(FIGURE, 'figure:i2')).resolves.toBeNull();
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
