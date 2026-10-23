import { expect, test, vi } from 'vitest';

import { serveWorkerRequests } from '../serveWorkerRequests.ts';

class SiteError extends Error {
  override name = 'SiteError';
  constructor(
    readonly key: string,
    message: string,
  ) {
    super(message);
  }
}

test('a served worker adds the detail of its failure to the answer', async () => {
  const posted: unknown[] = [];
  let deliver: ((event: { data: unknown }) => void) | undefined;
  const scope = {
    addEventListener: (
      _type: 'message',
      listener: (event: { data: unknown }) => void,
    ) => {
      deliver = listener;
    },
    postMessage: (message: unknown) => {
      posted.push(message);
    },
  };
  serveWorkerRequests(
    (smiles: string) => {
      if (smiles === '') throw new SiteError('error.empty', 'empty SMILES');
      throw new Error('unexpected');
    },
    {
      scope,
      detail: (error) => {
        if (error instanceof SiteError) return { key: error.key };
        throw new Error('no key for that one');
      },
    },
  );

  deliver?.({ data: { id: 1, request: '' } });
  deliver?.({ data: { id: 2, request: 'C' } });

  await vi.waitFor(() => {
    expect(posted).toStrictEqual([
      {
        id: 1,
        ok: false,
        message: 'empty SMILES',
        detail: { key: 'error.empty' },
      },
      { id: 2, ok: false, message: 'unexpected' },
    ]);
  });
});
