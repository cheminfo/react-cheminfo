import { expect, test } from 'vitest';

import { selectInputs } from '../connectHost.ts';
import { checkValue, isKnownKind, kindAccepts } from '../kinds.ts';
import type { ToolInterface } from '../protocol.ts';

// Zenodo's own name for the field, which is not camelCase.
const PUBLICATION_DATE = 'publication_date';

test('data.zenodo.record is a kind, and data takes it', () => {
  expect(isKnownKind('data.zenodo.record')).toBe(true);
  expect(kindAccepts('data', 'data.zenodo.record')).toBe(true);
  expect(kindAccepts('data.zenodo', 'data.zenodo.record')).toBe(true);
  expect(kindAccepts('data.spectra', 'data.zenodo.record')).toBe(false);
});

test('a valid record passes with its blobs kept as they are', () => {
  const toc = new Blob(['{"samples":[]}'], { type: 'application/json' });
  const archive = new Blob([new Uint8Array([80, 75, 3, 4])]);
  const value = {
    metadata: {
      title: 'Spectra of 12 compounds',
      description: '<p>Twelve compounds.</p>',
      [PUBLICATION_DATE]: '2026-11-18',
      creators: [
        {
          name: 'Doe, Jane',
          affiliation: 'EPFL',
          orcid: '0000-0002-1825-0097',
        },
      ],
      keywords: ['SciPeaks'],
      version: '1.0.0',
      license: { id: 'cc-by-4.0' },
    },
    files: [
      { key: 'toc.json', size: 14, content: toc },
      { key: 'Ethanol.zip', size: 4, content: archive },
    ],
  };

  const outcome = checkValue('data.zenodo.record', value);

  expect(outcome).toStrictEqual({
    valid: true,
    checked: { kind: 'data.zenodo.record', value },
  });
  expect(value.files[0]?.content).toBe(toc);
  expect(value.files[1]?.content).toBe(archive);
});

test('only the title of the metadata is required', () => {
  expect(
    checkValue('data.zenodo.record', { metadata: { title: 'T' }, files: [] }),
  ).toStrictEqual({
    valid: true,
    checked: {
      kind: 'data.zenodo.record',
      value: { metadata: { title: 'T' }, files: [] },
    },
  });
});

test('a record without a title, or a file without a size, is refused', () => {
  expect(
    checkValue('data.zenodo.record', { metadata: {}, files: [] }),
  ).toStrictEqual({
    valid: false,
    errors: ["/metadata: must have required property 'title'"],
  });
  expect(
    checkValue('data.zenodo.record', {
      metadata: { title: 'T' },
      files: [{ key: 'toc.json', content: new Blob([]) }],
    }),
  ).toStrictEqual({
    valid: false,
    errors: ["/files/0: must have required property 'size'"],
  });
});

test('fields the kind does not name are stripped, at every level', () => {
  const content = new Blob(['# Readme']);
  const value = {
    id: 42,
    metadata: {
      title: 'T',
      communities: [{ identifier: 'scipeaks' }],
      creators: [{ name: 'Doe, Jane', email: 'jane.doe@example.org' }],
      license: { id: 'cc-by-4.0', title: 'Creative Commons' },
    },
    files: [{ key: 'README.md', size: 8, content, checksum: 'md5:0' }],
  };

  expect(checkValue('data.zenodo.record', value)).toStrictEqual({
    valid: true,
    checked: {
      kind: 'data.zenodo.record',
      value: {
        metadata: {
          title: 'T',
          creators: [{ name: 'Doe, Jane' }],
          license: { id: 'cc-by-4.0' },
        },
        files: [{ key: 'README.md', size: 8, content }],
      },
    },
  });
  expect(value.files[0]?.content).toBe(content);
});

test('a tool taking a record is handed the item', () => {
  const tool: ToolInterface = {
    name: 'fair',
    inputs: [{ key: 'record', kinds: ['data.zenodo.record'] }],
    outputs: [],
  };
  const value = { metadata: { title: 'T' }, files: [] };

  expect(
    selectInputs(tool, [{ kind: 'data.zenodo.record', value, label: 'T' }]),
  ).toStrictEqual({
    ok: true,
    inputs: [
      {
        key: 'record',
        item: { kind: 'data.zenodo.record', value, label: 'T' },
        checked: { kind: 'data.zenodo.record', value },
      },
    ],
  });
});
