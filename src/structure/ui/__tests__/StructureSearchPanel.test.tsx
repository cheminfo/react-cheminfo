// @vitest-environment jsdom
/**
 * The panel a search page holds inline: a mode searches what is drawn, and a
 * page that cannot search nothing has an empty canvas refused, with a reason.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import type { StructureSearchQuery } from '../../core/structureSearch.ts';
import { StructureSearchPanel } from '../StructureSearchPanel.tsx';

import { canvas, resetCanvas } from './canvasLog.ts';

vi.mock('react-ocl', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  ...(await import('./canvasEditorStandIn.tsx')),
}));

const EMPTY: StructureSearchQuery = {
  idCode: '',
  mode: 'exact',
  threshold: 0.8,
};

let host: HTMLDivElement;
let root: Root;
let searched: StructureSearchQuery[];
let changed: StructureSearchQuery[];

beforeAll(async () => {
  await import('../EditorCanvas.tsx');
  await import('../EditorExportButton.tsx');
});

beforeEach(async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  resetCanvas();
  searched = [];
  changed = [];
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await act(async () => {
    root.render(
      <StructureSearchPanel
        value={EMPTY}
        requireDrawing
        thresholds={[0.7, 0.8, 0.9, 1]}
        onSearch={(query) => searched.push(query)}
        onChange={(query) => changed.push(query)}
      />,
    );
  });
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

function press(name: string): void {
  const button = [...host.querySelectorAll('button')].find(
    (candidate) =>
      host.querySelector(
        `[id="${CSS.escape(candidate.getAttribute('aria-labelledby') ?? '')}"]`,
      )?.textContent === name,
  );
  if (button === undefined) throw new Error(`no mode is named ${name}`);
  act(() => {
    button.click();
  });
}

function draw(smiles: string): void {
  vi.useFakeTimers();
  act(() => canvas.draw(smiles));
  act(() => {
    vi.runAllTimers();
  });
  vi.useRealTimers();
}

test('an empty canvas is refused, and the reason goes once something is drawn', () => {
  press('Contains');

  expect(searched).toStrictEqual([]);
  expect(host.querySelector('[role="alert"]')?.textContent).toBe(
    'Draw a structure first: an empty drawing searches nothing.',
  );

  draw('c1ccccc1');

  expect(host.querySelector('[role="alert"]')).toBeNull();

  press('Any stereoisomer');

  expect(searched).toHaveLength(1);
  expect(searched[0]?.mode).toBe('exactNoStereo');
  expect(searched[0]?.threshold).toBe(0.8);
  expect(searched[0]?.idCode.split(' ', 1)[0]).toBe('gFp@DiTt@@@');
});

test('the drawing and the least similarity are reported in the mode in force', () => {
  draw('c1ccccc1');
  const select = host.querySelector<HTMLSelectElement>(
    'select[aria-label="Minimum similarity"]',
  );
  act(() => {
    if (select === null) return;
    select.value = '0.9';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });

  const offered: string[] = [];
  for (const option of select?.options ?? []) offered.push(option.value);

  expect(offered).toStrictEqual(['0.7', '0.8', '0.9', '1']);

  const asked: Array<[string, number | undefined]> = [];
  for (const query of changed) asked.push([query.mode, query.threshold]);

  expect(asked).toStrictEqual([
    ['exact', 0.8],
    ['exact', 0.9],
  ]);
  expect(searched).toStrictEqual([]);
});
