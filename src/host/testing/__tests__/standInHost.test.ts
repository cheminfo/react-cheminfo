import { expect, test } from 'vitest';

import { readStandInHostLog, startStandInHost } from '../standInHost.ts';

test('the host page is served on 127.0.0.1, carrying its setup in its address', async () => {
  const host = await startStandInHost();
  try {
    expect(host.origin).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);

    const url = host.pageUrl('http://localhost:10600/?embed=1', [
      { type: 'load', id: 'l1', document: 'd', items: [] },
    ]);
    const setup = new URL(url).searchParams.get('setup');

    expect(JSON.parse(setup ?? '')).toStrictEqual({
      toolUrl: 'http://localhost:10600/?embed=1',
      requests: [{ type: 'load', id: 'l1', document: 'd', items: [] }],
    });

    const response = await fetch(url);

    expect(response.headers.get('content-type')).toBe(
      'text/html; charset=utf-8',
    );

    const page = await response.text();

    expect(page).toContain('<iframe id="tool"');
    expect(page).toContain("type: 'cheminfo:connect', version: 1");
  } finally {
    await host.close();
  }
});

test('the log is read off the page it was recorded in', () => {
  const log = { hello: null, results: [{ type: 'result', id: 'l1' }] };
  (globalThis as unknown as { hostLog: unknown }).hostLog = log;

  expect(readStandInHostLog()).toBe(log);
});

test('a setup carrying a whole spectrum still opens the page', async () => {
  const host = await startStandInHost();
  try {
    const jdx = '##TITLE=film\n'.padEnd(60_000, '1 2 3\n');
    const url = host.pageUrl('http://localhost:10600/?embed=1', [
      { type: 'load', id: 'l1', document: 'd', items: [{ jdx }] },
    ]);

    const response = await fetch(url);

    expect(response.status).toBe(200);
  } finally {
    await host.close();
  }
});
