// @vitest-environment jsdom
/**
 * A tool introduces itself to the page that frames it, or to the window that
 * opened it, and serves it through the private port it is handed; framed or
 * not, every figure the page saves says where it came from and which
 * deployment saved it.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { PLATFORM_WORK } from '../../../citation/core/platformPaper.ts';
import { readFigureSource } from '../../../download/core/figureSource.ts';
import type { ToolInterface } from '../../core/protocol.ts';
import type { HostHandlers } from '../useHostConnection.ts';

import { connectAsHost, hostWindow, loadToolPage } from './hostPage.tsx';
import { until } from './until.ts';

const TOOL: ToolInterface = {
  name: 'draw',
  inputs: [{ key: 'structure', kinds: ['chem.smiles'] }],
  outputs: [],
};

const BUILD = {
  version: '2.3.0',
  deployment: 'https://5f2c9e1a.draw-cheminfo.pages.dev/',
};

const SVG = '<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  // Each test starts a page of its own: a host is greeted once per page.
  vi.resetModules();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test('a page nobody frames greets nobody, yet its figures name the site and the deployment', async () => {
  const { Tool, figureRevision, withPageFigureSource } =
    await loadToolPage(TOOL);
  const postMessage = vi.spyOn(globalThis, 'postMessage');
  await act(async () => {
    root.render(<Tool handlers={{ load: vi.fn(), build: BUILD }} />);
  });

  expect(figureRevision('draw')).toBe(
    'https://5f2c9e1a.draw-cheminfo.pages.dev',
  );
  expect(figureRevision('3d')).toBeUndefined();

  const figure = await withPageFigureSource(SVG);

  expect(readFigureSource(figure)).toStrictEqual({
    site: 'draw',
    href: `${globalThis.location.origin}/`,
    revision: 'https://5f2c9e1a.draw-cheminfo.pages.dev',
  });
  expect(postMessage).not.toHaveBeenCalled();

  act(() => root.unmount());
  root = createRoot(host);

  expect(figureRevision('draw')).toBeUndefined();
  await expect(withPageFigureSource(SVG)).resolves.toBe(SVG);
});

test('a framed page says hello to its parent once, and serves the document it is handed', async () => {
  const { Tool } = await loadToolPage(TOOL);
  const parent = hostWindow();
  vi.stubGlobal('parent', parent.window);
  const loaded: string[] = [];
  const handlers = (name: string): HostHandlers => ({
    load: (inputs) => {
      loaded.push(`${name}: ${JSON.stringify(inputs[0]?.item.value)}`);
    },
    build: BUILD,
    cite: [PLATFORM_WORK],
    help: { title: 'Draw', body: ['Draw a structure.'] },
  });
  await act(async () => {
    root.render(
      <>
        <Tool handlers={handlers('first')} />
        <Tool handlers={handlers('first')} />
      </>,
    );
  });
  await until(() => parent.posted.length > 0);

  expect(parent.posted).toStrictEqual([
    {
      type: 'cheminfo:hello',
      version: 1,
      tool: {
        name: 'draw',
        origin: globalThis.location.origin,
        build: BUILD,
        inputs: TOOL.inputs,
        outputs: [],
        cite: [PLATFORM_WORK],
        help: { title: 'Draw', body: ['Draw a structure.'] },
      },
    },
  ]);

  // The latest handlers are the ones that load, whenever the host connects.
  await act(async () => {
    root.render(
      <>
        <Tool handlers={handlers('latest')} />
        <Tool handlers={handlers('latest')} />
      </>,
    );
  });
  const port = connectAsHost(parent.window);
  port.send({
    type: 'load',
    id: 'h1',
    document: 'notebook:ethanol',
    items: [{ kind: 'chem.smiles', value: { smiles: 'CCO' } }],
  });
  await until(() => port.answers.length > 0);
  port.close();

  expect(loaded).toStrictEqual(['latest: {"smiles":"CCO"}']);
  expect(port.answers).toStrictEqual([
    {
      type: 'result',
      id: 'h1',
      ok: true,
      used: [{ key: 'structure', kind: 'chem.smiles' }],
    },
  ]);
  expect(parent.posted).toHaveLength(1);
});

test('a page opened by another window greets its opener', async () => {
  const { Tool } = await loadToolPage(TOOL);
  const opener = hostWindow();
  vi.stubGlobal('opener', opener.window);
  await act(async () => {
    root.render(<Tool handlers={{ load: vi.fn() }} />);
  });
  await until(() => opener.posted.length > 0);

  expect(opener.posted).toStrictEqual([
    {
      type: 'cheminfo:hello',
      version: 1,
      tool: {
        name: 'draw',
        origin: globalThis.location.origin,
        build: null,
        inputs: TOOL.inputs,
        outputs: [],
      },
    },
  ]);
});

test('a protocol that failed to load is loaded again when the tool mounts anew', async () => {
  let asked = false;
  vi.doMock('../../core/connectHost.ts', () => {
    asked = true;
    throw new Error('The network dropped the chunk.');
  });
  const { Tool } = await loadToolPage(TOOL);
  const parent = hostWindow();
  vi.stubGlobal('parent', parent.window);
  await act(async () => {
    root.render(<Tool handlers={{ load: vi.fn() }} />);
  });
  await until(() => asked);
  act(() => root.unmount());
  root = createRoot(host);
  vi.doUnmock('../../core/connectHost.ts');
  await act(async () => {
    root.render(<Tool handlers={{ load: vi.fn() }} />);
  });
  await until(() => parent.posted.length > 0);

  expect(parent.posted).toHaveLength(1);
});
