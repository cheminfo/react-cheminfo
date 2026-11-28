import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vitest';

import { staticGraph } from '../../build/vite/__tests__/importGraph.ts';

const ENTRY = resolve(import.meta.dirname, '../../pdf.ts');

const PDF_PEERS = new Set(['jspdf', 'pdf-lib', 'svg2pdf.js']);

test('importing react-cheminfo/pdf loads none of the PDF libraries', () => {
  const offenders: string[] = [];
  for (const [file, specifiers] of staticGraph(ENTRY)) {
    for (const specifier of specifiers) {
      if (PDF_PEERS.has(specifier)) offenders.push(`${file}: ${specifier}`);
    }
  }

  expect(offenders).toStrictEqual([]);
});

test('the PDF libraries are optional peers the door imports when it writes or reads', () => {
  const manifest = JSON.parse(
    readFileSync(resolve(import.meta.dirname, '../../../package.json'), 'utf8'),
  ) as {
    peerDependencies: Record<string, string>;
    peerDependenciesMeta: Record<string, { optional?: boolean }>;
  };
  const imported = new Set<string>();
  for (const file of staticGraph(ENTRY).keys()) {
    const imports = readFileSync(file, 'utf8').matchAll(
      /\bimport\(\s*'(?<specifier>[^'.][^']*)'\s*\)/gu,
    );
    for (const match of imports) {
      imported.add((match.groups as { specifier: string }).specifier);
    }
  }

  expect([...imported].toSorted()).toStrictEqual([...PDF_PEERS].toSorted());

  for (const peer of PDF_PEERS) {
    expect(manifest.peerDependencies[peer]).toBeDefined();
    expect(manifest.peerDependenciesMeta[peer]?.optional).toBe(true);
  }
});

test('the faces a PDF is set in ship with the package, beside their licence', () => {
  const fonts = resolve(import.meta.dirname, '../../../assets/fonts');
  const source = readFileSync(
    resolve(import.meta.dirname, '../core/pdfFonts.ts'),
    'utf8',
  );
  const named = [
    ...source.matchAll(
      /'\.\.\/\.\.\/\.\.\/assets\/fonts\/(?<file>[\w-]+\.ttf)'/gu,
    ),
  ];

  expect(named.map((match) => match.groups?.file)).toStrictEqual([
    'Arimo-Regular.ttf',
    'Arimo-Bold.ttf',
    'Arimo-Italic.ttf',
    'Arimo-BoldItalic.ttf',
  ]);

  const sizes: number[] = [];
  for (const match of named) {
    sizes.push(readFileSync(resolve(fonts, match.groups?.file ?? '')).length);
  }

  expect(sizes).toStrictEqual([478_712, 485_872, 502_332, 508_508]);
  expect(readFileSync(resolve(fonts, 'OFL.txt'), 'utf8')).toContain(
    'SIL OPEN FONT LICENSE Version 1.1',
  );
});
