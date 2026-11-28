// @vitest-environment jsdom
import type { Locator } from '@playwright/test';
import { expect, test } from 'vitest';

import { structureEditorBoxes } from '../structureEditor.ts';

/**
 * An editor host as OpenChemLib builds it: a palette first in its shadow
 * root, then the drawing canvas, which can be focused.
 * @param heights - The height the drawing reports at each reading, in order;
 * the last repeats.
 * @returns The editor's locator, and how many times it was read.
 */
function editor(heights: number[]) {
  const host = document.createElement('div');
  const root = host.attachShadow({ mode: 'open' });
  const toolbar = document.createElement('canvas');
  const drawing = document.createElement('canvas');
  drawing.setAttribute('tabindex', '0');
  root.append(toolbar, drawing);
  toolbar.getBoundingClientRect = () =>
    ({ x: 10, y: 20, width: 46, height: 440 }) as DOMRect;
  drawing.getBoundingClientRect = () => {
    const height = heights.length > 1 ? heights.shift() : heights[0];
    return { x: 56, y: 20, width: 500, height } as DOMRect;
  };
  const read = { count: 0 };
  const locator = {
    evaluate: async (run: (element: Element) => unknown) => {
      read.count++;
      return run(host);
    },
  } as unknown as Locator;
  return { locator, read };
}

test('the two canvases are measured once the drawing has a height, then read again', async () => {
  const { locator, read } = editor([0, 380, 400]);

  await expect(structureEditorBoxes(locator)).resolves.toStrictEqual({
    toolbar: { x: 10, y: 20, width: 46, height: 440 },
    drawing: { x: 56, y: 20, width: 500, height: 400 },
  });
  expect(read.count).toBe(3);
});

test('an editor with no canvas yet keeps being asked', async () => {
  const host = document.createElement('div');
  host.attachShadow({ mode: 'open' });
  let reads = 0;
  const locator = {
    evaluate: async (run: (element: Element) => unknown) => {
      reads++;
      if (reads === 2) {
        const drawing = document.createElement('canvas');
        drawing.setAttribute('tabindex', '0');
        drawing.getBoundingClientRect = () =>
          ({ x: 0, y: 0, width: 300, height: 200 }) as DOMRect;
        host.shadowRoot?.prepend(document.createElement('div'));
        host.shadowRoot?.append(drawing);
      }
      return run(host);
    },
  } as unknown as Locator;

  const boxes = await structureEditorBoxes(locator);

  expect(boxes.drawing).toStrictEqual({ x: 0, y: 0, width: 300, height: 200 });
  expect(reads).toBe(3);
});
