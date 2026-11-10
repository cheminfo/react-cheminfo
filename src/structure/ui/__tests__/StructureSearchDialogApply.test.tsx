// @vitest-environment jsdom
/**
 * What the structure filter hands back when it is applied: the drawing, how it
 * is matched, and how similar a hit has to be.
 *
 * The drawing is made on react-ocl's stand-in (`canvasEditorStandIn.tsx`),
 * which jsdom needs in place of OpenChemLib's canvas; the draft, the modes, the
 * examples and the dialog are the real ones.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import type {
  StructureSearchMode,
  StructureSearchQuery,
} from '../../core/structureSearch.ts';
import { StructureSearchDialog } from '../StructureSearchDialog.tsx';

import { canvas, resetCanvas } from './canvasLog.ts';
import { settle } from './savedFiles.ts';

vi.mock('react-ocl', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  ...(await import('./canvasEditorStandIn.tsx')),
}));

const EMPTY: StructureSearchQuery = {
  idCode: '',
  mode: 'substructure',
  threshold: 0.7,
};

let host: HTMLDivElement;
let root: Root;
let applied: StructureSearchQuery[];

beforeAll(async () => {
  await import('../EditorCanvas.tsx');
  await import('../EditorExportButton.tsx');
  await import('../../core/fragmentIdCode.ts');
});

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  resetCanvas();
  applied = [];
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

async function open(
  value: StructureSearchQuery,
  modes?: readonly StructureSearchMode[],
): Promise<void> {
  await act(async () => {
    root.render(
      <StructureSearchDialog
        isOpen
        usePortal={false}
        value={value}
        modes={modes}
        onClose={(query) => applied.push(query)}
      />,
    );
  });
}

function press(text: string): void {
  const button = [...host.querySelectorAll('button')].find(
    (candidate) => candidate.textContent === text,
  );
  if (button === undefined) throw new Error(`no button reads ${text}`);
  act(() => {
    button.click();
  });
}

// The editor reports a stroke once the pen has rested for 300 ms.
function draw(smiles: string): void {
  vi.useFakeTimers();
  act(() => canvas.draw(smiles));
  act(() => {
    vi.advanceTimersByTime(300);
  });
  vi.useRealTimers();
}

test('Apply hands back the drawing, the mode picked and the threshold', async () => {
  await open(EMPTY);

  press('Similar to');
  const select = host.querySelector<HTMLSelectElement>(
    'select[aria-label="Minimum similarity"]',
  );
  act(() => {
    if (select === null) return;
    select.value = '0.9';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
  draw('c1ccccc1');
  press('Apply');

  expect(applied).toHaveLength(1);
  expect(applied[0]?.mode).toBe('similarity');
  expect(applied[0]?.threshold).toBe(0.9);
  expect(applied[0]?.idCode.split(' ', 1)[0]).toBe('gFp@DiTt@@@');
});

test('the canvas opens on the query and as a fragment', async () => {
  await open({ ...EMPTY, idCode: 'gFp@DiTt@@B' });

  expect(canvas.mounts.at(-1)).toStrictEqual({
    mode: 'molecule',
    inputFormat: 'idcode',
    inputValue: 'gFp@DiTt@@B',
    fragment: true,
  });
});

test('an example is built into the canvas, and is what Apply hands back', async () => {
  await open(EMPTY);
  const before = canvas.mounts.length;

  await act(async () => {
    press('Pyridine');
    await settle();
  });

  expect(canvas.mounts).toHaveLength(before + 1);
  expect(canvas.mounts.at(-1)?.inputValue).toBe('gFx@@eJf`@@P');

  press('Apply');

  expect(applied).toStrictEqual([
    { idCode: 'gFx@@eJf`@@P', mode: 'substructure', threshold: 0.7 },
  ]);
});

test('an erased drawing hands back an empty query, in the mode it opened on', async () => {
  await open({ idCode: 'gFp@DiTt@@B', mode: 'exact', threshold: 0.5 });

  draw('');
  press('Apply');

  expect(applied).toStrictEqual([
    { idCode: '', mode: 'exact', threshold: 0.5 },
  ]);
});

test('a mode the site does not offer opens on the first one it does', async () => {
  await open({ ...EMPTY, mode: 'similarity' }, ['exact', 'substructure']);

  expect(host.querySelector('select')).toBeNull();

  press('Apply');

  expect(applied[0]?.mode).toBe('exact');
});
