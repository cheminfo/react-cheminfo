// @vitest-environment jsdom
/**
 * The name a document is saved or renamed under: typed with the caret already
 * in it, trimmed, and said before anything happens to replace — or, when
 * renaming, to clash with — another document's.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { DocumentNameDialogProps } from '../DocumentNameDialog.tsx';
import { DocumentNameDialog } from '../DocumentNameDialog.tsx';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
});

const TAKEN = new Map([['aspirin', 'Aspirin']]);

function open(props: Partial<DocumentNameDialogProps> = {}) {
  const onSubmit = vi.fn<(name: string) => Promise<void>>(() =>
    Promise.resolve(),
  );
  const onClose = vi.fn();
  act(() => {
    root.render(
      <DocumentNameDialog
        isOpen
        mode="save"
        initialName="Caffeine"
        taken={TAKEN}
        onSubmit={onSubmit}
        onClose={onClose}
        {...props}
      />,
    );
  });
  return { onSubmit, onClose };
}

function field(): HTMLInputElement {
  const input = document.querySelector<HTMLInputElement>(
    '.folder-panel__field input',
  );
  if (input === null) throw new Error('no name field');
  return input;
}

function typeName(text: string): void {
  // React follows the value through its own setter, which a plain assignment
  // on the element would bypass.
  const descriptor = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  );
  act(() => {
    descriptor?.set?.call(field(), text);
    field().dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function submitButton(): HTMLButtonElement {
  const button = document.querySelector<HTMLButtonElement>(
    'button[type="submit"]',
  );
  if (button === null) throw new Error('no submit button');
  return button;
}

async function submit(): Promise<void> {
  await act(async () => {
    field().form?.requestSubmit();
    await Promise.resolve();
  });
}

function problem(): string | null {
  return document.querySelector('.folder-panel__problem')?.textContent ?? null;
}

test('a closed dialog draws nothing', () => {
  open({ isOpen: false });

  expect(document.querySelector('.folder-panel__field')).toBeNull();
});

test('the dialog opens on the name, selected, and saves it trimmed', async () => {
  const { onSubmit, onClose } = open();

  expect(document.querySelector('.bp6-dialog-header')?.textContent).toBe(
    'Save in this browser',
  );
  expect(field().value).toBe('Caffeine');
  expect(document.activeElement).toBe(field());
  expect(field().selectionStart).toBe(0);
  expect(field().selectionEnd).toBe(8);
  expect(field().maxLength).toBe(120);
  expect(submitButton().textContent).toBe('Save');

  typeName('  Theobromine  ');
  await submit();

  expect(onSubmit.mock.calls).toStrictEqual([['Theobromine']]);
  expect(onClose).toHaveBeenCalledOnce();
});

test('saving under a name already taken says it replaces that document', () => {
  open();
  typeName(' ASPIRIN ');

  expect(document.querySelector('.folder-panel__note')?.textContent).toBe(
    'A document is already saved as Aspirin: saving replaces it.',
  );
  expect(problem()).toBeNull();
  expect(submitButton().textContent).toBe('Replace');
  expect(submitButton().disabled).toBe(false);
});

test('renaming to a name already taken is refused before anything happens', async () => {
  const { onSubmit, onClose } = open({
    mode: 'rename',
    initialName: 'Caffeine',
  });

  expect(document.querySelector('.bp6-dialog-header')?.textContent).toBe(
    'Rename the document',
  );
  expect(submitButton().textContent).toBe('Rename');

  typeName('aspirin');

  expect(problem()).toBe(
    'A document is already saved as Aspirin: choose another name.',
  );
  expect(submitButton().disabled).toBe(true);

  await submit();

  expect(onSubmit).not.toHaveBeenCalled();
  expect(onClose).not.toHaveBeenCalled();
});

test('a blank name cannot be saved, and the button says why', async () => {
  const { onSubmit } = open();
  typeName(' '.repeat(3));

  expect(submitButton().disabled).toBe(true);
  expect(submitButton().title).toBe('Give the document a name.');

  await submit();

  expect(onSubmit).not.toHaveBeenCalled();
});

test('a save that fails says why in the dialog, which stays open until the name changes', async () => {
  const onSubmit = vi.fn(() =>
    Promise.reject(new Error('The browser refused to store it.')),
  );
  const { onClose } = open({ onSubmit });

  await submit();

  expect(onSubmit).toHaveBeenCalledOnce();
  expect(problem()).toBe('The browser refused to store it.');
  expect(onClose).not.toHaveBeenCalled();
  expect(submitButton().disabled).toBe(false);

  typeName('Caffeine 2');

  expect(problem()).toBeNull();
});

test('cancel closes the dialog without saving', () => {
  const { onSubmit, onClose } = open();
  const cancel = [...document.querySelectorAll('button')].find(
    (button) => button.textContent === 'Cancel',
  );

  act(() => {
    cancel?.click();
  });

  expect(onClose).toHaveBeenCalledOnce();
  expect(onSubmit).not.toHaveBeenCalled();
});
