import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { HostMessageEvent, LoadedInput } from '../connectHost.ts';
import { connectHost } from '../connectHost.ts';
import { OUTPUT_DELAY } from '../hostOutputs.ts';
import type { HostItem, ToolInterface } from '../protocol.ts';
import { parseRequest } from '../protocol.ts';

/** A site taking spectra and handing back the bands picked on each. */
const TOOL: ToolInterface = {
  name: 'vibrations',
  inputs: [{ key: 'spectra', kinds: ['spectra.ir.jdx'], many: true }],
  outputs: [{ key: 'peaks', kind: 'spectra.ir.peaks' }],
};

/**
 * The bands handed back for one spectrum.
 * @param id - The item the spectrum was loaded from.
 * @param wavenumbers - Where its bands are.
 * @returns The output item.
 */
function peaks(id: string, ...wavenumbers: number[]): HostItem {
  return {
    key: 'peaks',
    kind: 'spectra.ir.peaks',
    id,
    value: { peaks: wavenumbers.map((wavenumber) => ({ wavenumber })) },
  };
}

/** A load of two spectra, as a notebook sends it. */
const LOAD = {
  type: 'load',
  id: 'l1',
  document: 'eln:sample',
  items: [
    { kind: 'spectra.ir.jdx', id: 'a.jdx', value: { jdx: 'A' } },
    { kind: 'spectra.ir.jdx', id: 'b.jdx', value: { jdx: 'B' } },
  ],
  accept: ['peaks'],
};

/**
 * The site's side, connected to a host holding the other end of a real port,
 * with outputs the test sets the way a site's state would.
 * @param load - The site's load function.
 * @returns The host's port, everything it received, and the means to change
 * the outputs and to stop.
 */
function connect(load: (inputs: readonly LoadedInput[]) => unknown) {
  let items: HostItem[] = [];
  const listeners = new Set<() => void>();
  const host = { postMessage: () => undefined };
  const hearing: { hear: ((event: HostMessageEvent) => void) | null } = {
    hear: null,
  };
  const stop = connectHost({
    host,
    listen(next) {
      hearing.hear = next;
      return () => {
        hearing.hear = null;
      };
    },
    tool: TOOL,
    origin: 'https://vibrations.cheminfo.org',
    build: null,
    load: async (inputs) => {
      await load(inputs);
    },
    outputs: {
      read: () => items,
      subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    },
  });
  const channel = new MessageChannel();
  hearing.hear?.({
    data: { type: 'cheminfo:connect', version: 1 },
    source: host,
    ports: [channel.port2],
  });
  const received: unknown[] = [];
  channel.port1.addEventListener('message', (event) => {
    received.push(event.data);
  });
  channel.port1.start();

  return {
    port: channel.port1,
    received,
    setOutputs(next: HostItem[]) {
      items = next;
      for (const listener of listeners) listener();
    },
    close() {
      stop();
      channel.port1.close();
    },
  };
}

/**
 * Send a request and wait for the result carrying its id, so that whatever the
 * site sent before it has arrived too.
 * @param site - The connection.
 * @param request - The request, with its `id`.
 * @returns The result.
 */
async function ask(
  site: ReturnType<typeof connect>,
  request: Record<string, unknown> & { id: string },
): Promise<unknown> {
  site.port.postMessage(request);
  return vi.waitFor(() => {
    const result = site.received.find(
      (message) => (message as { id?: string }).id === request.id,
    );
    if (result === undefined) throw new Error(`No answer to ${request.id}`);
    return result;
  });
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
});

afterEach(() => {
  vi.useRealTimers();
});

test('a load names what the host takes back, in strings only', () => {
  expect(parseRequest({ ...LOAD, accept: ['peaks', 3] })).toMatchObject({
    accept: ['peaks'],
  });
});

test('get answers the values asked for, and no-output for a key not handed back', async () => {
  const site = connect(() => undefined);
  site.setOutputs([peaks('a.jdx', 1715)]);

  await expect(
    ask(site, { type: 'get', id: 'g1', keys: ['peaks'] }),
  ).resolves.toStrictEqual({
    type: 'result',
    id: 'g1',
    ok: true,
    items: [peaks('a.jdx', 1715)],
  });
  await expect(
    ask(site, { type: 'get', id: 'g2', keys: ['conformer'] }),
  ).resolves.toStrictEqual({
    type: 'result',
    id: 'g2',
    ok: false,
    error: {
      code: 'no-output',
      message: 'vibrations has no output called conformer.',
    },
  });

  site.close();
});

