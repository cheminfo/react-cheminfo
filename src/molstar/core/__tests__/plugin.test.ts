/**
 * The lifecycle of a canvas: the spec it is mounted with, every call queued
 * behind initialisation, and a disposal that can come at any time — before the
 * canvas exists, while a call is running, or after initialisation failed.
 *
 * molstar's view model needs WebGL to initialise, so it is replaced by one
 * whose initialisation the test settles; everything `MolstarPlugin` does with
 * it is the real code.
 */

import type { PluginSpec } from 'molstar/lib/mol-plugin/spec.js';
import { Color } from 'molstar/lib/mol-util/color/color.js';
import { beforeEach, expect, test, vi } from 'vitest';

import { MolstarPlugin } from '../plugin.ts';

const models = vi.hoisted(
  () =>
    [] as Array<{
      spec: PluginSpec;
      mounted: unknown[];
      log: string[];
      settle: (error?: Error) => void;
    }>,
);

vi.mock('molstar/lib/extensions/plugin/view-model.js', () => ({
  PluginViewModel: class {
    readonly initialized: Promise<void>;
    readonly plugin: {
      handleResize: () => void;
      dispose: () => void;
      name: string;
    };

    constructor({ spec }: { spec: PluginSpec }) {
      const log: string[] = [];
      let settle: ((error?: Error) => void) | undefined;
      this.initialized = new Promise<void>((resolve, reject) => {
        settle = (error) => {
          if (error === undefined) resolve();
          else reject(error);
        };
      });
      this.plugin = {
        name: 'the context',
        handleResize: () => log.push('resize'),
        dispose: () => log.push('dispose'),
      };
      models.push({
        spec,
        mounted: [],
        log,
        settle: (error) => settle?.(error),
      });
    }

    mount(root: unknown) {
      models.at(-1)?.mounted.push(root);
    }
  },
}));

beforeEach(() => {
  models.length = 0;
});

const CONTAINER = { id: 'viewer' } as unknown as HTMLElement;

test('the canvas is mounted at once, with its background, no axes, and the site’s last word on the spec', () => {
  const plugin = new MolstarPlugin(CONTAINER, {
    background: '#102030',
    cameraResetDurationMilliseconds: 0,
    spec: (spec) => ({ ...spec, config: [] }),
  });
  const [model] = models;
  const canvas = model?.spec.canvas3d;

  expect(model?.mounted).toStrictEqual([CONTAINER]);
  expect(plugin.disposed).toBe(false);
  expect(canvas?.renderer).toStrictEqual({
    backgroundColor: Color.fromHexStyle('#102030'),
  });
  expect(canvas?.camera).toStrictEqual({
    helper: { axes: { name: 'off', params: {} } },
  });
  expect(canvas?.cameraResetDurationMs).toBe(0);
  expect(model?.spec.config).toStrictEqual([]);
});

test('with no options the background is white and molstar keeps its own reframing', () => {
  const plugin = new MolstarPlugin(CONTAINER);
  const canvas = models[0]?.spec.canvas3d;

  expect(canvas?.renderer).toStrictEqual({
    backgroundColor: Color.fromHexStyle('#ffffff'),
  });
  expect(canvas !== undefined && 'cameraResetDurationMs' in canvas).toBe(false);
  expect(plugin.disposed).toBe(false);
});

test('a call waits for the canvas, then runs on its context', async () => {
  const plugin = new MolstarPlugin(CONTAINER);
  const ran: string[] = [];
  const result = plugin.run((context) => {
    ran.push((context as unknown as { name: string }).name);
    return 42;
  });

  expect(ran).toStrictEqual([]);

  models[0]?.settle();

  await expect(result).resolves.toBe(42);
  expect(ran).toStrictEqual(['the context']);
});

test('a call made after disposal does nothing', async () => {
  const plugin = new MolstarPlugin(CONTAINER);
  models[0]?.settle();
  plugin.dispose();
  let ran = false;

  await expect(
    plugin.run(() => {
      ran = true;
    }),
  ).resolves.toBeUndefined();
  expect(ran).toBe(false);
  expect(plugin.disposed).toBe(true);
});

test('a call queued before disposal never runs once the canvas is torn down', async () => {
  const plugin = new MolstarPlugin(CONTAINER);
  let ran = false;
  const result = plugin.run(() => {
    ran = true;
  });
  plugin.dispose();
  models[0]?.settle();

  await expect(result).resolves.toBeUndefined();
  expect(ran).toBe(false);
});

test('a call that fails while the canvas is alive reaches the caller; one cut short by disposal does not', async () => {
  const plugin = new MolstarPlugin(CONTAINER);
  models[0]?.settle();

  await expect(
    plugin.run(() => {
      throw new Error('no atoms');
    }),
  ).rejects.toThrow('no atoms');
  await expect(
    plugin.run(async () => {
      plugin.dispose();
      throw new Error('the canvas went away');
    }),
  ).resolves.toBeUndefined();
});

test('an initialisation failure reaches the caller, and disposal still releases the canvas', async () => {
  const plugin = new MolstarPlugin(CONTAINER);
  models[0]?.settle(new Error('no WebGL'));

  await expect(plugin.run(() => 1)).rejects.toThrow('no WebGL');

  plugin.dispose();
  plugin.dispose();
  await flush();

  expect(models[0]?.log).toStrictEqual(['dispose']);
});

test('the context is disposed once, after initialisation, however often dispose is called', async () => {
  const plugin = new MolstarPlugin(CONTAINER);
  plugin.dispose();
  plugin.dispose();

  expect(models[0]?.log).toStrictEqual([]);

  models[0]?.settle();
  await plugin.ready;
  await flush();

  expect(models[0]?.log).toStrictEqual(['dispose']);
});

test('a resize reaches the context only while the canvas is alive', () => {
  const plugin = new MolstarPlugin(CONTAINER);
  plugin.handleResize();
  plugin.dispose();
  plugin.handleResize();

  expect(models[0]?.log).toStrictEqual(['resize']);
});

test('a subscription starts once the canvas exists, and stops when asked', async () => {
  const plugin = new MolstarPlugin(CONTAINER);
  const log: string[] = [];
  const stop = plugin.subscribe(() => {
    log.push('start');
    return () => log.push('stop');
  });

  expect(log).toStrictEqual([]);

  models[0]?.settle();
  await plugin.run(() => undefined);

  expect(log).toStrictEqual(['start']);

  stop();
  stop();

  expect(log).toStrictEqual(['start', 'stop']);
});

test('a subscription stopped before the canvas exists never starts', async () => {
  const plugin = new MolstarPlugin(CONTAINER);
  let started = false;
  const stop = plugin.subscribe(() => {
    started = true;
    return stopNothing;
  });
  stop();
  models[0]?.settle();
  await plugin.run(() => undefined);

  expect(started).toBe(false);
});

function stopNothing(): void {
  // The subscription never started, so there is nothing to stop.
}

function flush(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}
