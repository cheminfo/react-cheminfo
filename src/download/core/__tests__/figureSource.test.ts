import { expect, test } from 'vitest';

import {
  FIGURE_SOURCE_NAMESPACE,
  figureAddress,
  readFigureInputs,
  readFigureSource,
  withFigureSource,
} from '../figureSource.ts';

const FIGURE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20" viewBox="0 0 40 20"><rect width="40" height="20"/></svg>';

const SOURCE = {
  site: '3d',
  href: 'https://3d.cheminfo.org/?smiles=CC(=O)O&view=0.1,0.2&conformer=3',
};

test('a figure says where it came from, first thing under its root', async () => {
  const svg = await withFigureSource(FIGURE, SOURCE);

  expect(svg).toBe(
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20" viewBox="0 0 40 20"><metadata><cheminfo:source xmlns:cheminfo="${FIGURE_SOURCE_NAMESPACE}" site="3d" href="https://3d.cheminfo.org/?smiles=CC(=O)O&amp;view=0.1,0.2&amp;conformer=3"/></metadata><rect width="40" height="20"/></svg>`,
  );
  expect(readFigureSource(svg)).toStrictEqual(SOURCE);
});

test('a new source takes the place of the old one', async () => {
  const svg = await withFigureSource(await withFigureSource(FIGURE, SOURCE), {
    site: 'periodic-table',
    href: 'https://periodic-table.cheminfo.org/property?p=electronegativity',
  });

  expect(svg.match(/cheminfo:source/g)).toHaveLength(1);
  expect(readFigureSource(svg)).toStrictEqual({
    site: 'periodic-table',
    href: 'https://periodic-table.cheminfo.org/property?p=electronegativity',
  });
});

test('a figure keeping its data in its own metadata gets the source there, and keeps one metadata', async () => {
  const native =
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:cd="https://draw.cheminfo.org/ns"><title>Benzene</title><metadata><cd:document>{}</cd:document></metadata><g/></svg>';

  const svg = await withFigureSource(native, {
    site: 'draw',
    href: 'https://draw.cheminfo.org/',
  });

  expect(svg).toBe(
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:cd="https://draw.cheminfo.org/ns"><title>Benzene</title><metadata><cheminfo:source xmlns:cheminfo="${FIGURE_SOURCE_NAMESPACE}" site="draw" href="https://draw.cheminfo.org/"/><cd:document>{}</cd:document></metadata><g/></svg>`,
  );

  const again = await withFigureSource(svg, {
    site: 'draw',
    href: 'https://draw.cheminfo.org/?a=1',
  });

  expect(again.match(/<metadata>/g)).toHaveLength(1);
  expect(again.match(/cheminfo:source/g)).toHaveLength(1);
});

test('a source is read whatever prefix another program gave it', () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:ns1="${FIGURE_SOURCE_NAMESPACE}"><metadata><ns1:source href='https://lcao.cheminfo.org/playground?smiles=C' site='lcao'/></metadata></svg>`;

  expect(readFigureSource(svg)).toStrictEqual({
    site: 'lcao',
    href: 'https://lcao.cheminfo.org/playground?smiles=C',
  });
});

test('a figure with no source, or one that does not read, has none', async () => {
  expect(readFigureSource(FIGURE)).toBeUndefined();
  expect(
    readFigureSource(
      await withFigureSource(FIGURE, {
        site: '3d',
        href: 'ftp://3d.cheminfo.org/',
      }),
    ),
  ).toBeUndefined();
  expect(
    readFigureSource(
      await withFigureSource(FIGURE, { site: 'Bad Site', href: SOURCE.href }),
    ),
  ).toBeUndefined();
});

test('the address a figure records drops what only a framing page asks for', () => {
  const address = figureAddress(
    'https://3d.cheminfo.org/?embed=1&hide=intro,editor&smiles=C1CC[N+](C)CC1&view=a&card=1',
  );

  expect(address).toBe(
    'https://3d.cheminfo.org/?smiles=C1CC%5BN%2B%5D(C)CC1&view=a',
  );
  expect(new URL(address).searchParams.get('smiles')).toBe('C1CC[N+](C)CC1');
  expect(
    figureAddress('https://periodic-table.cheminfo.org/table/Fe?embed'),
  ).toBe('https://periodic-table.cheminfo.org/table/Fe');
});

const SPECTRUM = {
  kind: 'spectra.ir.jdx',
  key: 'spectra',
  label: 'ethanol & water.jdx',
  value: {
    jdx: '##TITLE=ethanol\n##JCAMP-DX=4.24\n##XYPOINTS=(XY..XY)\n400,0.1\n402,0.2\n##END=',
    peaks: [{ wavenumber: 1050, kind: 'S' }],
  },
};

const STRUCTURE = { kind: 'chem.smiles', value: { smiles: 'CCO' } };

test('a figure carries the values it was drawn from, and gives them back', async () => {
  const svg = await withFigureSource(FIGURE, {
    site: 'vibrations',
    href: 'https://vibrations.cheminfo.org/ir',
    inputs: [SPECTRUM, STRUCTURE],
  });

  expect(svg).toMatch(
    /<cheminfo:input kind="spectra\.ir\.jdx" key="spectra" label="ethanol &amp; water\.jdx" encoding="gzip\+base64">[\w+/=]+<\/cheminfo:input>/,
  );
  // The address is read alone, without unpacking anything.
  expect(readFigureSource(svg)).toStrictEqual({
    site: 'vibrations',
    href: 'https://vibrations.cheminfo.org/ir',
  });
  await expect(readFigureInputs(svg)).resolves.toStrictEqual([
    SPECTRUM,
    STRUCTURE,
  ]);
});

test('a new source drops the values of the old one, and one without values carries none', async () => {
  const carrying = await withFigureSource(FIGURE, {
    site: 'vibrations',
    href: 'https://vibrations.cheminfo.org/ir',
    inputs: [SPECTRUM],
  });

  const replaced = await withFigureSource(carrying, SOURCE);

  expect(replaced).not.toContain('cheminfo:input');
  expect(replaced.match(/<metadata>/g)).toHaveLength(1);
  expect(readFigureSource(replaced)).toStrictEqual(SOURCE);
  await expect(readFigureInputs(replaced)).resolves.toStrictEqual([]);
  await expect(readFigureInputs(FIGURE)).resolves.toStrictEqual([]);
});

test('a value that does not unpack is left out, and the others are read', async () => {
  const svg = await withFigureSource(FIGURE, {
    site: 'vibrations',
    href: 'https://vibrations.cheminfo.org/ir',
    inputs: [SPECTRUM, STRUCTURE],
  });

  const damaged = svg.replace(
    /(?<open><cheminfo:input kind="spectra\.ir\.jdx"[^>]*>)[^<]+/,
    '$<open>H4sIAAAAAAAA',
  );

  await expect(readFigureInputs(damaged)).resolves.toStrictEqual([STRUCTURE]);
});

test('values are read whatever prefix another program gave them, and only in a source that reads', async () => {
  const written = await withFigureSource(FIGURE, {
    site: 'vibrations',
    href: 'https://vibrations.cheminfo.org/ir',
    inputs: [STRUCTURE],
  });
  const renamed = written
    .replaceAll('cheminfo:', 'ns2:')
    .replace('xmlns:cheminfo=', 'xmlns:ns2=');

  await expect(readFigureInputs(renamed)).resolves.toStrictEqual([STRUCTURE]);
  await expect(
    readFigureInputs(renamed.replace('site="vibrations"', 'site="Bad"')),
  ).resolves.toStrictEqual([]);
});
