import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import { detectFormat } from '../detectFormat.ts';

const vamasDirectory = join(import.meta.dirname, 'data');

const VAMAS_LINE =
  'VAMAS Surface Chemical Analysis Standard Data Transfer Format 1988 May 4';

test('a VAMAS file is recognised from its format line, not from its name', () => {
  const vamas = readFileSync(join(vamasDirectory, 'auger.vms'));

  expect(detectFormat(vamas)).toBe('vamas');
  expect(detectFormat(vamas, 'exported-by-the-lims.txt')).toBe('vamas');
});

test('a byte order mark does not send a VAMAS file to the text reader', () => {
  const text = `\uFEFF${VAMAS_LINE}\r\nNot specified\r\n`;

  expect(detectFormat(text)).toBe('vamas');

  const bytes = new TextEncoder().encode(text);

  expect(bytes[0]).toBe(0xef);
  expect(detectFormat(bytes)).toBe('vamas');

  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);

  expect(detectFormat(buffer)).toBe('vamas');
});

test('a JCAMP is recognised through the comment lines above its first record', () => {
  expect(detectFormat('##TITLE=Cellulose\n##JCAMP-DX=4.24\n')).toBe('jcamp');
  expect(detectFormat('$$ exported by CasaXPS\n##TITLE=C 1s\n')).toBe('jcamp');
});

test('two columns of numbers are a spectrum, an acquisition table is not', () => {
  expect(detectFormat('282.16 178\n282.21 180\n')).toBe('text');
  expect(
    detectFormat('Binding Energy\tCounts\n282.16\t178\n282.21\t180\n'),
  ).toBe('text');
  expect(detectFormat('294.16;1204\n294.11;1198\n')).toBe('text');
  expect(detectFormat('Pass energy 20 eV\nDwell time 0.1 s\n')).toBeNull();
});

test('one line of numbers is not yet a spectrum', () => {
  expect(detectFormat('282.16 178\n')).toBeNull();
});

test('the extension only breaks a tie the content left open', () => {
  const peaks = '282.16 178\n282.21 180\n';

  expect(detectFormat(peaks, 'narrow-scan.txt')).toBe('text');
  expect(detectFormat('', 'experiment.VMS')).toBe('vamas');
  expect(detectFormat('', 'survey.npl')).toBe('vamas');
  expect(detectFormat('', 'library.jdx')).toBe('jcamp');
  expect(detectFormat('', 'peaks.xy')).toBe('text');
});

test('an extension that names a property of Object is not a format', () => {
  const peaks = '282.16 178\n282.21 180\n';

  expect(detectFormat(peaks, 'peaks.constructor')).toBe('text');
  expect(detectFormat('', 'peaks.__proto__')).toBeNull();
});

test('anything this reader does not know is null rather than a guess', () => {
  expect(detectFormat('')).toBeNull();
  expect(detectFormat('   \n  \n')).toBeNull();
  expect(detectFormat(new Uint8Array(0))).toBeNull();
  expect(detectFormat('%PDF-1.7\ntrailer\n', 'report.pdf')).toBeNull();
});
