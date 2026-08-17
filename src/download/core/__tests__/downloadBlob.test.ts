import { afterEach, expect, test, vi } from 'vitest';

import { downloadBlob } from '../downloadBlob.ts';
import { downloadText } from '../downloadText.ts';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test('the blob is offered under the name asked for, then released', async () => {
  const page = stubPage();

  downloadBlob(new Blob(['a,b\n1,2\n'], { type: 'text/csv' }), 'table.csv');

  expect(page.anchor.download).toBe('table.csv');
  expect(page.anchor.href).toBe('blob:stub/1');
  expect(page.clicks).toBe(1);
  expect(page.revoked).toStrictEqual(['blob:stub/1']);
  await expect(page.saved()).resolves.toBe('a,b\n1,2\n');
});

test('the anchor is in the document while it is clicked, and gone after', () => {
  const page = stubPage();

  downloadBlob(new Blob(['x']), 'x.txt');

  expect(page.order).toStrictEqual(['append', 'click', 'remove', 'revoke']);
});

test('text is saved as a plain text file when no type is given', async () => {
  const page = stubPage();

  downloadText('CCO\nCCC\n', 'structures.smi');

  expect(page.anchor.download).toBe('structures.smi');
  expect(page.blobs[0]?.type).toBe('text/plain;charset=utf-8');
  await expect(page.saved()).resolves.toBe('CCO\nCCC\n');
});

test('the type a caller gives is what the saved file carries', () => {
  const page = stubPage();

  downloadText('a,b\n', 'table.csv', 'text/csv;charset=utf-8');

  expect(page.blobs[0]?.type).toBe('text/csv;charset=utf-8');
});

interface PageStub {
  anchor: { href: string; download: string };
  blobs: Blob[];
  clicks: number;
  revoked: string[];
  order: string[];
  saved: () => Promise<string>;
}

function stubPage(): PageStub {
  const anchor = {
    href: '',
    download: '',
    click: () => {
      stub.clicks++;
      stub.order.push('click');
    },
    remove: () => stub.order.push('remove'),
  };
  const stub: PageStub = {
    anchor,
    blobs: [],
    clicks: 0,
    revoked: [],
    order: [],
    saved: () => stub.blobs[0]?.text() ?? Promise.resolve(''),
  };

  vi.stubGlobal('document', {
    createElement: () => anchor,
    body: { append: () => stub.order.push('append') },
  });
  vi.spyOn(URL, 'createObjectURL').mockImplementation(
    (blob: Blob | MediaSource) => {
      stub.blobs.push(blob as Blob);
      return `blob:stub/${stub.blobs.length}`;
    },
  );
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation((url: string) => {
    stub.revoked.push(url);
    stub.order.push('revoke');
  });

  return stub;
}
