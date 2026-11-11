// @vitest-environment jsdom
/**
 * The box a caption is typed in: it opens on its anchor, keeps the caption
 * on Ctrl+Enter, drops it on Escape, and hands back what its toolbar set.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { CaptionEditor } from '../CaptionEditor.tsx';
import type { CaptionEditorResult } from '../captionEditorProps.ts';

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
