import { afterEach, expect, test } from 'vitest';

import { readFigureSource } from '../../../download/core/figureSource.ts';
import { readFigureState } from '../../../download/core/figureState.ts';
import { setPageFigureSource } from '../../../download/core/pageFigureSource.ts';
import {
  captureMoleculeSvg,
  moleculeImageFile,
} from '../exportMoleculeImage.ts';

const PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAwS2OUAAAAABJRU5ErkJggg==';

const VIEWER = {
  captureImage: () => Promise.resolve(PIXEL),
  captureFigure: () => Promise.resolve({ dataUri: PIXEL, width: 1, height: 1 }),
};

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

test('a figure is the part holding the molecule, held to 1920 pixels, with its image named once', async () => {
  const asked: unknown[] = [];
  const viewer = {
    ...VIEWER,
    captureFigure: (
      size: { width: number; height: number },
      longest: number,
    ) => {
      asked.push({ size, longest });
      return Promise.resolve({
        dataUri: 'data:image/jpeg;base64,/9j/',
        width: 1920,
        height: 1829,
      });
    },
  };

  const svg = await captureMoleculeSvg(viewer, 2, {
    width: 2560,
    height: 1301,
  });

  expect(asked).toStrictEqual([
    { size: { width: 5120, height: 2602 }, longest: 1920 },
  ]);
  expect(svg).toBe(
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1920" height="1829" viewBox="0 0 1920 1829"><image width="1920" height="1829" xlink:href="data:image/jpeg;base64,/9j/"/></svg>',
  );
});

test('a viewer with nothing to picture says so', async () => {
  const viewer = { ...VIEWER, captureFigure: () => Promise.resolve(undefined) };

  await expect(
    captureMoleculeSvg(viewer, 2, { width: 40, height: 30 }),
  ).rejects.toThrow('There is no picture to copy yet.');
});
