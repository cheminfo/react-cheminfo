// @vitest-environment jsdom
import { act } from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { NoResizeObserver } from '../../../__tests__/dom.ts';
import { host, mountRoot, root, unmountRoot } from '../../../__tests__/root.ts';
import {
  cell,
  memoryDocuments,
} from '../../../storage/core/__tests__/fakeFileSystem.ts';
import { createDocumentSaver } from '../../../storage/core/createDocumentSaver.ts';
import type { DraftStore } from '../../../storage/core/createDraftStore.ts';
import type { DocumentFile } from '../../../storage/core/documentFile.ts';
import type { DraftSession } from '../../../storage/core/draftSessionTypes.ts';
import type { SiteBackup } from '../../../storage/core/siteBackup.ts';
import type { SiteFolder } from '../../../storage/core/siteFolderTypes.ts';
import type { EditorFolderPanelProps } from '../EditorFolderPanel.tsx';
import { EditorFolderPanel } from '../EditorFolderPanel.tsx';

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', NoResizeObserver);
  mountRoot();
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
  unmountRoot();
  vi.unstubAllGlobals();
});

function stopNothing(): void {
  // Nothing was subscribed to.
}

const FOLDER = {
  current: () => Promise.resolve(undefined),
  choose: () => Promise.resolve(null),
  path: () => [],
  subscribe: () => stopNothing,
} as unknown as SiteFolder;

const SAVED = memoryDocuments();

const SAVER = createDocumentSaver<string>({
  site: 'mechanics',
  formats: [
    {
      id: 'figure',
      label: 'Figure',
      extension: '.mechanics.svg',
      picker: { description: 'Figure', accept: { 'image/svg+xml': ['.svg'] } },
      write: (text) => `<svg>${text}</svg>`,
    },
  ],
  document: () => 'bench',
  stem: () => 'figure',
  file: cell<DocumentFile<string> | null>(null),
  savedDocuments: SAVED,
  folder: FOLDER,
});

const DRAFTS: DraftStore<string> = {
  isAvailable: () => Promise.resolve(true),
  list: () => Promise.resolve([]),
  get: () => Promise.resolve(undefined),
  put: () => Promise.resolve(),
  putMany: () => Promise.resolve(),
  delete: () => Promise.resolve(),
};

const SESSION = {
  start: () => Promise.resolve(stopNothing),
  flush: () => Promise.resolve(),
  discardPending: () => undefined,
  heldElsewhere: () => Promise.resolve(new Set()),
  changed: () => undefined,
  open: () => Promise.resolve(true),
  keep: () => stopNothing,
} as DraftSession;

const BACKUP: SiteBackup = {
  write: () => Promise.resolve(undefined),
  read: () => Promise.resolve(undefined),
  fileName: () => 'mechanics-backup.zip',
};

const EXAMPLES = [
  { id: 'pendulum', name: 'Pendulum', description: 'A mass on a string.' },
  { id: 'spring', name: 'Spring', description: 'A mass on a spring.' },
];

type Example = (typeof EXAMPLES)[number];

async function show(
  props: Partial<EditorFolderPanelProps<string, Example>>,
): Promise<void> {
  await act(async () => {
    root.render(
      <EditorFolderPanel<string, Example>
        name="Figures"
        testId="figures-panel"
        site="mechanics"
        saver={SAVER}
        notify={() => undefined}
        live="bench"
        empty={false}
        file={null}
        drafts={{
          store: DRAFTS,
          session: SESSION,
          available: true,
          version: 0,
          currentId: null,
        }}
        saved={{ store: SAVED, onOpen: () => undefined }}
        backup={BACKUP}
        onOpen={() => undefined}
        keepInFile={() => undefined}
        {...props}
      />,
    );
    await Promise.resolve();
  });
}

function sections(): Array<string | null> {
  const names: Array<string | null> = [];
  for (const section of host.querySelectorAll('.folder-panel__section')) {
    names.push(section.getAttribute('aria-label'));
  }
  return names;
}

test('the folder panel lays its sections out in the family’s order', async () => {
  await show({ examples: { examples: EXAMPLES, onOpen: () => undefined } });

  expect(host.querySelector('[data-testid="figures-panel"]')).not.toBeNull();
  expect(
    host.querySelector('[role="toolbar"]')?.getAttribute('aria-label'),
  ).toBe('Figures: actions');
  expect(host.querySelector('.folder-panel .document-place')).not.toBeNull();
  expect(sections()).toStrictEqual([
    'Drafts',
    'On this computer',
    'Saved in this browser',
    'Examples',
  ]);
});

test('a blank figure never saved starts with no place line', async () => {
  await show({ empty: true });

  expect(host.querySelector('.folder-panel .document-place')).toBeNull();
  expect(sections()).toStrictEqual([
    'Drafts',
    'On this computer',
    'Saved in this browser',
  ]);
});

test('a site’s own sections come after the examples, its items in the toolbar', async () => {
  await show({
    placeLine: false,
    examples: { examples: EXAMPLES, onOpen: () => undefined },
    afterBackup: <button type="button" aria-label="Explain the variables" />,
    children: (
      <section className="folder-panel__section" aria-label="Templates" />
    ),
  });

  expect(host.querySelector('.folder-panel .document-place')).toBeNull();
  expect(sections()).toStrictEqual([
    'Drafts',
    'On this computer',
    'Saved in this browser',
    'Examples',
    'Templates',
  ]);
  expect(
    host.querySelector('[role="toolbar"] [aria-label="Explain the variables"]'),
  ).not.toBeNull();
});
