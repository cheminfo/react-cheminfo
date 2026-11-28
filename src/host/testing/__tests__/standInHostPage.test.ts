import type { Page } from '@playwright/test';
import { afterEach, expect, test, vi } from 'vitest';

import type { StandInHostLog } from '../standInHost.ts';
import {
  framedAddress,
  framedParameter,
  framedSite,
  sendWhenConnected,
  standInHostAnswer,
  standInHostFigure,
  standInHostNextResult,
  standInHostResults,
} from '../standInHostPage.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

/**
 * The host's page, run in the test's own window: its log, and the port the
 * site has connected through or not yet.
 * @returns The page, its log, and what was sent on the port.
 */
function hostPage() {
  const log: StandInHostLog = { hello: null, results: [], settings: [] };
  const sent: unknown[] = [];
  vi.stubGlobal('hostLog', log);
  vi.stubGlobal('hostPort', null);
  const page = {
    evaluate: async (run: (argument: unknown) => unknown, argument: unknown) =>
      run(argument),
    frames: () => [
      { url: () => 'http://127.0.0.1:53211/?setup=%7B%7D' },
      { url: () => 'http://localhost:10603/?embed=1&smiles=CCO' },
    ],
  } as unknown as Page;
  const connect = () => {
    vi.stubGlobal('hostPort', {
      postMessage: (message: unknown) => sent.push(message),
    });
  };
  return { page, log, sent, connect };
}

test('every message the site sent is read off the log, in order', async () => {
  const { page, log } = hostPage();
  log.results.push({ type: 'result', id: 'l1', ok: true }, { type: 'output' });

  await expect(standInHostResults(page)).resolves.toStrictEqual([
    { type: 'result', id: 'l1', ok: true },
    { type: 'output' },
  ]);
});

test('the answer to a request is waited for, and the first one with its id is it', async () => {
  const { page, log } = hostPage();
  log.results.push({ type: 'output' });
  setTimeout(() => {
    log.results.push(
      { type: 'result', id: 'g1', ok: true, items: [] },
      { type: 'result', id: 'g1', ok: false },
    );
  }, 50);

  await expect(standInHostAnswer(page, 'g1')).resolves.toStrictEqual({
    type: 'result',
    id: 'g1',
    ok: true,
    items: [],
  });
});

test('an answer that never comes fails, naming the request', async () => {
  const { page } = hostPage();

  await expect(standInHostAnswer(page, 'g2', { timeout: 0 })).rejects.toThrow(
    'no answer to the request g2',
  );
});

test('a request waits for the site to connect, and is sent once', async () => {
  const { page, sent, connect } = hostPage();
  setTimeout(connect, 50);

  await sendWhenConnected(page, { type: 'get', id: 'g1', keys: ['figure'] });

  expect(sent).toStrictEqual([{ type: 'get', id: 'g1', keys: ['figure'] }]);
});

test('a request to a site that never connects fails, and says so', async () => {
  const { page, sent } = hostPage();

  await expect(sendWhenConnected(page, {}, { timeout: 0 })).rejects.toThrow(
    'the site never connected to the host',
  );
  expect(sent).toStrictEqual([]);
});

test("a host's Done asks for the figure at once, and reads its answer", async () => {
  const { page, log, sent, connect } = hostPage();
  connect();
  const answer = {
    type: 'result',
    id: 'f1',
    ok: true,
    items: [{ key: 'figure', kind: 'image.svg', value: { svg: '<svg/>' } }],
  };
  log.results.push(answer);

  const figure = await standInHostFigure(page, 'f1');

  expect(sent).toStrictEqual([{ type: 'get', id: 'f1', keys: ['figure'] }]);
  expect(figure).toStrictEqual(answer);
  expect(figure.items?.[0]?.value.svg).toBe('<svg/>');
});

test('the next result is the one more message a request brings, whatever its id', async () => {
  const { page, log, connect } = hostPage();
  connect();
  log.results.push({ type: 'result', id: 'l1' });
  setTimeout(() => log.results.push({ type: 'result', items: [] }), 50);

  await expect(
    standInHostNextResult(page, { type: 'get', id: 'g1', keys: ['figure'] }),
  ).resolves.toStrictEqual({ type: 'result', items: [] });
});

test('the address of the framed site is its frame, empty before it loads', () => {
  const { page } = hostPage();

  expect(framedAddress(page, 'http://localhost:10603')).toBe(
    'http://localhost:10603/?embed=1&smiles=CCO',
  );
  expect(framedAddress(page, 'http://localhost:10604')).toBe('');
});

test('the frame showing the site, and one parameter of its address', () => {
  const { page } = hostPage();

  expect(framedSite(page, 'http://localhost:10603').url()).toBe(
    'http://localhost:10603/?embed=1&smiles=CCO',
  );
  expect(framedParameter(page, 'http://localhost:10603', 'smiles')).toBe('CCO');
  expect(framedParameter(page, 'http://localhost:10603', 'split')).toBeNull();
  expect(() => framedSite(page, 'http://localhost:10604')).toThrow(
    'The site is not framed.',
  );
});
