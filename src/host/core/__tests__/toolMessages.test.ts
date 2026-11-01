import { expect, test } from 'vitest';

import { readHello, readToolMessage } from '../toolMessages.ts';

test('a hello is read with what the tool takes and gives, and nothing else', () => {
  expect(
    readHello({
      type: 'cheminfo:hello',
      version: 1,
      tool: {
        name: 'osiris',
        origin: 'https://osiris.cheminfo.org',
        build: { version: '1.0.0' },
        inputs: [
          { key: 'structure', kinds: ['chem.molfile', 3], optional: true },
          { kinds: ['chem.smiles'] },
        ],
        outputs: [{ key: 'properties', kind: 'data.table' }, { key: 'x' }],
        secret: 'dropped',
      },
    }),
  ).toStrictEqual({
    name: 'osiris',
    origin: 'https://osiris.cheminfo.org',
    build: { version: '1.0.0' },
    inputs: [{ key: 'structure', kinds: ['chem.molfile'], optional: true }],
    outputs: [{ key: 'properties', kind: 'data.table' }],
  });
});

test('a hello of another version, or without a name, is not a hello', () => {
  const tool = { name: '3d', origin: 'https://3d.cheminfo.org' };

  expect(readHello({ type: 'cheminfo:hello', version: 2, tool })).toBeNull();
  expect(
    readHello({ type: 'cheminfo:hello', version: 1, tool: { origin: 'x' } }),
  ).toBeNull();
  expect(readHello('cheminfo:hello')).toBeNull();
  expect(
    readHello({ type: 'cheminfo:hello', version: 1, tool })?.build,
  ).toBeNull();
});

test('a result is read as the items a get asked for, or the inputs a load used', () => {
  expect(
    readToolMessage({
      type: 'result',
      id: 'h1',
      ok: true,
      items: [
        { key: 'name', kind: 'chem.name.iupac', value: { name: 'ethanol' } },
      ],
    }),
  ).toStrictEqual({
    type: 'result',
    id: 'h1',
    ok: true,
    items: [
      { key: 'name', kind: 'chem.name.iupac', value: { name: 'ethanol' } },
    ],
  });
  expect(
    readToolMessage({
      type: 'result',
      id: 'h2',
      ok: true,
      used: [{ key: 'structure', kind: 'chem.molfile' }, { key: 4 }],
    }),
  ).toStrictEqual({
    type: 'result',
    id: 'h2',
    ok: true,
    used: [{ key: 'structure', kind: 'chem.molfile' }],
  });
});

test('a refusal keeps its reason, and gets one when it gave none', () => {
  expect(
    readToolMessage({
      type: 'result',
      id: 'h3',
      ok: false,
      error: { code: 'no-output', message: 'There is no picture yet.' },
    }),
  ).toStrictEqual({
    type: 'result',
    id: 'h3',
    ok: false,
    error: { code: 'no-output', message: 'There is no picture yet.' },
  });
  expect(
    readToolMessage({
      type: 'result',
      id: 'h4',
      ok: false,
      error: { code: 'conflict', message: '' },
    }),
  ).toStrictEqual({
    type: 'result',
    id: 'h4',
    ok: false,
    error: {
      code: 'invalid',
      message: 'The tool refused the request and gave no reason.',
    },
  });
});

test('an output is read for its document; anything else is ignored', () => {
  expect(
    readToolMessage({
      type: 'output',
      document: 'draw:benzene',
      items: [{ key: 'properties', kind: 'data.table', value: {} }, 'x'],
    }),
  ).toStrictEqual({
    type: 'output',
    document: 'draw:benzene',
    items: [{ key: 'properties', kind: 'data.table', value: {} }],
  });
  expect(readToolMessage({ type: 'output', items: [] })).toBeNull();
  expect(readToolMessage({ type: 'result', ok: true })).toBeNull();
  expect(readToolMessage({ type: 'load', id: 'x' })).toBeNull();
});
