import { afterEach, expect, test } from 'vitest';

import { readFigureSource } from '../../../download/core/figureSource.ts';
import { readFigureState } from '../../../download/core/figureState.ts';
import { setPageFigureSource } from '../../../download/core/pageFigureSource.ts';
import { moleculeImageFile } from '../exportMoleculeImage.ts';

const PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAwS2OUAAAAABJRU5ErkJggg==';

const VIEWER = { captureImage: () => Promise.resolve(PIXEL) };

let forget: (() => void) | undefined;

afterEach(() => {
  forget?.();
  forget = undefined;
});

test('a picture of the model saved as SVG is named after its site, says which page drew it, and carries what the page computed', async () => {
  forget = setPageFigureSource(() => ({
    site: '3d',
    href: 'https://3d.cheminfo.org/?smiles=CCO&id=1',
    state: { version: 1, value: { conformers: ['one', 'two'] } },
  }));

  const file = await moleculeImageFile(VIEWER, {
    format: 'svg',
    scale: 2,
    size: { width: 40, height: 30 },
    fileName: 'ethanol',
  });
  const svg = (await file?.text()) ?? '';

  expect(file?.name).toBe('ethanol.3d.svg');
  expect(readFigureSource(svg)).toStrictEqual({
    site: '3d',
    href: 'https://3d.cheminfo.org/?smiles=CCO&id=1',
  });
  await expect(readFigureState(svg, '3d')).resolves.toStrictEqual({
    site: '3d',
    href: 'https://3d.cheminfo.org/?smiles=CCO&id=1',
    version: 1,
    value: { conformers: ['one', 'two'] },
    edited: false,
  });
});

test('a page that names no source saves the picture alone', async () => {
  const file = await moleculeImageFile(VIEWER, {
    format: 'svg',
    scale: 1,
    size: { width: 4, height: 3 },
    fileName: 'molecule',
  });

  expect(file?.name).toBe('molecule.svg');
  expect(readFigureSource((await file?.text()) ?? '')).toBeUndefined();
});
