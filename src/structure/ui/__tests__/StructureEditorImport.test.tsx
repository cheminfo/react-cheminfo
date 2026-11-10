// @vitest-environment jsdom
/**
 * A structure brought into the editor from outside: a file opened from its
 * corner, or a file or text dropped on its canvas.
 *
 * The canvas is uncontrolled, so a structure it did not draw itself is loaded
 * by building a new canvas on it. What it was built on is read off react-ocl's
 * stand-in (`canvasEditorStandIn.tsx`), which jsdom needs in place of the real
 * canvas; the file is read, parsed and reported by the real editor.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import type { StructureTransfer } from '../../core/structureTransfer.ts';
import type { StructureEditorProps } from '../StructureEditor.tsx';
import { StructureEditor } from '../StructureEditor.tsx';
import type { StructureEditorChange } from '../editorChange.ts';

import { canvas, resetCanvas } from './canvasLog.ts';
import { settle } from './savedFiles.ts';

vi.mock('react-ocl', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  ...(await import('./canvasEditorStandIn.tsx')),
}));

let host: HTMLDivElement;
let root: Root;
let changes: StructureEditorChange[];

beforeAll(async () => {
  await import('../EditorCanvas.tsx');
  await import('../EditorExportButton.tsx');
  await import('../importedStructure.ts');
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
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function render(props: Partial<StructureEditorProps> = {}) {
  await act(async () => {
    root.render(
      <StructureEditor
        debounce={0}
        onChange={(change) => changes.push(change)}
        {...props}
      />,
    );
  });
}

function fileInput(): HTMLInputElement {
  const input = host.querySelector<HTMLInputElement>(
    '[data-testid="structure-editor-file"]',
  );
  if (input === null) throw new Error('the editor offers no file');
  return input;
}

// The file is read and parsed over a few turns of the event loop.
async function choose(...files: File[]): Promise<void> {
  const input = fileInput();
  Object.defineProperty(input, 'files', { configurable: true, value: files });
  await act(async () => {
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await settle();
  });
}

function dragEvent(type: string, data: Record<string, string>): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'dataTransfer', {
    value: {
      types: Object.keys(data),
      files: [],
      dropEffect: 'none',
      // A browser reads `text` as `text/plain`.
      getData: (format: string) =>
        data[format === 'text' ? 'text/plain' : format] ?? '',
    },
  });
  return event;
}

test('a file opened from the corner is loaded into a new canvas, and reported', async () => {
  await render({ value: 'CC', inputFormat: 'smiles' });

  expect(fileInput().accept).toBe('.mol,.sdf,.sd,.smi,.smiles,.txt');

  await choose(new File(['c1ccncc1\tpyridine\n'], 'pyridine.smi'));

  expect(changes.map((change) => change.smiles)).toStrictEqual(['c1ccncc1']);

  const loaded = canvas.mounts[1];

  expect(canvas.mounts).toHaveLength(2);
  expect(loaded?.inputFormat).toBe('idcode');
  expect(loaded?.inputValue).toBe(changes[0]?.idCode);
  expect(fileInput().value).toBe('');
});

test('the open button in the corner asks the file picker', async () => {
  const picked = vi.spyOn(HTMLInputElement.prototype, 'click');
  await render();

  act(() => {
    host
      .querySelector<HTMLButtonElement>('[aria-label="Open a structure file"]')
      ?.click();
  });

  expect(picked.mock.contexts).toStrictEqual([fileInput()]);
});

test('a second file opened replaces the first', async () => {
  await render();

  await choose(new File(['CCO'], 'ethanol.smi'));
  await choose(new File(['c1ccccc1'], 'benzene.smi'));

  expect(changes.map((change) => change.smiles)).toStrictEqual([
    'CCO',
    'c1ccccc1',
  ]);
  expect(canvas.mounts.map((mount) => mount.inputValue)).toStrictEqual([
    '',
    changes[0]?.idCode,
    changes[1]?.idCode,
  ]);
});

test('a file that holds no structure is said, and the drawing kept', async () => {
  await render();

  await choose(new File(['a shopping list'], 'notes.txt'));

  expect(changes).toStrictEqual([]);
  expect(canvas.mounts).toHaveLength(1);

  const alert = host.querySelector('[role="alert"]');

  expect(alert?.textContent).toBe(
    'notes.txt holds no molfile, SMILES or idCode, so the drawing was kept.',
  );

  act(() => {
    alert?.querySelector<HTMLButtonElement>('[aria-label="Dismiss"]')?.click();
  });

  expect(host.querySelector('[role="alert"]')).toBeNull();
});

test('choosing no file changes nothing', async () => {
  await render();

  await choose();

  expect(changes).toStrictEqual([]);
  expect(canvas.mounts).toHaveLength(1);
});

test('text dragged over the canvas raises the veil, and dropped is loaded', async () => {
  await render();
  const editor = host.querySelector('.structure-editor');
  const enter = dragEvent('dragenter', { 'text/plain': 'CCN' });

  act(() => {
    editor?.dispatchEvent(enter);
  });

  expect(enter.defaultPrevented).toBe(true);
  expect(host.textContent).toContain('Drop to load the structure');
  expect(host.textContent).not.toContain('Draw a structure');

  const veil = host.querySelector('[data-testid="structure-drop-overlay"]');
  await act(async () => {
    veil?.dispatchEvent(dragEvent('drop', { 'text/plain': 'CCN' }));
    await settle();
  });

  expect(host.textContent).not.toContain('Drop to load the structure');
  expect(changes.map((change) => change.smiles)).toStrictEqual(['CCN']);
});

test('text that is no structure is said, without naming a file', async () => {
  await render();
  const editor = host.querySelector('.structure-editor');

  act(() => {
    editor?.dispatchEvent(dragEvent('dragenter', { 'text/plain': 'x' }));
  });
  const veil = host.querySelector('[data-testid="structure-drop-overlay"]');
  await act(async () => {
    veil?.dispatchEvent(dragEvent('drop', { 'text/plain': 'hello there' }));
    await settle();
  });

  expect(host.querySelector('[role="alert"]')?.textContent).toBe(
    'That text is not a molfile, a SMILES or an idCode, so the drawing was kept.',
  );
});

test('a drag carrying no structure is refused', async () => {
  await render();
  const enter = dragEvent('dragenter', { 'text/uri-list': 'https://x.org' });

  act(() => {
    host.querySelector('.structure-editor')?.dispatchEvent(enter);
  });

  expect(enter.defaultPrevented).toBe(false);
  expect(host.textContent).not.toContain('Drop to load the structure');
});

test('a page reading its own files is handed what was chosen, unread', async () => {
  const handed: StructureTransfer[] = [];
  await render({ onImport: (transfer) => handed.push(transfer) });
  const file = new File(['CCO'], 'ethanol.smi');

  expect(fileInput().hasAttribute('accept')).toBe(false);

  await choose(file);

  expect(handed).toStrictEqual([{ kind: 'files', files: [file] }]);
  expect(changes).toStrictEqual([]);
  expect(canvas.mounts).toHaveLength(1);
});
