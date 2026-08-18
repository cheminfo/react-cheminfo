/**
 * What the prerender specs build against: the site's table, the template vite
 * builds, and the two ways the plugin fills it — a build, and a dev run.
 */

import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { Plugin } from 'vite';

import type { RouteMeta } from '../../core/routes.ts';
import type { PrerenderOptions } from '../prerender.ts';
import { cheminfoPrerender } from '../prerender.ts';

/** The addresses the specs' site answers. */
export const ROUTES: RouteMeta[] = [
  {
    path: '/',
    title: 'Conformers in 3D',
    description: 'The home page.',
    short: 'Conformers',
    note: 'draw one and turn it',
  },
  { path: '/about', title: 'About', description: 'What it computes.' },
];

/** The template vite builds, with nothing written into it yet. */
export const PAGE = [
  '<!doctype html><html lang="en"><head><meta charset="utf-8" />',
  '<!--cheminfo:head-->',
  '</head><body><div id="root"></div>',
  '<!--cheminfo:body-->',
  '</body></html>',
].join('\n');

/**
 * Run the build hooks over a directory holding an `index.html`.
 * @param options - What the build was configured with.
 * @param out - The build output directory.
 */
export function build(options: PrerenderOptions, out: string): void {
  const plugin = cheminfoPrerender(options);
  configure(plugin, 'build', out);
  hookOf(plugin, 'closeBundle')();
}

/**
 * The front page a build writes for {@link PAGE}.
 * @param options - What the build was configured with.
 * @param template - The page vite built.
 * @returns The prerendered `index.html`.
 */
export function prerendered(
  options: PrerenderOptions,
  template = PAGE,
): string {
  const out = mkdtempSync(join(tmpdir(), 'cheminfo-prerender-'));
  writeFileSync(join(out, 'index.html'), template);
  build(options, out);
  return readFileSync(join(out, 'index.html'), 'utf8');
}

/**
 * The page a dev run serves for {@link PAGE}.
 * @param options - What the dev server was configured with.
 * @returns The transformed page.
 */
export function served(options: PrerenderOptions): string {
  const plugin = cheminfoPrerender(options);
  configure(plugin, 'serve', '.');
  const hook = plugin.transformIndexHtml;
  if (typeof hook !== 'object' || typeof hook.handler !== 'function') {
    throw new TypeError('the plugin transforms the page through a hook object');
  }
  const transformed = (hook.handler as (page: string) => unknown)(PAGE);
  if (typeof transformed !== 'string') {
    throw new TypeError('the hook hands back the page it rewrote');
  }
  return transformed;
}

function configure(plugin: Plugin, command: string, root: string): void {
  hookOf(
    plugin,
    'configResolved',
  )({
    command,
    root,
    build: { outDir: '.' },
    logger: { info: () => undefined },
  });
}

function hookOf(
  plugin: Plugin,
  name: 'configResolved' | 'closeBundle',
): (value?: unknown) => void {
  const hook = plugin[name];
  if (typeof hook !== 'function') {
    throw new TypeError(`the plugin declares ${name} as a function`);
  }
  return hook as (value?: unknown) => void;
}
