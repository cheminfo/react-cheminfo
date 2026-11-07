import { expect, test } from 'vitest';

import { packFigureValue } from '../figurePacking.ts';
import { withFigureSource } from '../figureSource.ts';
import { figureDigest, readFigureState } from '../figureState.ts';

const FIGURE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20" viewBox="0 0 40 20"><rect width="40" height="20"/></svg>';

const CONFORMERS = {
  smiles: 'CCO',
  shown: 'c2',
  conformers: [
    { id: 'c1', energy: 0, molfile: 'one' },
    { id: 'c2', energy: 0.84, molfile: 'two' },
  ],
};

const SOURCE = {
  site: '3d',
  href: 'https://3d.cheminfo.org/?smiles=CCO&id=c2',
  state: { version: 1, value: CONFORMERS },
};

test('a figure carries what its page computed, and opens again on exactly that', async () => {
  const svg = await withFigureSource(FIGURE, SOURCE);

  expect(svg).toMatch(
    /<cheminfo:state version="1" digest="[\da-f]{64}" encoding="gzip\+base64">[A-Za-z\d+/=]+<\/cheminfo:state><\/cheminfo:source><\/metadata><rect/,
  );
  await expect(readFigureState(svg, '3d')).resolves.toStrictEqual({
    site: '3d',
    href: SOURCE.href,
    version: 1,
    value: CONFORMERS,
    edited: false,
  });
  await expect(readFigureState(svg)).resolves.toStrictEqual({
    site: '3d',
    href: SOURCE.href,
    version: 1,
    value: CONFORMERS,
    edited: false,
  });
});

test('another site’s state is none, and so is a figure that carries none', async () => {
  const svg = await withFigureSource(FIGURE, SOURCE);
  const addressed = await withFigureSource(FIGURE, {
    site: '3d',
    href: 'https://3d.cheminfo.org/?smiles=CCO',
  });

  await expect(readFigureState(svg, 'lcao')).resolves.toBeUndefined();
  await expect(readFigureState(addressed, '3d')).resolves.toBeUndefined();
  await expect(readFigureState(FIGURE)).resolves.toBeUndefined();
});

test('a picture redrawn in another program is said to be edited, one only reindented is not', async () => {
  const svg = await withFigureSource(FIGURE, SOURCE);
  const redrawn = svg.replace(
    '<rect width="40" height="20"/>',
    '<rect width="40" height="20" fill="red"/>',
  );
  const reindented = svg
    .replace('<rect', '\n  <rect')
    .replace('</svg>', '\n</svg>\n');

  await expect(readFigureState(redrawn, '3d')).resolves.toMatchObject({
    edited: true,
  });
  await expect(readFigureState(reindented, '3d')).resolves.toMatchObject({
    edited: false,
  });
});

test('a state that is unreadable, of an unknown version or misnamed, is none', async () => {
  const svg = await withFigureSource(FIGURE, SOURCE);
  const packed = await packFigureValue(CONFORMERS);

  await expect(
    readFigureState(
      svg.replace(/>[A-Za-z\d+/=]+<\/cheminfo:state>/, '>@@@</cheminfo:state>'),
    ),
  ).resolves.toBeUndefined();
  await expect(
    readFigureState(svg.replace('version="1"', 'version="0"')),
  ).resolves.toBeUndefined();
  await expect(
    readFigureState(svg.replace('version="1"', 'version="1.5"')),
  ).resolves.toBeUndefined();
  await expect(
    readFigureState(svg.replace('encoding="gzip+base64"', 'encoding="zip"')),
  ).resolves.toBeUndefined();
  expect(svg).toContain(packed);
});

test('a state is versioned from 1, in whole numbers', async () => {
  await expect(
    withFigureSource(FIGURE, { ...SOURCE, state: { version: 0, value: {} } }),
  ).rejects.toThrow(
    "A figure's state is versioned from 1, in whole numbers, not 0.",
  );
});

test('a figure is digested on what it draws, its root and its white space aside', async () => {
  const digest = await figureDigest(FIGURE);

  expect(digest).toMatch(/^[\da-f]{64}$/);
  await expect(
    figureDigest(FIGURE.replace('width="40" height="20" viewBox', 'viewBox')),
  ).resolves.toBe(digest);
  await expect(
    figureDigest(FIGURE.replace('<rect', ' \n <rect')),
  ).resolves.toBe(digest);
  await expect(
    figureDigest(FIGURE.replace('height="20"/>', 'height="21"/>')),
  ).resolves.not.toBe(digest);
  await expect(
    figureDigest('<svg xmlns="http://www.w3.org/2000/svg"/>'),
  ).resolves.toBeUndefined();
});
