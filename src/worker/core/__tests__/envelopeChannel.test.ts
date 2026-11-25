import { expect, expectTypeOf, test } from 'vitest';

import { createEnvelopeChannel } from '../envelopeChannel.ts';
import type { KindRequest } from '../kindChannel.ts';
import { createKindChannel } from '../kindChannel.ts';

import { FakeWorker } from './fakeWorker.ts';

type Request = { kind: 'mass'; mf: string } | { kind: 'name'; smiles: string };

interface Responses {
  mass: number;
  name: string;
}

interface Envelope {
  budget: number;
}

test('a request travels in its envelope and is answered with the type of its kind', async () => {
  const worker = new FakeWorker();
  const channel = createEnvelopeChannel<Request, Responses, Envelope>(worker);

  const mass = channel.request({ kind: 'mass', mf: 'C2H6O' }, { budget: 64 });
  const name = channel.request({ kind: 'name', smiles: 'CCO' }, { budget: 32 });

  expectTypeOf(mass).toEqualTypeOf<Promise<number>>();
  expectTypeOf(name).toEqualTypeOf<Promise<string>>();

  expect(worker.sent).toStrictEqual([
    { id: 1, request: { budget: 64, request: { kind: 'mass', mf: 'C2H6O' } } },
    {
      id: 2,
      request: { budget: 32, request: { kind: 'name', smiles: 'CCO' } },
    },
  ]);

  worker.reply(2, 'ethanol');
  worker.reply(1, 46.07);

  await expect(Promise.all([mass, name])).resolves.toStrictEqual([
    46.07,
    'ethanol',
  ]);
  expect(channel.pendingCount).toBe(0);
});

test('an envelope posted alone carries what it adds, and settles once the worker has read it', async () => {
  const worker = new FakeWorker();
  const channel = createEnvelopeChannel<Request, Responses, Envelope>(worker);

  const posted = channel.post({ budget: 16 });

  expect(worker.sent).toStrictEqual([{ id: 1, request: { budget: 16 } }]);
  expect(channel.pendingCount).toBe(1);

  worker.reply(1, null);

  await expect(posted).resolves.toBeUndefined();
  expect(channel.pendingCount).toBe(0);
});

test('a request typed by a kind of its caller is posted without a cast', async () => {
  const envelopeWorker = new FakeWorker();
  const kindWorker = new FakeWorker();
  const enveloped = createEnvelopeChannel<Request, Responses, Envelope>(
    envelopeWorker,
  );
  const plain = createKindChannel<Request, Responses>(kindWorker);
  function ask<TKind extends Request['kind']>(
    request: KindRequest<Request, TKind>,
  ): Promise<[Responses[TKind], Responses[TKind]]> {
    return Promise.all([
      enveloped.request(request, { budget: 8 }),
      plain.request(request),
    ]);
  }

  const asked = ask({ kind: 'mass', mf: 'H2O' });

  expectTypeOf(asked).toEqualTypeOf<Promise<[number, number]>>();

  expect([envelopeWorker.sent, kindWorker.sent]).toStrictEqual([
    [{ id: 1, request: { budget: 8, request: { kind: 'mass', mf: 'H2O' } } }],
    [{ id: 1, request: { kind: 'mass', mf: 'H2O' } }],
  ]);

  envelopeWorker.reply(1, 18.02);
  kindWorker.reply(1, 18.01);

  await expect(asked).resolves.toStrictEqual([18.02, 18.01]);
});
