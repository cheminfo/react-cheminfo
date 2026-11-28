import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { Plugin, ResolvedConfig } from 'vite';
import { expect, test } from 'vitest';

import { cheminfoTalks, talkFileResponse } from '../talks.ts';

const TALK = '---\ntitle: Peaks are not molecules\n---\n\n# Peaks\n';

function talksDirectory(): string {
  const root = mkdtempSync(join(tmpdir(), 'cheminfo-talks-serve-'));
  writeFileSync(join(root, '20260824_IMSC.md'), TALK);
  return root;
}

const SOURCE = {
  site: 'nmr',
  origin: 'http://localhost:10915',
  directory: talksDirectory(),
};

test('the dev server lists the decks at /talks.json', () => {
  const answer = talkFileResponse('/talks.json?t=1', SOURCE);

  expect(answer?.contentType).toBe('application/json');
  expect(JSON.parse(answer?.body ?? '')).toStrictEqual({
    site: 'nmr',
    origin: 'http://localhost:10915',
    talks: [
      { id: '20260824_IMSC', title: 'Peaks are not molecules', slideCount: 1 },
    ],
  });
});

test('the dev server answers a deck’s source as written', () => {
  expect(talkFileResponse('/talks/20260824_IMSC.md', SOURCE)).toStrictEqual({
    contentType: 'text/markdown; charset=utf-8',
    body: TALK,
  });
});

test('any other address is left to the dev server', () => {
  expect(talkFileResponse('/talks/nothing.md', SOURCE)).toBeNull();
  expect(talkFileResponse('/talks', SOURCE)).toBeNull();
  expect(talkFileResponse('/talks/20260824_IMSC', SOURCE)).toBeNull();
});

test('a dev server closing writes nothing into the build folder', () => {
  const root = mkdtempSync(join(tmpdir(), 'cheminfo-talks-root-'));
  const plugin = cheminfoTalks({ site: 'nmr', origin: SOURCE.origin });
  hook(
    plugin,
    'configResolved',
  )({
    root,
    command: 'serve',
    build: { outDir: 'dist' },
  });
  hook(plugin, 'closeBundle')();

  expect(existsSync(join(root, 'dist'))).toBe(false);
});

test('a build writes the manifest and the decks', () => {
  const root = mkdtempSync(join(tmpdir(), 'cheminfo-talks-root-'));
  mkdirSync(join(root, 'src', 'talks'), { recursive: true });
  writeFileSync(join(root, 'src', 'talks', '20260824_IMSC.md'), TALK);
  const plugin = cheminfoTalks({ site: 'nmr', origin: SOURCE.origin });
  hook(
    plugin,
    'configResolved',
  )({
    root,
    command: 'build',
    build: { outDir: 'dist' },
  });
  hook(plugin, 'closeBundle')();

  expect(
    readFileSync(join(root, 'dist', 'talks', '20260824_IMSC.md'), 'utf8'),
  ).toBe(TALK);
  expect(
    JSON.parse(readFileSync(join(root, 'dist', 'talks.json'), 'utf8')),
  ).toStrictEqual({
    site: 'nmr',
    origin: 'http://localhost:10915',
    talks: [
      { id: '20260824_IMSC', title: 'Peaks are not molecules', slideCount: 1 },
    ],
  });
});

test('the dev server answers with permissive CORS, and reloads the page when a deck changes', () => {
  const root = mkdtempSync(join(tmpdir(), 'cheminfo-talks-root-'));
  mkdirSync(join(root, 'src', 'talks'), { recursive: true });
  writeFileSync(join(root, 'src', 'talks', '20260824_IMSC.md'), TALK);
  const plugin = cheminfoTalks({ site: 'nmr', origin: SOURCE.origin });
  hook(
    plugin,
    'configResolved',
  )({
    root,
    command: 'serve',
    build: { outDir: 'dist' },
  });

  const watched: string[] = [];
  const sent: unknown[] = [];
  const listeners: Array<(event: string, path: string) => void> = [];
  const middlewares: Middleware[] = [];
  serveHook(plugin)({
    watcher: {
      add: (path: string) => watched.push(path),
      on: (_name: string, listener: (event: string, path: string) => void) =>
        listeners.push(listener),
    },
    ws: { send: (message: unknown) => sent.push(message) },
    middlewares: { use: (handler: Middleware) => middlewares.push(handler) },
  });
  const middleware = only(middlewares);
  const onChange = only(listeners);

  const headers: Record<string, string> = {};
  let body = '';
  let passed = 0;
  const response = {
    setHeader: (name: string, value: string) => {
      headers[name] = value;
    },
    end: (text: string) => {
      body = text;
    },
  };
  middleware({ url: '/talks/20260824_IMSC.md' }, response, () => passed++);
  middleware({ url: '/index.html' }, response, () => passed++);
  onChange('change', join(root, 'src', 'talks', '20260824_IMSC.md'));
  onChange('change', join(root, 'src', 'App.tsx'));

  expect(watched).toStrictEqual([join(root, 'src', 'talks')]);
  expect(headers).toStrictEqual({
    'content-type': 'text/markdown; charset=utf-8',
    'access-control-allow-origin': '*',
  });
  expect(body).toBe(TALK);
  expect(passed).toBe(1);
  expect(sent).toStrictEqual([{ type: 'full-reload' }]);
});

type Middleware = (
  request: { url?: string },
  response: {
    setHeader: (name: string, value: string) => void;
    end: (text: string) => void;
  },
  next: () => void,
) => void;

/**
 * The dev-server hook of the plugin, as Vite calls it.
 * @param plugin - The plugin.
 * @returns The hook, taking the fake server the test builds.
 */
function serveHook(plugin: Plugin): (server: unknown) => void {
  const value = plugin.configureServer;
  if (typeof value !== 'function') throw new Error('no configureServer hook');
  return value as never;
}

/**
 * The one thing the plugin registered.
 * @param list - What it registered.
 * @returns Its single entry.
 */
function only<Item>(list: readonly Item[]): Item {
  const [item] = list;
  if (list.length !== 1 || item === undefined) {
    throw new Error(`expected one entry, got ${list.length}`);
  }
  return item;
}

/**
 * One hook of the plugin, as Vite calls it.
 * @param plugin - The plugin.
 * @param name - The hook.
 * @returns The hook, taking what the test hands it.
 */
function hook(
  plugin: Plugin,
  name: 'configResolved' | 'closeBundle',
): (
  config?: Pick<ResolvedConfig, 'root' | 'command'> & {
    build: { outDir: string };
  },
) => void {
  const value = plugin[name];
  if (typeof value !== 'function') throw new Error(`no ${name} hook`);
  return value as never;
}
