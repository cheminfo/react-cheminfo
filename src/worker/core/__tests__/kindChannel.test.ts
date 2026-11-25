import { expect, expectTypeOf, test } from 'vitest';

import { createKindChannel } from '../kindChannel.ts';

import { FakeWorker } from './fakeWorker.ts';

type Request = { kind: 'mass'; mf: string } | { kind: 'name'; smiles: string };

interface Responses {
  mass: number;
  name: string;
}

test('each kind of request is answered with the type of its kind', async () => {
  const worker = new FakeWorker();
  const channel = createKindChannel<Request, Responses>(worker);

  const mass = channel.request({ kind: 'mass', mf: 'C2H6O' });
  const name = channel.request({ kind: 'name', smiles: 'CCO' });

  expectTypeOf(mass).toEqualTypeOf<Promise<number>>();
  expectTypeOf(name).toEqualTypeOf<Promise<string>>();

  expect(channel.pendingCount).toBe(2);
  expect(worker.sent).toStrictEqual([
    { id: 1, request: { kind: 'mass', mf: 'C2H6O' } },
    { id: 2, request: { kind: 'name', smiles: 'CCO' } },
  ]);

  worker.reply(2, 'ethanol');
  worker.reply(1, 46.07);

  await expect(Promise.all([mass, name])).resolves.toStrictEqual([
    46.07,
    'ethanol',
  ]);
  expect(channel.pendingCount).toBe(0);
});
