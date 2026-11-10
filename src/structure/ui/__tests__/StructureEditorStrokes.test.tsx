// @vitest-environment jsdom
/**
 * The structure editor at work: what it reports after a stroke, what its
 * export button opens on, and which editor it builds.
 *
 * jsdom cannot run OpenChemLib's canvas, so react-ocl's two editors are stood
 * in for by `canvasEditorStandIn.tsx`, which reports genuine OpenChemLib
 * notations. Everything around the canvas — the debounce, the tap the export
 * button reads, the corner buttons and the guide — is the real editor's.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import type { StructureEditorProps } from '../StructureEditor.tsx';
import { StructureEditor } from '../StructureEditor.tsx';
import type { StructureEditorChange } from '../editorChange.ts';

import { canvas, resetCanvas } from './canvasLog.ts';

vi.mock('react-ocl', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  ...(await import('./canvasEditorStandIn.tsx')),
}));

let host: HTMLDivElement;
let root: Root;
let changes: StructureEditorChange[];

// The canvas and the export panel are imported lazily: loaded once here, they
// arrive within the render that asks for them.
beforeAll(async () => {
  await import('../EditorCanvas.tsx');
  await import('../EditorExportButton.tsx');
  await import('../StructureExportPanel.tsx');
});

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  resetCanvas();
  changes = [];
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  document.body.replaceChildren();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

async function render(props: Partial<StructureEditorProps> = {}) {
  await act(async () => {
    root.render(
      <StructureEditor
        onChange={(change) => changes.push(change)}
        {...props}
      />,
    );
  });
}

function draw(smiles: string): void {
  act(() => canvas.draw(smiles));
}

function button(label: string): HTMLButtonElement {
  const found = document.querySelector<HTMLButtonElement>(
    `button[aria-label="${CSS.escape(label)}"]`,
  );
  if (found === null) throw new Error(`no button is labelled ${label}`);
  return found;
}

test('a burst of strokes is reported once, when the pen rests', async () => {
  await render({ debounce: 300 });
  vi.useFakeTimers();

  draw('CC');
  draw('CCO');
  act(() => {
    vi.advanceTimersByTime(299);
  });

  expect(changes).toStrictEqual([]);

  act(() => {
    vi.advanceTimersByTime(1);
  });

  expect(changes).toHaveLength(1);
  expect(changes[0]?.mode).toBe('molecule');
  expect(changes[0]?.smiles).toBe('CCO');
  expect(changes[0]?.idCode.split(' ', 1)[0]).toBe('eMHAIh@');
});

test('loading a value again drops the stroke not yet reported', async () => {
  await render({ debounce: 300 });
  vi.useFakeTimers();

  draw('CCO');
  await render({ debounce: 300, value: 'gFp@DiTt@@@', revision: 1 });
  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(changes).toStrictEqual([]);
  expect(canvas.mounts.map((mount) => mount.inputValue)).toStrictEqual([
    '',
    'gFp@DiTt@@@',
  ]);
});

test('a stroke still waiting is delivered when the editor goes away', async () => {
  await render({ debounce: 300 });

  draw('CCO');
  act(() => root.unmount());
  root = createRoot(host);

  expect(changes.map((change) => change.smiles)).toStrictEqual(['CCO']);
});

test('the export button wakes once something is drawn, and opens on the drawing', async () => {
  await render({ debounce: 0 });

  expect(button('Export the structure').disabled).toBe(true);

  draw('OCC');

  expect(button('Export the structure').disabled).toBe(false);

  await act(async () => {
    button('Export the structure').click();
  });

  const values = [
    ...document.querySelectorAll('.structure-export__notation code'),
  ];

  expect(values[0]?.firstChild?.textContent).toBe('CCO');

  const overlay = values[0]?.closest('.bp6-overlay');
  act(() => {
    overlay
      ?.querySelector<HTMLButtonElement>('.bp6-dialog-close-button')
      ?.click();
  });

  expect(overlay?.classList.contains('bp6-overlay-open')).toBe(false);

  draw('');

  expect(button('Export the structure').disabled).toBe(true);
});

test('the export button reads the value it was given until something is drawn', async () => {
  await render({ value: 'c1ccncc1', inputFormat: 'smiles' });

  expect(button('Export the structure').disabled).toBe(false);
  expect(canvas.mounts).toStrictEqual([
    {
      mode: 'molecule',
      inputFormat: 'smiles',
      inputValue: 'c1ccncc1',
      fragment: false,
    },
  ]);
  expect(host.textContent).not.toContain('Draw a structure');
});

test('an empty canvas says how to start', async () => {
  await render({ value: '', fragment: true });

  expect(host.textContent).toContain(
    'Draw a structure with the tools on the left',
  );
  expect(canvas.mounts[0]?.fragment).toBe(true);
});

test('F1 opens the guide to the mouse and the keyboard', async () => {
  await render();
  const editor = host.querySelector('.structure-editor');

  act(() => {
    editor?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'F2', bubbles: true }),
    );
  });

  expect(document.body.textContent).not.toContain('Pointer on an atom');

  const f1 = new KeyboardEvent('keydown', {
    key: 'F1',
    bubbles: true,
    cancelable: true,
  });
  act(() => {
    editor?.dispatchEvent(f1);
  });

  expect(f1.defaultPrevented).toBe(true);
  expect(document.body.textContent).toContain('Pointer on an atom');
});

test('a reaction editor reports reactions, and neither opens nor exports', async () => {
  await render({ mode: 'reaction', debounce: 0 });

  expect(canvas.mounts.map((mount) => mount.mode)).toStrictEqual(['reaction']);
  expect(
    document.querySelector('button[aria-label="Export the structure"]'),
  ).toBeNull();
  expect(
    document.querySelector('button[aria-label="Open a structure file"]'),
  ).toBeNull();

  draw('CC>>CO');

  expect(changes.map(({ mode, smiles }) => [mode, smiles])).toStrictEqual([
    ['reaction', 'CC>>CO'],
  ]);
  expect(changes[0]?.molfile.startsWith('$RXN')).toBe(true);
});

test('a page may switch the editor’s own buttons off', async () => {
  await render({ help: false, exportable: false, importable: false });

  expect(host.querySelectorAll('button')).toHaveLength(0);
  expect(host.textContent).not.toContain('or drop a structure file');
});
