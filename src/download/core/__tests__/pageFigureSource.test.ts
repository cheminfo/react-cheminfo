import { expect, test } from 'vitest';

import { readFigureSource } from '../figureSource.ts';
import { readFigureStates } from '../figureState.ts';
import {
  setPageFigureSource,
  withPageFigureSource,
} from '../pageFigureSource.ts';

const FIGURE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"><rect width="40" height="20"/></svg>';

const STATE = { version: 1, value: { smiles: 'CCO' } };

test('a figure the page saves says where it came from while the page names a source', async () => {
  await expect(withPageFigureSource(FIGURE)).resolves.toBe(FIGURE);

  const forget = setPageFigureSource(() => ({
    site: 'vibrations',
    href: 'https://vibrations.cheminfo.org/ir',
    data: STATE,
  }));
  const saved = await withPageFigureSource(FIGURE);
  forget();

  expect(readFigureSource(saved)).toStrictEqual({
    site: 'vibrations',
    href: 'https://vibrations.cheminfo.org/ir',
  });
  await expect(readFigureStates(saved, 'vibrations')).resolves.toStrictEqual({
    site: 'vibrations',
    href: 'https://vibrations.cheminfo.org/ir',
    data: STATE,
    edited: false,
  });
  await expect(withPageFigureSource(FIGURE)).resolves.toBe(FIGURE);
});

test('a figure naming its own source keeps it, and a source that cannot be read leaves the figure as it is', async () => {
  const forgetFirst = setPageFigureSource(() => ({
    site: '3d',
    href: 'https://3d.cheminfo.org/',
  }));
  const own = await withPageFigureSource(FIGURE);
  const forgetSecond = setPageFigureSource(() => {
    throw new Error('No spectrum to write.');
  });
  // Forgetting a source another has replaced leaves the newer one.
  forgetFirst();

  await expect(
    withPageFigureSource(
      own.replace(
        'href="https://3d.cheminfo.org/"',
        'href="https://3d.cheminfo.org/?a=1"',
      ),
    ),
  ).resolves.toContain('href="https://3d.cheminfo.org/?a=1"');
  await expect(withPageFigureSource(FIGURE)).resolves.toBe(FIGURE);

  forgetSecond();
});
