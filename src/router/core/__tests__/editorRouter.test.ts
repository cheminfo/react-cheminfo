/**
 * An editor writes its addresses one way: a bar's share in `?split=`, the
 * example on screen in `?example=`, and the parameters a move carries over.
 */

import { afterEach, expect, test, vi } from 'vitest';

import { FIGURE_SPLIT, createEditorRouter } from '../editorRouter.ts';
import { readRoute } from '../history.ts';

import { installBrowser } from './browserStub.ts';

type Tab = 'bench' | 'tutorial' | 'about';

const TABS = [
  { id: 'bench' as const, path: '/' },
  { id: 'tutorial' as const, path: '/tutorial', takesId: true },
  { id: 'about' as const, path: '/about' },
];

const HEAD = { site: 'mechanics' as const, routes: [] };

afterEach(() => {
  vi.unstubAllGlobals();
});

function bench() {
  return createEditorRouter<Tab, 'figure'>({
    tabs: TABS,
    home: 'bench',
    head: HEAD,
    splits: { figure: FIGURE_SPLIT },
  });
}

test('a bar reads its share off the address, clamped, or the page’s own', () => {
  const editor = bench();

  expect(
    editor.splitProps('figure', editor.router.parse('/?split=60')),
  ).toMatchObject({
    ratio: 60,
    defaultRatio: 76,
    min: 45,
    max: 90,
  });
  expect(editor.splitOf('figure', editor.router.parse('/'))).toBeNull();
  expect(editor.splitOf('figure', editor.router.parse('/?split=99'))).toBe(90);
  expect(editor.keptKeys).toStrictEqual(['split']);
});

test('a drag writes its share in place, keeping every other parameter', () => {
  const browser = installBrowser('/?example=pendulum&embed&demo=swing');
  const editor = bench();

  editor.splitProps('figure', readRoute(editor.router)).onRatio(60);

  expect(browser.moves).toStrictEqual([
    {
      kind: 'replace',
      address: '/?split=60&embed&example=pendulum&demo=swing',
    },
  ]);

  editor.writeSplit('figure', null);

  expect(browser.moves[1]).toStrictEqual({
    kind: 'replace',
    address: '/?embed&example=pendulum&demo=swing',
  });
});

test('a bar of another page writes nothing here', () => {
  const browser = installBrowser('/about');
  const editor = createEditorRouter<Tab, 'figure' | 'tool'>({
    tabs: TABS,
    home: 'bench',
    head: HEAD,
    splits: {
      figure: FIGURE_SPLIT,
      tool: { tab: 'tutorial', ratio: 64, min: 45, max: 78 },
    },
  });
  editor.writeSplit('tool', 50);

  expect(browser.moves).toStrictEqual([]);

  browser.visit('/tutorial/ohm');
  editor.writeSplit('tool', 50);

  expect(browser.moves).toStrictEqual([
    { kind: 'replace', address: '/tutorial/ohm?split=50' },
  ]);
});

test('two bars of one page write their own parameter and keep the other', () => {
  const browser = installBrowser('/?split=60&grid');
  const editor = createEditorRouter<Tab, 'figure' | 'data'>({
    tabs: TABS,
    home: 'bench',
    head: HEAD,
    keep: ['grid'],
    splits: {
      figure: FIGURE_SPLIT,
      data: { param: 'split2', ratio: 50, min: 20, max: 80 },
    },
  });
  editor.writeSplit('data', 30);

  expect(browser.moves).toStrictEqual([
    { kind: 'replace', address: '/?split2=30&split=60&grid' },
  ]);
  expect(editor.keptKeys).toStrictEqual(['grid', 'split', 'split2']);
});

test('a closable bar writes split=100 when its panels are hidden', () => {
  const editor = createEditorRouter<Tab, 'figure'>({
    tabs: TABS,
    home: 'bench',
    head: HEAD,
    splits: { figure: { ...FIGURE_SPLIT, closable: true } },
  });

  expect(editor.splitOf('figure', editor.router.parse('/?split=100'))).toBe(
    100,
  );
  expect(editor.splits.figure.codec.serialize(100)).toBe('100');
});

test('the example on screen is named in place, and an address already naming it is left alone', () => {
  const browser = installBrowser('/?split=60&embed&demo=swing');
  const editor = bench();

  expect(editor.linkedExample()).toBeNull();

  editor.writeExample('pendulum');

  expect(editor.linkedExample()).toBe('pendulum');
  expect(browser.moves).toStrictEqual([
    { kind: 'replace', address: '/?example=pendulum&embed&split=60' },
  ]);

  editor.writeExample('pendulum');
  editor.writeExample(null);

  expect(browser.moves).toStrictEqual([
    { kind: 'replace', address: '/?example=pendulum&embed&split=60' },
    { kind: 'replace', address: '/?embed&split=60' },
  ]);
});

test('a move to another page carries the kept parameters, and an example has an address of its own', () => {
  const browser = installBrowser('/?split=60&grid&workspace=exercise');
  const editor = createEditorRouter<Tab, 'figure'>({
    tabs: TABS,
    home: 'bench',
    head: HEAD,
    keep: ['grid', 'workspace'],
    splits: { figure: FIGURE_SPLIT },
  });
  editor.navigate('about');
  editor.navigate('tutorial', 'ohm');
  editor.navigateToExample('pendulum');

  expect(browser.moves).toStrictEqual([
    { kind: 'push', address: '/about?grid&workspace=exercise' },
    { kind: 'push', address: '/tutorial/ohm?grid&workspace=exercise' },
    { kind: 'push', address: '/?example=pendulum&grid&workspace=exercise' },
  ]);
  expect(editor.exampleAddress('pendulum')).toBe('/?example=pendulum');
});

test('without a document the head is not followed, and nothing throws', () => {
  const stop = bench().startDocumentTitles();

  expect(() => {
    stop();
  }).not.toThrow();
});
