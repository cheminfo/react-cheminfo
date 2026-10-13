import { expect, test } from 'vitest';

import { ETHYLBENZENE, TOOL, request, startHost } from './fakeHost.ts';

test('hello goes to the host, readable by any origin, saying what the site takes', () => {
  const host = startHost();

  expect(host.posted).toStrictEqual([
    {
      targetOrigin: '*',
      message: {
        type: 'cheminfo:hello',
        version: 1,
        tool: {
          name: '3d',
          origin: 'https://3d.cheminfo.org',
          build: { version: '1.2.1' },
          inputs: TOOL.inputs,
          outputs: [],
        },
      },
    },
  ]);

  host.close();
});

test('a document is applied once, in the notation the site prefers', async () => {
  const host = startHost();
  const port = host.connect();
  const items = [
    { kind: 'chem.smiles', value: { smiles: 'CCc1ccccc1' } },
    { kind: 'chem.ocl.id', value: ETHYLBENZENE, label: 'Ethylbenzene' },
  ];
  const taken = {
    type: 'result',
    ok: true,
    used: [{ key: 'structure', kind: 'chem.ocl.id' }],
  };

  await expect(
    request(port, {
      type: 'load',
      id: 'l1',
      document: 'scipeaks:1',
      items,
    }),
  ).resolves.toStrictEqual({ ...taken, id: 'l1' });
  expect(host.loads).toStrictEqual([
    [
      {
        key: 'structure',
        item: {
          kind: 'chem.ocl.id',
          value: ETHYLBENZENE,
          label: 'Ethylbenzene',
        },
        checked: { kind: 'chem.ocl.id', value: ETHYLBENZENE },
      },
    ],
  ]);

  // The same document again — a refocused tab — changes nothing on screen.
  await expect(
    request(port, {
      type: 'load',
      id: 'l2',
      document: 'scipeaks:1',
      items,
    }),
  ).resolves.toStrictEqual({ ...taken, id: 'l2' });
  expect(host.loads).toHaveLength(1);

  await expect(
    request(port, {
      type: 'load',
      id: 'l3',
      document: 'scipeaks:2',
      items: [items[0]],
    }),
  ).resolves.toStrictEqual({
    type: 'result',
    id: 'l3',
    ok: true,
    used: [{ key: 'structure', kind: 'chem.smiles' }],
  });
  expect(host.loads).toHaveLength(2);

  host.close();
});

test('a structure the site cannot read is answered unreadable, and may come again', async () => {
  let calls = 0;
  const host = startHost(() => {
    calls++;
    throw new Error('This idcode could not be read: bad code');
  });
  const port = host.connect();
  const load = {
    type: 'load',
    document: 'scipeaks:1',
    items: [{ kind: 'chem.ocl.id', value: { idCode: '?', coordinates: '' } }],
  };

  await expect(request(port, { ...load, id: 'l1' })).resolves.toStrictEqual({
    type: 'result',
    id: 'l1',
    ok: false,
    error: {
      code: 'unreadable',
      message: 'This idcode could not be read: bad code',
    },
  });

  await request(port, { ...load, id: 'l2' });

  expect(calls).toBe(2);

  host.close();
});

test('get is answered: nothing goes back yet', async () => {
  const host = startHost();
  const port = host.connect();

  await expect(
    request(port, { type: 'get', id: 'g1', keys: ['conformer'] }),
  ).resolves.toStrictEqual({
    type: 'result',
    id: 'g1',
    ok: false,
    error: { code: 'no-output', message: '3d has nothing to give back yet.' },
  });

  host.close();
});

test('a connect from another window, or in another version, is not taken', async () => {
  const host = startHost();
  const port = host.connect();
  // Taking either would close the port the host connected with.
  const stranger = host.connect({});
  const newer = host.connect(host.host, 2);
  const unanswered: unknown[] = [];
  for (const ignored of [stranger, newer]) {
    ignored.addEventListener('message', (event) => {
      unanswered.push(event.data);
    });
    ignored.start();
    ignored.postMessage({ type: 'get', id: 'g0', keys: [] });
  }

  await expect(
    request(port, { type: 'get', id: 'g1', keys: [] }),
  ).resolves.toMatchObject({ id: 'g1' });
  expect(unanswered).toStrictEqual([]);

  host.close();
});

test('a request the site does not know goes unanswered, and the next is served', async () => {
  const host = startHost();
  const port = host.connect();
  port.postMessage({ type: 'save', id: 's1', items: [] });

  await expect(
    request(port, { type: 'get', id: 'g1', keys: [] }),
  ).resolves.toMatchObject({ id: 'g1' });

  host.close();
});

test('stopping closes the port and stops listening', () => {
  const host = startHost();
  host.connect();
  host.stop();

  expect(host.isListening()).toBe(false);

  host.close();
});
