import { expect, test } from 'vitest';

import { sendTargets } from '../sendTargets.ts';

const SPECTRA = { kind: 'data.spectra', label: '3 IR spectra' };
const TABLE = { kind: 'data.table', label: 'a table' };

test('a set of spectra lists ml, with what it does with them', () => {
  const targets = sendTargets([SPECTRA], 'vibrations');

  expect(
    targets.map(({ site, receiver, offer }) => [
      site.id,
      receiver.does,
      offer.label,
    ]),
  ).toStrictEqual([
    ['ml', 'Compare the spectra with PCA, OPLS and clustering', '3 IR spectra'],
  ]);
});

test('a site takes the offer its own order of kinds prefers', () => {
  const targets = sendTargets([TABLE, SPECTRA], 'vibrations');

  expect(targets.map(({ site, offer }) => [site.id, offer.kind])).toStrictEqual(
    [['ml', 'data.spectra']],
  );
});

test('a structure lists draw, to edit it or to cut it into mass fragments', () => {
  const targets = sendTargets(
    [{ kind: 'chem.molfile.2d', label: 'Ethylbenzene' }],
    'mass',
  );

  const listed: Array<[string, string | undefined, string | undefined]> = [];
  for (const { site, receiver, offer } of targets) {
    listed.push([site.id, receiver.page, offer.label]);
  }

  expect(listed).toStrictEqual([
    ['draw', undefined, 'Ethylbenzene'],
    ['draw', '/?workspace=fragmentation', 'Ethylbenzene'],
  ]);
});

test('a site is never offered what it sends itself', () => {
  expect(sendTargets([SPECTRA], 'ml')).toStrictEqual([]);
});

test('nothing to send, or a kind no site receives, lists no site', () => {
  expect(sendTargets([], 'vibrations')).toStrictEqual([]);
  expect(
    sendTargets([{ kind: 'spectra.ir.jdx', label: 'a JCAMP' }], 'vibrations'),
  ).toStrictEqual([]);
});
