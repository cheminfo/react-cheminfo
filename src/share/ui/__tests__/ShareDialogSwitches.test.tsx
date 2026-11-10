// @vitest-environment jsdom
/**
 * The share dialog in use: every switch, preset and tool parameter rewrites
 * the link it hands out.
 */

import type { ReactElement } from 'react';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { ShareVocabulary } from '../../core/index.ts';
import { integerParam } from '../../core/index.ts';
import type { ShareDialogProps } from '../ShareDialog.tsx';
import { ShareDialog } from '../ShareDialog.tsx';

const PARAMS = { count: integerParam({ min: 1, max: 100, default: null }) };

const VOCABULARY: ShareVocabulary<typeof PARAMS> = {
  parts: [
    {
      key: 'tabs',
      label: 'The tab bar',
      description: 'The tabs in the site header.',
      inHeader: true,
    },
    { key: 'menu', label: 'The other sets', description: 'The capsules.' },
    {
      key: 'hints',
      label: 'Hints',
      description: 'The hint ladder.',
      hiddenByDefault: true,
    },
  ],
  params: PARAMS,
};

const BASE = 'https://smiles.cheminfo.org/exercises';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

function render(props: Partial<ShareDialogProps<typeof PARAMS>> = {}): void {
  act(() => {
    root.render(
      <ShareDialog
        isOpen
        usePortal={false}
        onClose={() => undefined}
        vocabulary={VOCABULARY}
        title="Exercises"
        baseUrl={BASE}
        search=""
        {...props}
      />,
    );
  });
}

function link(): string {
  const anchor = [...host.querySelectorAll('a')].find(
    (candidate) => candidate.textContent === 'Open in a new tab',
  );
  return anchor?.getAttribute('href') ?? '';
}

function row(label: string): HTMLElement {
  const found = [...host.querySelectorAll<HTMLElement>('.share-part')].find(
    (candidate) =>
      candidate.querySelector('.share-part__label')?.textContent === label,
  );
  if (found === undefined) throw new Error(`no row ${label}`);
  return found;
}

function flip(label: string): void {
  act(() => {
    row(label).querySelector<HTMLInputElement>('input')?.click();
  });
}

function rows(): string[] {
  return [...host.querySelectorAll('.share-part__label')].map(
    (label) => label.textContent ?? '',
  );
}

function Count(props: {
  setParam: (key: 'count', value: number) => void;
}): ReactElement {
  return (
    <button
      type="button"
      onClick={() => {
        props.setParam('count', 5);
      }}
    >
      Five questions
    </button>
  );
}

test('each switch rewrites the link, and leaving the frame offers the header parts', () => {
  render({
    preview: false,
    children: (draft) => <Count setParam={draft.setParam} />,
  });

  expect(link()).toBe(`${BASE}?embed=1&hide=hints`);
  expect(rows()).toStrictEqual([
    'Embed in another page',
    'The other sets',
    'Hints',
  ]);

  flip('The other sets');

  expect(link()).toBe(`${BASE}?embed=1&hide=menu,hints`);

  flip('Hints');

  expect(link()).toBe(`${BASE}?embed=1&hide=menu`);

  flip('Embed in another page');

  expect(link()).toBe(`${BASE}?hide=menu`);
  expect(rows()).toStrictEqual([
    'Embed in another page',
    'The tab bar',
    'The other sets',
    'Hints',
  ]);

  act(() => {
    [...host.querySelectorAll('button')]
      .find((button) => button.textContent === 'Five questions')
      ?.click();
  });

  expect(link()).toBe(`${BASE}?hide=menu&count=5`);
});

test('a dialog given no address shares the page it is opened on', () => {
  render({ baseUrl: undefined, search: undefined, preview: false });

  expect(link()).toBe(`${globalThis.location.origin}/?embed=1&hide=hints`);
});

test('a preset tab sets the link up, and Custom brings back the switches from there', () => {
  render({
    preview: false,
    presets: [
      {
        key: 'quiz',
        label: 'A quiz',
        description: 'Ten questions, no hints, no other sets.',
        hidden: ['menu', 'hints'],
        params: { count: 10 },
      },
    ],
  });
  const tab = (name: string) =>
    [...host.querySelectorAll<HTMLElement>('[role="tab"]')].find(
      (candidate) => candidate.textContent === name,
    );

  expect(tab('Custom')?.getAttribute('aria-selected')).toBe('true');

  act(() => {
    tab('A quiz')?.click();
  });

  expect(link()).toBe(`${BASE}?embed=1&hide=menu,hints&count=10`);
  expect(host.querySelector('.share-dialog__preset')?.textContent).toBe(
    'Ten questions, no hints, no other sets.',
  );
  expect(rows()).toStrictEqual([]);

  act(() => {
    tab('Custom')?.click();
  });

  expect(rows()).toStrictEqual([
    'Embed in another page',
    'The other sets',
    'Hints',
  ]);
  expect(link()).toBe(`${BASE}?embed=1&hide=menu,hints&count=10`);
});

test('a default preset the site no longer offers opens on the suggested link', () => {
  render({
    preview: false,
    defaultPreset: 'retired',
    presets: [
      {
        key: 'quiz',
        label: 'A quiz',
        description: 'No hints.',
        hidden: ['menu', 'hints'],
      },
    ],
  });

  expect(link()).toBe(`${BASE}?embed=1&hide=hints`);
  expect(rows()).toStrictEqual([
    'Embed in another page',
    'The other sets',
    'Hints',
  ]);
});
