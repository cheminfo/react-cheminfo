import { expect, test } from 'vitest';

import { openedFigureSvg } from '../documentFigure.ts';
import { writeSiteDocument } from '../siteDocument.ts';

const SVG =
  '<svg xmlns="http://www.w3.org/2000/svg"><title>Benzene</title></svg>';

test('an SVG file is its own figure', async () => {
  await expect(openedFigureSvg(new Blob([SVG]))).resolves.toBe(SVG);
});

test("a document's figure is the first SVG among its data", async () => {
  const document = await writeSiteDocument(
    {
      data: [
        { path: 'benzene.mol', content: 'benzene\n' },
        { path: 'drawing.svg', content: SVG },
      ],
    },
    { site: 'draw' },
  );

  await expect(openedFigureSvg(document)).resolves.toBe(SVG);
});

test('a document holding no SVG, or an archive that is no document, holds no figure', async () => {
  const molfile = await writeSiteDocument(
    { data: [{ path: 'benzene.mol', content: 'benzene\n' }] },
    { site: 'draw' },
  );
  const broken = new Blob([new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0, 0])]);

  await expect(openedFigureSvg(molfile)).resolves.toBeUndefined();
  await expect(openedFigureSvg(broken)).resolves.toBeUndefined();
});
