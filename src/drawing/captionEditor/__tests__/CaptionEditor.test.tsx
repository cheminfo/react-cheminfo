// @vitest-environment jsdom
/**
 * The box a caption is typed in: it opens on its anchor, keeps the caption
 * on Ctrl+Enter or its tick, drops it on Escape, and hands back what its
 * toolbar set.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { CaptionEditor } from '../CaptionEditor.tsx';
import type { CaptionEditorResult } from '../captionEditorProps.ts';

// jsdom lays out no text, and a command scrolls the caret into view: it is
// measured as an empty box at the origin.
if (!('getClientRects' in Range.prototype)) {
  const empty = { x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0 };
  Object.assign(Range.prototype, {
    getClientRects: () => [],
    getBoundingClientRect: () => ({ ...empty, width: 0, height: 0 }),
  });
}

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
  vi.unstubAllGlobals();
});

function open(keep: (result: CaptionEditorResult) => boolean): {
  kept: CaptionEditorResult[];
  closes: () => number;
} {
  const kept: CaptionEditorResult[] = [];
  let closed = 0;
  act(() => {
    root.render(
      <CaptionEditor
        text="H_2O **and** CO2"
        size={10}
        family="Arial, Helvetica, sans-serif"
        align="center"
        chemical
        left={120}
        top={80}
        zoom={2}
        onCommit={(result) => {
          kept.push(result);
          return keep(result);
        }}
        onClose={() => {
          closed++;
        }}
      />,
    );
  });
  return { kept, closes: () => closed };
}

// A key pressed in the box, with the shortcut modifier of any platform.
function press(key: string, modifier = false): void {
  const box = host.querySelector('[role="textbox"]');
  act(() => {
    box?.dispatchEvent(
      new KeyboardEvent('keydown', {
        key,
        ctrlKey: modifier,
        metaKey: modifier,
        bubbles: true,
      }),
    );
  });
}

function click(label: string): void {
  const button = host.querySelector(
    `button[aria-label="${CSS.escape(label)}"]`,
  );
  act(() => {
    button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

test('the box opens on its anchor, named for what it holds', () => {
  open(() => true);
  const box = host.querySelector('[role="textbox"]');

  expect(box?.getAttribute('aria-label')).toBe('Caption');
  expect(box?.textContent).toBe('H2O and CO2');

  const frame = host.querySelector<HTMLElement>('.caption-editor');

  expect(frame?.style.left).toBe('120px');
  expect(frame?.style.top).toBe('61px');
  expect(frame?.style.transform).toBe('translateX(-50%)');
});

test('Escape drops the change, and Ctrl+Enter keeps the caption as written', () => {
  const dropped = open(() => true);
  press('Escape');

  expect(dropped.kept).toStrictEqual([]);
  expect(dropped.closes()).toBe(1);

  act(() => {
    root.unmount();
  });
  root = createRoot(host);
  const kept = open(() => true);
  press('Enter', true);

  expect(kept.kept).toStrictEqual([
    {
      text: 'H_2O **and** CO2',
      align: 'center',
      family: 'Arial, Helvetica, sans-serif',
      chemical: true,
    },
  ]);
  expect(kept.closes()).toBe(1);
});

test('the tick keeps the caption, as Ctrl+Enter does', () => {
  const kept = open(() => true);
  click('Done');

  expect(kept.kept).toStrictEqual([
    {
      text: 'H_2O **and** CO2',
      align: 'center',
      family: 'Arial, Helvetica, sans-serif',
      chemical: true,
    },
  ]);
  expect(kept.closes()).toBe(1);
});

test('a caption the caller refuses keeps its box open', () => {
  const refused = open(() => false);
  press('Enter', true);
  press('Enter', true);

  expect(refused.kept).toHaveLength(2);
  expect(refused.closes()).toBe(0);
});

test('the toolbar sets the alignment, the font and the chemical rules kept', () => {
  const kept = open(() => true);
  click('Align left');
  click('Automatic formulas');
  const font = host.querySelector<HTMLSelectElement>(
    'select[aria-label="Font of the caption"]',
  );
  act(() => {
    if (!font) return;
    font.value = "'Courier New', Courier, monospace";
    font.dispatchEvent(new Event('change', { bubbles: true }));
  });
  press('Enter', true);

  expect(kept.kept).toStrictEqual([
    {
      text: 'H_2O **and** CO2',
      align: 'left',
      family: "'Courier New', Courier, monospace",
      chemical: false,
    },
  ]);
});

test('Escape closes the symbol palette first, then drops the caption', () => {
  const kept = open(() => true);
  click('Symbols');

  expect(host.querySelector('.caption-symbols')).not.toBeNull();

  press('Escape');

  expect(host.querySelector('.caption-symbols')).toBeNull();
  expect(kept.closes()).toBe(0);

  press('Escape');

  expect(kept.kept).toStrictEqual([]);
  expect(kept.closes()).toBe(1);
});

test('the palette types a symbol, and makes the selected letters Greek', () => {
  const typed = open(() => true);
  click('Symbols');
  // The box opens with everything selected: the symbol takes its place.
  click('beta');
  press('Enter', true);

  expect(typed.kept.map(({ text }) => text)).toStrictEqual(['β']);

  act(() => {
    root.unmount();
  });
  root = createRoot(host);
  const greek = open(() => true);
  click('Symbols');
  click('Make the selected letters Greek');
  press('Enter', true);

  // H, O and C become capital eta, omicron and chi; the marks stay.
  expect(greek.kept.map(({ text }) => text)).toStrictEqual([
    '\u0397_2\u039F **ανδ** \u03A7\u039F2',
  ]);
});
