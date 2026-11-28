// @vitest-environment jsdom
import { Button } from '@blueprintjs/core';
import { act } from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { NoResizeObserver } from '../../../__tests__/dom.ts';
import { host, mountRoot, root, unmountRoot } from '../../../__tests__/root.ts';
import { createDocumentSaver } from '../../../storage/core/createDocumentSaver.ts';
import type { Cell, DocumentFile } from '../../../storage/core/documentFile.ts';
import type { DocumentSaver } from '../../../storage/core/documentSaverTypes.ts';
import type { EditorFileBarProps } from '../EditorFileBar.tsx';
import { EditorFileBar } from '../EditorFileBar.tsx';

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', NoResizeObserver);
  mountRoot();
});

afterEach(() => {
  unmountRoot();
  vi.unstubAllGlobals();
});

function makeSaver(): DocumentSaver<string> {
  const holder: Cell<DocumentFile<string> | null> = {
    value: null,
    peek: () => holder.value,
  };
  return createDocumentSaver<string>({
    site: 'test',
    formats: [
      {
        id: 'figure',
        label: 'Figure',
        extension: '.svg',
        picker: {
          description: 'Figure',
          accept: { 'image/svg+xml': ['.svg'] },
        },
        write: (text) => `<svg>${text}</svg>`,
      },
    ],
    document: () => 'bench',
    stem: () => 'figure',
    file: holder,
  });
}

const SAVER = makeSaver();

function show(props: Partial<EditorFileBarProps<string>>): void {
  act(() => {
    root.render(
      <EditorFileBar<string>
        site="mechanics"
        saver={SAVER}
        notify={() => undefined}
        file={null}
        empty={false}
        onOpen={() => undefined}
        download={{ testId: 'figure-download' }}
        {...props}
      />,
    );
  });
}

/**
 * The bar read left to right.
 * @returns Each button's name, a rule as `|`, the spacer as `→`.
 */
function items(): string[] {
  const read: string[] = [];
  const bar = host.querySelector('[role="toolbar"]');
  for (const element of bar?.querySelectorAll(
    'button, .bp6-divider, .editor-file-bar__spacer',
  ) ?? []) {
    if (element.classList.contains('bp6-divider')) {
      read.push('|');
    } else if (element.classList.contains('editor-file-bar__spacer')) {
      read.push('→');
    } else {
      read.push(
        element.getAttribute('aria-label') ?? element.textContent?.trim() ?? '',
      );
    }
  }
  return read;
}

const HISTORY = {
  canUndo: true,
  canRedo: false,
  undo: vi.fn(),
  redo: vi.fn(),
};

const CLEAR = {
  label: 'Clear the bench',
  title: 'Clear the bench',
  question: 'Clear the bench? Undo brings it back.',
  confirmLabel: 'Clear the bench',
  onConfirm: () => undefined,
};

test('the bar of a bench: files, history and edits, each group under a rule', () => {
  show({
    history: HISTORY,
    remove: { disabled: true, onClick: () => undefined },
    afterRemove: <Button aria-label="Group" />,
    clear: CLEAR,
  });

  expect(items()).toStrictEqual([
    'Open',
    'Save as…',
    'Save this figure — SVG',
    '|',
    'Undo',
    'Redo',
    '|',
    'Delete the selection',
    'Group',
    'Clear the bench',
  ]);

  const bar = host.querySelector('[role="toolbar"]');

  expect(bar?.getAttribute('aria-label')).toBe('File');
  expect(bar?.className).toBe('editor-file-bar no-print');
  expect(host.querySelector('[data-testid="figure-download"]')).not.toBeNull();
});

test('every slot lands in its place, and the end is pushed right', () => {
  show({
    afterOpen: <Button aria-label="Import data" />,
    history: HISTORY,
    afterHistory: <Button aria-label="Type as text" />,
    beforeRemove: <Button aria-label="Duplicate the selection" />,
    remove: {
      disabled: false,
      onClick: () => undefined,
      label: 'Delete the piece in hand',
    },
    end: <Button aria-label="Settings" />,
  });

  expect(items()).toStrictEqual([
    'Open',
    'Import data',
    'Save as…',
    'Save this figure — SVG',
    '|',
    'Undo',
    'Redo',
    'Type as text',
    '|',
    'Duplicate the selection',
    'Delete the piece in hand',
    '→',
    'Settings',
  ]);
});

test('a bar with no history and no edits draws no rule', () => {
  show({ end: <Button aria-label="New plate" /> });

  expect(items()).toStrictEqual([
    'Open',
    'Save as…',
    'Save this figure — SVG',
    '→',
    'New plate',
  ]);
});

test('a lesson’s figure offers neither Open nor Save as, and no leading rule', () => {
  show({ documents: false, history: HISTORY, empty: true });

  expect(items()).toStrictEqual(['Undo', 'Redo']);
});

test('an empty figure greys Save as and Clear, and shows no picture', () => {
  show({ empty: true, clear: CLEAR });

  expect(items()).toStrictEqual(['Open', 'Save as…', '|', 'Clear the bench']);

  const saveAs = [...host.querySelectorAll('button')].find(
    (button) => button.textContent === 'Save as…',
  );

  expect(saveAs?.disabled).toBe(true);
  expect(
    host.querySelector<HTMLButtonElement>('[aria-label="Clear the bench"]')
      ?.disabled,
  ).toBe(true);
});

test('the picture can be shown while the figure is empty, or not at all', () => {
  show({ empty: true, downloadShown: true });

  expect(items()).toStrictEqual(['Open', 'Save as…', 'Save this figure — SVG']);

  show({ download: null });

  expect(items()).toStrictEqual(['Open', 'Save as…']);
});

test('Undo and Redo follow the history', () => {
  const undo = vi.fn();
  show({ history: { canUndo: true, canRedo: false, undo, redo: vi.fn() } });
  const undoButton = host.querySelector<HTMLButtonElement>(
    '[aria-label="Undo"]',
  );

  expect(undoButton?.title).toBe('Undo (Ctrl+Z)');
  expect(
    host.querySelector<HTMLButtonElement>('[aria-label="Redo"]')?.disabled,
  ).toBe(true);

  act(() => {
    undoButton?.click();
  });

  expect(undo).toHaveBeenCalledOnce();
});

test('a bar not drawn leaves no toolbar on the page', () => {
  show({ shown: false });

  expect(host.querySelector('[role="toolbar"]')).toBeNull();
});
