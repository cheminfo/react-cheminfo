// @vitest-environment jsdom
/**
 * The drafts list the work this browser keeps as it is done: grey, saying it
 * is not saved, and leaving out a saved document left as it is. The section
 * starts closed.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { Draft, DraftStore } from '../../core/createDraftStore.ts';
import type { DraftSession } from '../../core/draftSessionTypes.ts';
import { DraftsSection } from '../DraftsSection.tsx';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  const entries = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => {
      entries.set(key, value);
    },
    removeItem: (key: string) => {
      entries.delete(key);
    },
  });
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  vi.unstubAllGlobals();
});

const NOW = Date.now();

const DRAFTS: Array<Draft<string>> = [
  { id: 'screen', document: 'x^2', createdAt: NOW, updatedAt: NOW },
  {
    id: 'changed',
    document: 'E = mc^2',
    file: { name: 'Einstein.tex.svg', modified: true },
    createdAt: NOW,
    updatedAt: NOW - 3_600_000,
  },
  {
    id: 'as-is',
    document: 'pV = nRT',
    file: { name: 'Gas.tex.svg', modified: false },
    createdAt: NOW,
    updatedAt: NOW - 7_200_000,
  },
  { id: 'empty-name', document: '', createdAt: NOW, updatedAt: NOW - 1000 },
];

function storeOf(drafts: Array<Draft<string>>): DraftStore<string> {
  return {
    isAvailable: () => Promise.resolve(true),
    list: () => Promise.resolve(drafts),
    get: (id) => Promise.resolve(drafts.find((draft) => draft.id === id)),
    put: () => Promise.resolve(),
    putMany: () => Promise.resolve(),
    delete: vi.fn(() => Promise.resolve()),
  };
}

function sessionOf(): DraftSession {
  return {
    start: () => Promise.resolve(vi.fn()),
    flush: () => Promise.resolve(),
    discardPending: vi.fn(),
    heldElsewhere: () => Promise.resolve(new Set(['empty-name'])),
    changed: vi.fn(),
    open: vi.fn(() => Promise.resolve(true)),
  };
}

async function show(session: DraftSession): Promise<void> {
  await render(session);
  openSection();
}

async function render(session: DraftSession): Promise<void> {
  await act(async () => {
    root.render(
      <DraftsSection
        store={storeOf(DRAFTS)}
        session={session}
        available
        version={0}
        currentId="screen"
        live="x^3"
        name={(draft, document) => draft.file?.name ?? document}
        notify={vi.fn()}
      />,
    );
    await Promise.resolve();
  });
}

function openSection(): void {
  act(() => {
    host.querySelector<HTMLButtonElement>('.folder-panel__toggle')?.click();
  });
}

function rows(): string[] {
  return [...host.querySelectorAll('.folder-panel__open')].map(
    (row) => row.textContent ?? '',
  );
}

test('drafts start closed, say how many they are, and stay open once opened', async () => {
  await render(sessionOf());
  const toggle = host.querySelector('.folder-panel__toggle');

  expect(rows()).toStrictEqual([]);
  expect(toggle?.getAttribute('aria-expanded')).toBe('false');
  expect(toggle?.textContent).toContain('Drafts');
  expect(host.querySelector('.folder-panel__count')?.textContent).toBe('3');

  openSection();

  expect(rows()).toHaveLength(3);
  expect(host.querySelector('.folder-panel__count')).toBeNull();

  act(() => {
    root.unmount();
  });
  root = createRoot(host);
  await render(sessionOf());

  expect(rows()).toHaveLength(3);
});

test('every row says it is not saved, and a saved document left as it is is not listed', async () => {
  await show(sessionOf());

  expect(rows()).toStrictEqual([
    'x^3Not savedOn screen',
    'Einstein.tex.svgUnsaved changes1 hour ago',
    'UntitledNot savedjust nowAnother tab',
  ]);
  expect(
    host.querySelectorAll('.folder-panel__open--draft:not([aria-current])'),
  ).toHaveLength(2);
});

test('a draft another tab holds cannot be opened or deleted here', async () => {
  const session = sessionOf();
  await show(session);
  const [screen, changed, elsewhere] = host.querySelectorAll<HTMLButtonElement>(
    '.folder-panel__open',
  );

  expect(elsewhere?.disabled).toBe(true);
  expect(
    host.querySelectorAll('[aria-label="Delete this draft"]'),
  ).toHaveLength(1);

  act(() => {
    changed?.click();
    screen?.click();
  });

  expect(vi.mocked(session.open).mock.calls).toStrictEqual([
    ['changed'],
    ['screen'],
  ]);
});

test('the draft on screen leaves the list the moment it is saved', async () => {
  await act(async () => {
    root.render(
      <DraftsSection
        store={storeOf(DRAFTS)}
        session={sessionOf()}
        available
        version={0}
        currentId="screen"
        live="x^3"
        file={{ name: 'Cube.tex.svg', saved: 'x^3' }}
        name={(draft, document) => draft.file?.name ?? document}
        notify={vi.fn()}
      />,
    );
    await Promise.resolve();
  });
  openSection();

  expect(rows()).toStrictEqual([
    'Einstein.tex.svgUnsaved changes1 hour ago',
    'UntitledNot savedjust nowAnother tab',
  ]);
});
