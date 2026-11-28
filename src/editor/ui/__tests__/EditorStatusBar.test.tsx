// @vitest-environment jsdom
import { act } from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { host, mountRoot, root, unmountRoot } from '../../../__tests__/root.ts';
import type { DocumentFile } from '../../../storage/core/documentFile.ts';
import type { DocumentSaver } from '../../../storage/core/documentSaverTypes.ts';
import type { SiteFolder } from '../../../storage/core/siteFolderTypes.ts';
import type { EditorStatusBarProps } from '../EditorStatusBar.tsx';
import { EditorStatusBar } from '../EditorStatusBar.tsx';

beforeEach(() => {
  mountRoot();
});

afterEach(() => {
  unmountRoot();
  vi.unstubAllGlobals();
});

function stopNothing(): void {
  // Nothing was subscribed to.
}

const SAVER = {
  folder: {
    current: () => Promise.resolve(undefined),
    path: () => [],
    subscribe: () => stopNothing,
  } as unknown as SiteFolder,
  moveToFolder: vi.fn(),
} as unknown as DocumentSaver<string>;

async function show(
  props: Partial<EditorStatusBarProps<string>>,
): Promise<HTMLElement> {
  await act(async () => {
    root.render(
      <EditorStatusBar<string>
        saver={SAVER}
        file={null}
        live="bench"
        empty={false}
        notify={() => undefined}
        notice={null}
        hint="Drag a piece onto the bench."
        {...props}
      />,
    );
    await Promise.resolve();
  });
  const line = host.querySelector<HTMLElement>('.editor-status');
  if (!line) throw new Error('no status line');
  return line;
}

function message(): HTMLElement | null {
  return host.querySelector<HTMLElement>('[role="status"]');
}

test('the line says the hint, after where the document is kept', async () => {
  const line = await show({ zoom: <span className="zoom">100%</span> });

  expect(line.className).toBe('editor-status no-print');
  expect(line.querySelector('.document-place')).not.toBeNull();
  expect(message()?.textContent).toBe('Drag a piece onto the bench.');
  expect(message()?.className).toBe('editor-status__message');
  expect(line.lastElementChild?.className).toBe('zoom');
});

test('a badge stands before the message, a status read aloud after it', async () => {
  const line = await show({
    beforeMessage: <span className="badge">2</span>,
    children: <span className="spoken">Running</span>,
  });
  const order: string[] = [];
  for (const child of line.children) order.push(child.classList[0] ?? '');

  expect(order).toStrictEqual([
    'document-place',
    'badge',
    'editor-status__message',
    'spoken',
  ]);
});

test('a notice replaces the hint, in red when something went wrong', async () => {
  await show({ notice: { text: 'Nothing was written.', danger: true } });

  expect(message()?.textContent).toBe('Nothing was written.');
  expect(message()?.className).toBe(
    'editor-status__message editor-status__message--danger',
  );

  await show({ notice: { text: 'Saved.', danger: false }, danger: true });

  expect(message()?.className).toBe('editor-status__message');
});

test('problems with no notice are said in red', async () => {
  await show({ danger: true, hint: 'Column B holds no number.' });

  expect(message()?.className).toBe(
    'editor-status__message editor-status__message--danger',
  );
});

test('a blank page never saved says nothing of where it is kept', async () => {
  const line = await show({ empty: true });

  expect(line.querySelector('.document-place')).toBeNull();

  const kept: DocumentFile<string> = { name: 'pendulum.svg', saved: 'bench' };
  const saved = await show({
    empty: true,
    file: kept,
    messageTestId: 'status',
  });

  expect(saved.querySelector('.document-place')).not.toBeNull();
  expect(host.querySelector('[data-testid="status"]')).toBe(message());
});
