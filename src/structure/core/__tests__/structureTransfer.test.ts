import { expect, test } from 'vitest';

import type { StructureTransferSource } from '../structureTransfer.ts';
import {
  carriesStructure,
  readStructureTransfer,
} from '../structureTransfer.ts';

function transfer(text: string, files: File[] = []): StructureTransferSource {
  return {
    files,
    getData: (format) => (format === 'text' ? text : ''),
  };
}

test('pasted text is trimmed', () => {
  expect(readStructureTransfer(transfer('  CC=O\n'))).toStrictEqual({
    kind: 'text',
    text: 'CC=O',
  });
});

test('files win over the name a copied file carries as text', () => {
  const file = new File(['CC=O'], 'ethanal.smi');

  expect(readStructureTransfer(transfer('ethanal.smi', [file]))).toStrictEqual({
    kind: 'files',
    files: [file],
  });
});

test('blank text and a missing transfer carry nothing', () => {
  expect(readStructureTransfer(transfer(' \n\t'))).toBeNull();
  expect(readStructureTransfer(null)).toBeNull();
});

test('a drag of files or of plain text may carry a structure', () => {
  expect(carriesStructure(['Files'])).toBe(true);
  expect(carriesStructure(['text/plain', 'text/html'])).toBe(true);
  expect(carriesStructure(['text/uri-list'])).toBe(false);
  expect(carriesStructure([])).toBe(false);
});
