import { expect, test } from 'vitest';

import {
  MAX_ITEMS,
  MAX_LABEL_LENGTH,
  isConnect,
  parseRequest,
} from '../protocol.ts';

test('a load is read with its items, and what is not an item is dropped', () => {
  expect(
    parseRequest({
      type: 'load',
      id: 'l1',
      document: 'scipeaks:42',
      items: [
        {
          kind: 'chem.smiles',
          value: { smiles: 'CCO' },
          id: 'a',
          key: 'structure',
          label: 'Ethanol',
          extra: true,
        },
        { value: { smiles: 'CCO' } },
        'chem.smiles',
      ],
    }),
  ).toStrictEqual({
    type: 'load',
    id: 'l1',
    document: 'scipeaks:42',
    items: [
      {
        kind: 'chem.smiles',
        value: { smiles: 'CCO' },
        id: 'a',
        key: 'structure',
        label: 'Ethanol',
      },
    ],
  });
});

test('a label is cut, and only so many items are read', () => {
  const items = Array.from({ length: MAX_ITEMS + 10 }, () => ({
    kind: 'chem.smiles',
    value: { smiles: 'C' },
    label: 'x'.repeat(200),
  }));
  const request = parseRequest({
    type: 'load',
    id: 'l1',
    document: 'd',
    items,
  });

  expect(request?.type === 'load' ? request.items : null).toHaveLength(
    MAX_ITEMS,
  );
  expect(request?.type === 'load' ? request.items[0]?.label : null).toBe(
    'x'.repeat(MAX_LABEL_LENGTH),
  );
});

test('a get keeps its string keys', () => {
  expect(
    parseRequest({ type: 'get', id: 'g1', keys: ['conformer', 3, null] }),
  ).toStrictEqual({ type: 'get', id: 'g1', keys: ['conformer'] });
  expect(parseRequest({ type: 'get', id: 'g2' })).toStrictEqual({
    type: 'get',
    id: 'g2',
    keys: [],
  });
});

test('anything else goes unanswered', () => {
  expect(parseRequest(null)).toBeNull();
  expect(parseRequest('load')).toBeNull();
  expect(parseRequest({ type: 'load', document: 'd', items: [] })).toBeNull();
  expect(parseRequest({ type: 'load', id: 'l1', items: [] })).toBeNull();
  expect(parseRequest({ type: 'load', id: 'l1', document: 'd' })).toBeNull();
  expect(parseRequest({ type: 'save', id: 's1', items: [] })).toBeNull();
});

test('connect is recognised in this version only', () => {
  expect(isConnect({ type: 'cheminfo:connect', version: 1 })).toBe(true);
  expect(isConnect({ type: 'cheminfo:connect', version: 2 })).toBe(false);
  expect(isConnect({ type: 'cheminfo:hello', version: 1 })).toBe(false);
  expect(isConnect(null)).toBe(false);
});
