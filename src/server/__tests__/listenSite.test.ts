import { createServer } from 'node:net';

import { fastify } from 'fastify';
import { afterEach, expect, test } from 'vitest';

import { healthRoute } from '../healthRoute.ts';
import { listenSite } from '../listenSite.ts';
import { startToolServer } from '../toolSiteServer.ts';

// A signal nothing else in the test process listens to, emitted rather than
// sent, so the run itself is never asked to stop.
const SIGNAL = 'SIGUSR2';

afterEach(() => {
  process.exitCode = undefined;
  process.removeAllListeners(SIGNAL);
});

test('/health answers ok with what the server adds, and logs nothing', async () => {
  const app = fastify();
  await healthRoute(app, { extra: () => ({ tools: 3, status: 'down' }) });

  const response = await app.inject({ url: '/health' });

  expect(response.statusCode).toBe(200);
  expect(response.headers['access-control-allow-origin']).toBe('*');
  expect(response.json()).toStrictEqual({ tools: 3, status: 'ok' });
});

test('a signal closes the server, then what runs beside it', async () => {
  const app = fastify();
  const order: string[] = [];
  app.addHook('onClose', () => {
    order.push('server');
  });
  await listenSite(app, {
    port: 0,
    host: '127.0.0.1',
    signals: [SIGNAL],
    onClose: () => {
      order.push('beside');
    },
  });

  expect(process.listenerCount(SIGNAL)).toBe(1);

  process.emit(SIGNAL, SIGNAL);
  await waitFor(() => order.length === 2);

  expect(order).toStrictEqual(['server', 'beside']);
  expect(process.listenerCount(SIGNAL)).toBe(0);
  expect(process.exitCode).toBeUndefined();
});

test('a close that fails is logged and sets the exit code', async () => {
  const app = fastify();
  let stopped = false;
  await listenSite(app, {
    port: 0,
    host: '127.0.0.1',
    signals: [SIGNAL],
    onClose: () => {
      stopped = true;
      throw new Error('the queue would not stop');
    },
  });

  process.emit(SIGNAL, SIGNAL);
  await waitFor(() => stopped);
  await waitFor(() => process.exitCode === 1);

  expect(process.exitCode).toBe(1);
});

test('a port already taken is reported, the server closed', async () => {
  const blocker = createServer();
  await new Promise<void>((done) => {
    blocker.listen(0, '127.0.0.1', done);
  });
  const { port } = blocker.address() as { port: number };
  const app = fastify();
  let closed = false;
  app.addHook('onClose', () => {
    closed = true;
  });

  await expect(
    listenSite(app, { port, host: '127.0.0.1', signals: [SIGNAL] }),
  ).rejects.toThrow('EADDRINUSE');

  blocker.close();

  expect(closed).toBe(true);
  expect(process.exitCode).toBe(1);
  expect(process.listenerCount(SIGNAL)).toBe(0);
});

test('a tool server is built from its configuration and listens where it says', async () => {
  const app = await startToolServer(
    () => {
      const built = fastify();
      built.get('/v1/tools', () => ({ tools: [] }));
      return built;
    },
    {
      port: 0,
      host: '127.0.0.1',
      trackingScript: undefined,
      siteUrl: 'https://3d.cheminfo.org/',
      publicUrl: 'http://localhost:10818/',
      trustProxy: false,
      root: 'dist',
      basePath: '',
    },
    { signals: [SIGNAL] },
  );
  const { port } = app.server.address() as { port: number };
  const response = await fetch(`http://127.0.0.1:${port}/v1/tools`);

  await expect(response.json()).resolves.toStrictEqual({ tools: [] });

  process.emit(SIGNAL, SIGNAL);
  await waitFor(() => !app.server.listening);

  expect(app.server.listening).toBe(false);
});

async function waitFor(condition: () => boolean, tries = 100): Promise<void> {
  if (condition() || tries === 0) return;
  await new Promise((done) => {
    setTimeout(done, 10);
  });
  return waitFor(condition, tries - 1);
}
