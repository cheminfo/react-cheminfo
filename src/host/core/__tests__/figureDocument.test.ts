import { expect, test } from 'vitest';

import { withFigureSource } from '../../../download/core/figureSource.ts';
import { figureToolDocument } from '../figureDocument.ts';

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
