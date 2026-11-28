import { expect, test } from 'vitest';

import { writeSiteDocument } from '../../../storage/core/siteDocument.ts';
import { findFigureFile, mayBeFigureFile } from '../figureFiles.ts';

test('an SVG or a document named for the site may be a figure', () => {
  const sites = ['uv-vis'];

  expect(mayBeFigureFile({ name: 'spectra.uv-vis.svg' }, sites)).toBe(true);
  expect(mayBeFigureFile({ name: 'spectra.UV-VIS.ZIP' }, sites)).toBe(true);
  expect(mayBeFigureFile({ name: 'uvprobe-flat.spc' }, sites)).toBe(false);
  expect(mayBeFigureFile({ name: 'export.zip' }, sites)).toBe(false);
  expect(
    mayBeFigureFile({ name: 'sample.nmrium.zip' }, ['nmr', 'nmrium']),
  ).toBe(true);
});

test('the figure among dropped files is an SVG, or a zip that is a document', async () => {
  const document = await writeSiteDocument(
    { data: [{ path: 'chart.uv-vis.svg', content: '<svg/>' }] },
    { site: 'uv-vis' },
  );
  const spectrum = new File(['##TITLE=x'], 'a.jdx');
  const saved = new File([document], 'chart.uv-vis.zip');
  const foreign = new File(['not a zip'], 'other.uv-vis.zip');
  const picture = new File(['<svg/>'], 'chart.svg');

  await expect(findFigureFile([spectrum, saved], ['uv-vis'])).resolves.toBe(
    saved,
  );
  await expect(findFigureFile([foreign, picture], ['uv-vis'])).resolves.toBe(
    picture,
  );
  await expect(
    findFigureFile([spectrum, foreign], ['uv-vis']),
  ).resolves.toBeUndefined();
});
