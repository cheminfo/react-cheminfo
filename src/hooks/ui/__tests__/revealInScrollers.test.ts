// @vitest-environment jsdom
/**
 * A row inside a table that scrolls, inside a panel body that scrolls and
 * clips the table: shown only when every box around it lets it show, and
 * brought into view by moving each box in turn.
 */

import { afterEach, expect, test } from 'vitest';

import {
  revealInScrollers,
  revealShift,
  screenExtent,
  shownExtent,
} from '../revealInScrollers.ts';

afterEach(() => {
  document.body.replaceChildren();
});

test('the least scroll that shows a band, its top first when it does not fit, or its middle to the middle', () => {
  const view = { top: 100, bottom: 400 };

  expect([
    revealShift(view, { top: 150, bottom: 200 }),
    revealShift(view, { top: 40, bottom: 95 }),
    revealShift(view, { top: 380, bottom: 430 }),
    revealShift(view, { top: 380, bottom: 800 }),
    revealShift(view, { top: 600, bottom: 640 }, 'center'),
    revealShift(view, { top: 230, bottom: 270 }, 'center'),
  ]).toStrictEqual([0, -60, 30, 280, 370, 0]);
});

/**
 * A box laid out as the browser would: its place on screen follows the
 * scroll of the boxes around it, which jsdom does not compute.
 */
interface Laid {
  element: HTMLElement;
  /** Top on screen before any box scrolled. */
  top: number;
  height: number;
  /** The height of what it holds, for a box that scrolls. */
  content: number;
}

function lay(boxes: readonly Laid[]): void {
  for (const [index, box] of boxes.entries()) {
    const above = boxes.slice(0, index);
    Object.defineProperty(box.element, 'getBoundingClientRect', {
      value: () => {
        let top = box.top;
        for (const outer of above) top -= outer.element.scrollTop;
        return { top, bottom: top + box.height, height: box.height };
      },
    });
    Object.defineProperty(box.element, 'clientHeight', { value: box.height });
    Object.defineProperty(box.element, 'scrollHeight', { value: box.content });
    let scrolled = 0;
    Object.defineProperty(box.element, 'scrollTop', {
      get: () => scrolled,
      set: (value: number) => {
        scrolled = Math.max(0, Math.min(box.content - box.height, value));
      },
    });
  }
}

function nested() {
  const panel = document.createElement('div');
  const table = document.createElement('div');
  const row = document.createElement('div');
  panel.style.overflowY = 'auto';
  table.style.overflowY = 'auto';
  table.append(row);
  panel.append(table);
  document.body.append(panel);
  // The panel shows 418–626 on screen; the table inside it, 550–828, holds
  // rows 36 px tall; row #102 sits at 696–732 before anything scrolls.
  lay([
    { element: panel, top: 418, height: 208, content: 600 },
    { element: table, top: 550, height: 278, content: 4000 },
    { element: row, top: 696, height: 36, content: 36 },
  ]);
  return { panel, table, row };
}

test('a row inside the table’s own box but under the panel’s edge is not shown, and is brought into view by the panel', () => {
  const { panel, table, row } = nested();
  const before = shownExtent(row);

  revealInScrollers(row);

  expect({
    before,
    rowOnScreen: row.getBoundingClientRect().top,
    scrolled: [table.scrollTop, panel.scrollTop],
    after: shownExtent(row),
  }).toStrictEqual({
    before: { top: 550, bottom: 626 },
    rowOnScreen: 590,
    scrolled: [0, 106],
    after: { top: 444, bottom: 626 },
  });
});

test('a band of a row centred: the table moves first, then the panel shows what the table left', () => {
  const { panel, table, row } = nested();

  revealInScrollers(row, { block: 'center', band: { top: 0, bottom: 36 } });

  expect([table.scrollTop, panel.scrollTop]).toStrictEqual([25, 167]);
  expect(row.getBoundingClientRect().top).toBe(504);
});

test('asked to, the box under the pointer stays still: the table moves, the panel the person works in does not', () => {
  const { panel, table, row } = nested();
  Object.defineProperty(panel, 'matches', {
    value: (selector: string) => selector === ':hover',
  });

  revealInScrollers(row, {
    block: 'center',
    band: { top: 0, bottom: 36 },
    keepHovered: true,
  });

  expect([table.scrollTop, panel.scrollTop]).toStrictEqual([25, 0]);
});

test('an element stands on screen where its box is, and follows the boxes that scroll around it', () => {
  const { panel, table, row } = nested();
  const before = screenExtent(row);
  table.scrollTop = 100;
  panel.scrollTop = 20;

  expect([before, screenExtent(row), screenExtent(table)]).toStrictEqual([
    { top: 696, bottom: 732 },
    { top: 576, bottom: 612 },
    { top: 530, bottom: 808 },
  ]);
});
