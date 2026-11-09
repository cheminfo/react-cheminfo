import { expect, test } from 'vitest';

import { withFigureSource } from '../figureSource.ts';
import { figureDigest, readFigureStates } from '../figureState.ts';

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
  data: { version: 1, value: CONFORMERS },
};

test('a figure carries its data, view and preferences as JSON, and opens again on exactly those', async () => {
  const svg = await withFigureSource(FIGURE, {
    ...SOURCE,
    generator: '3d.cheminfo.org 1.2.0',
    view: { version: 2, value: { camera: [0, 0, 5] } },
    preferences: { version: 1, value: { panels: ['conformers'] } },
  });

  expect(svg).toMatch(
    /<cheminfo:source xmlns:cheminfo="https:\/\/www\.cheminfo\.org\/ns\/source\/2" site="3d" href="[^"]+" generator="3d\.cheminfo\.org 1\.2\.0" digest="[\da-f]{64}"><cheminfo:data version="1" encoding="json">\{"smiles":"CCO",/,
  );
  expect(svg).toContain(
    '<cheminfo:view version="2" encoding="json">{"camera":[0,0,5]}</cheminfo:view><cheminfo:preferences version="1" encoding="json">{"panels":["conformers"]}</cheminfo:preferences></cheminfo:source></metadata><rect',
  );
  await expect(readFigureStates(svg, '3d')).resolves.toStrictEqual({
    site: '3d',
    href: SOURCE.href,
    generator: '3d.cheminfo.org 1.2.0',
    data: { version: 1, value: CONFORMERS },
    view: { version: 2, value: { camera: [0, 0, 5] } },
    preferences: { version: 1, value: { panels: ['conformers'] } },
    edited: false,
  });
  await expect(readFigureStates(svg)).resolves.toMatchObject({
    data: { version: 1, value: CONFORMERS },
  });
});

test('a part with markup in it is escaped, and a large part is gzipped', async () => {
  const marked = { note: '<b>a & b</b>' };
  const svg = await withFigureSource(FIGURE, {
    ...SOURCE,
    data: { version: 1, value: marked },
  });

  expect(svg).toContain('{"note":"&lt;b&gt;a &amp; b&lt;/b&gt;"}');
  await expect(readFigureStates(svg)).resolves.toMatchObject({
    data: { version: 1, value: marked },
  });

  const large = {
    spectrum: Array.from({ length: 12_000 }, (_, index) => index),
  };
  const packed = await withFigureSource(FIGURE, {
    ...SOURCE,
    data: { version: 1, value: large },
  });

  expect(packed).toMatch(
    /<cheminfo:data version="1" encoding="gzip\+base64">[A-Za-z\d+/=]+<\/cheminfo:data>/,
  );
  await expect(readFigureStates(packed)).resolves.toMatchObject({
    data: { version: 1, value: large },
  });
});

test('another site’s state is none, and so is a figure that carries none', async () => {
  const svg = await withFigureSource(FIGURE, SOURCE);
  const addressed = await withFigureSource(FIGURE, {
    site: '3d',
    href: 'https://3d.cheminfo.org/?smiles=CCO',
  });

  expect(addressed).toContain(
    '<cheminfo:source xmlns:cheminfo="https://www.cheminfo.org/ns/source/2" site="3d" href="https://3d.cheminfo.org/?smiles=CCO"/>',
  );
  await expect(readFigureStates(svg, 'lcao')).resolves.toBeUndefined();
  await expect(readFigureStates(addressed, '3d')).resolves.toBeUndefined();
  await expect(readFigureStates(FIGURE)).resolves.toBeUndefined();
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

  await expect(readFigureStates(redrawn, '3d')).resolves.toMatchObject({
    edited: true,
  });
  await expect(readFigureStates(reindented, '3d')).resolves.toMatchObject({
    edited: false,
  });
});

test('a part that is unreadable, of an unknown version or encoding, is left out', async () => {
  const svg = await withFigureSource(FIGURE, {
    ...SOURCE,
    view: { version: 1, value: { camera: [1, 2, 3] } },
  });
  const view = { version: 1, value: { camera: [1, 2, 3] } };

  await expect(
    readFigureStates(svg.replace('{"smiles"', '{smiles')),
  ).resolves.toMatchObject({ view });
  await expect(
    readFigureStates(
      svg.replace('<cheminfo:data version="1"', '<cheminfo:data version="0"'),
    ),
  ).resolves.not.toHaveProperty('data');
  await expect(
    readFigureStates(
      svg.replace('<cheminfo:data version="1"', '<cheminfo:data version="1.5"'),
    ),
  ).resolves.not.toHaveProperty('data');

  const unknown = svg.replaceAll('encoding="json"', 'encoding="zip"');

  await expect(readFigureStates(unknown)).resolves.toBeUndefined();
  await expect(
    readFigureStates(
      await withFigureSource(FIGURE, {
        ...SOURCE,
        data: {
          version: 1,
          value: {
            spectrum: Array.from({ length: 12_000 }, (_, index) => index),
          },
        },
      }).then((packed) =>
        packed.replace(
          />[A-Za-z\d+/=]+<\/cheminfo:data>/,
          '>@@@</cheminfo:data>',
        ),
      ),
    ),
  ).resolves.toBeUndefined();
});

test('every part is versioned from 1, in whole numbers', async () => {
  await expect(
    withFigureSource(FIGURE, { ...SOURCE, data: { version: 0, value: {} } }),
  ).rejects.toThrow(
    'The data of a figure is versioned from 1, in whole numbers, not 0.',
  );
  await expect(
    withFigureSource(FIGURE, { ...SOURCE, view: { version: 1.5, value: {} } }),
  ).rejects.toThrow(
    'The view of a figure is versioned from 1, in whole numbers, not 1.5.',
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