test('opening a document sends nothing back; a change goes back alone, once settled', async () => {
  const site = connect(() => {
    site.setOutputs([peaks('a.jdx', 1715), peaks('b.jdx', 2950)]);
  });
  await ask(site, LOAD);
  vi.advanceTimersByTime(OUTPUT_DELAY);
  await ask(site, { type: 'get', id: 'g1', keys: [] });

  expect(
    site.received.map((message) => (message as { type: string }).type),
  ).toStrictEqual(['result', 'result']);

  // A burst of edits on the first spectrum is one message, carrying it alone.
  site.setOutputs([peaks('a.jdx', 1715, 1600), peaks('b.jdx', 2950)]);
  site.setOutputs([peaks('a.jdx', 1600), peaks('b.jdx', 2950)]);
  vi.advanceTimersByTime(OUTPUT_DELAY);
  await ask(site, { type: 'get', id: 'g2', keys: [] });

  expect(site.received.slice(2, 3)).toStrictEqual([
    { type: 'output', document: 'eln:sample', items: [peaks('a.jdx', 1600)] },
  ]);

  site.close();
});

test('a document that accepts nothing is sent nothing', async () => {
  const site = connect(() => {
    site.setOutputs([peaks('a.jdx', 1715)]);
  });
  await ask(site, { ...LOAD, accept: undefined });
  site.setOutputs([peaks('a.jdx', 1600)]);
  vi.advanceTimersByTime(OUTPUT_DELAY);
  await ask(site, { type: 'get', id: 'g1', keys: [] });

  expect(
    site.received.map((message) => (message as { id: string }).id),
  ).toStrictEqual(['l1', 'g1']);

  site.close();
});

test('a get sent behind a slow load reads what that load showed', async () => {
  const pending: { finish: (() => void) | null } = { finish: null };
  const site = connect(
    () =>
      new Promise<void>((resolve) => {
        pending.finish = () => {
          site.setOutputs([peaks('a.jdx', 1715)]);
          resolve();
        };
      }),
  );
  site.port.postMessage(LOAD);
  const answer = ask(site, { type: 'get', id: 'g1', keys: ['peaks'] });
  const finish = await vi.waitFor(() => {
    if (pending.finish === null) throw new Error('The load has not begun');
    return pending.finish;
  });
  finish();

  await expect(answer).resolves.toMatchObject({
    items: [peaks('a.jdx', 1715)],
  });
  expect(
    site.received.map((message) => (message as { id: string }).id),
  ).toStrictEqual(['l1', 'g1']);

  site.close();
});

test('an edit still settling when another document opens goes back under its own', async () => {
  const site = connect((inputs) => {
    site.setOutputs([peaks(inputs[0]?.item.id ?? '', 1715)]);
  });
  await ask(site, LOAD);
  site.setOutputs([peaks('a.jdx', 1600)]);

  // Answered without moving the clock: the edit has not settled yet.
  const opened = new Promise((resolve) => {
    site.port.addEventListener('message', (event) => {
      if ((event.data as { id?: string }).id === 'l2') resolve(event.data);
    });
  });
  site.port.postMessage({
    ...LOAD,
    id: 'l2',
    document: 'eln:other',
    items: [{ kind: 'spectra.ir.jdx', id: 'c.jdx', value: { jdx: 'C' } }],
  });
  await opened;
  vi.advanceTimersByTime(OUTPUT_DELAY);

  expect(
    site.received.filter(
      (message) => (message as { type: string }).type === 'output',
    ),
  ).toStrictEqual([
    { type: 'output', document: 'eln:sample', items: [peaks('a.jdx', 1600)] },
  ]);

  site.close();
});

test.each([
  [['spectra.ir.peaks'], 1],
  [['spectra.ir'], 1],
  [['spectra.nmr'], 0],
])('a host taking back %j by kind is sent %i output', async (accept, count) => {
  const site = connect(() => {
    site.setOutputs([peaks('a.jdx', 1715)]);
  });
  await ask(site, { ...LOAD, accept });
  site.setOutputs([peaks('a.jdx', 1600)]);
  vi.advanceTimersByTime(OUTPUT_DELAY);
  await ask(site, { type: 'get', id: 'g1', keys: [] });

  expect(
    site.received.filter(
      (message) => (message as { type: string }).type === 'output',
    ),
  ).toHaveLength(count);

  site.close();
});
