// @vitest-environment jsdom
import {
  IDBCursor,
  IDBCursorWithValue,
  IDBDatabase,
  IDBFactory,
  IDBIndex,
  IDBKeyRange,
  IDBObjectStore,
  IDBRequest,
  IDBTransaction,
} from 'fake-indexeddb';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { createReactiveSystem } from '../../../state/core/__tests__/fakeSignals.ts';
import { createWorkspaces } from '../../../storage/core/createWorkspaces.ts';
import type { Workspaces } from '../../../storage/core/workspaceTypes.ts';
import { SettingsDialog } from '../SettingsDialog.tsx';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const classes = {
    IDBCursor,
    IDBCursorWithValue,
    IDBDatabase,
    IDBIndex,
    IDBKeyRange,
    IDBObjectStore,
    IDBRequest,
    IDBTransaction,
  };
  for (const [name, value] of Object.entries(classes)) {
    vi.stubGlobal(name, value);
  }
  vi.stubGlobal('indexedDB', new IDBFactory());
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

async function openDialog() {
  const { signal, effect } = createReactiveSystem();
  const bucket = { resolution: signal(600) };
  const workspaces = createWorkspaces({
    name: 'dialog',
    site: 'draw',
    bucket,
    effect,
    builtins: [{ id: 'drawing', name: 'Drawing' }],
    delay: 0,
  });
  await workspaces.ready;
  const onClose = vi.fn();
  render(workspaces, onClose);
  return { bucket, workspaces, onClose };
}

function render(workspaces: Workspaces, onClose: () => void): void {
  act(() => {
    root.render(
      <SettingsDialog
        isOpen
        onClose={onClose}
        workspaces={workspaces}
        tabs={[
          { id: 'general', title: 'General', content: <p>Resolution</p> },
          { id: 'panels', title: 'Panels', content: <p>The panels</p> },
        ]}
      />,
    );
  });
}

function typeInto(selector: string, text: string): HTMLInputElement {
  const field = document.querySelector<HTMLInputElement>(selector);
  if (!field) throw new Error(`no field ${selector}`);
  // React follows the value through its own setter, which a plain assignment
  // on the element would bypass.
  const descriptor = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  );
  act(() => {
    descriptor?.set?.call(field, text);
    field.dispatchEvent(new Event('input', { bubbles: true }));
  });
  return field;
}

function button(label: string): HTMLButtonElement {
  const found = [...document.querySelectorAll('button')].find(
    (candidate) => candidate.textContent === label,
  );
  if (!found) throw new Error(`no ${label} button`);
  return found;
}

test('the dialog opens on the workspace and the first section', async () => {
  await openDialog();

  expect(
    document.querySelector('[data-testid="workspace-picker"]')?.textContent,
  ).toBe('Drawing');
  expect(document.body.textContent).toContain('Built in');
  expect(document.body.textContent).toContain('Resolution');
  expect(document.body.textContent).not.toContain('The panels');
});

test('Cancel puts back the preferences the dialog opened on', async () => {
  const { bucket, onClose } = await openDialog();
  act(() => {
    bucket.resolution.value = 300;
  });

  expect(document.body.textContent).toContain('Changed');

  await act(async () => {
    button('Cancel').click();
  });

  expect(bucket.resolution.value).toBe(600);
  expect(onClose).toHaveBeenCalledOnce();
});

test('Apply and save asks a name for a workspace of the site, and saves under it', async () => {
  const { bucket, workspaces, onClose } = await openDialog();
  act(() => {
    bucket.resolution.value = 1200;
  });

  act(() => {
    button('Apply and save').click();
  });
  const field = typeInto('.settings-name-dialog input', 'Printing');
  await act(async () => {
    field.form?.requestSubmit();
  });

  expect(workspaces.getState().active).toMatchObject({
    name: 'Printing',
    source: 'user',
  });
  expect(workspaces.getState().modified).toBe(false);
  expect(bucket.resolution.value).toBe(1200);

  await vi.waitFor(() => {
    expect(onClose).toHaveBeenCalledOnce();
  });
});
