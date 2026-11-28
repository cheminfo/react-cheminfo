import { expect, test } from 'vitest';

import { dragSplitBar, rectOf, splitBar, splitShare } from '../split.ts';

import { fakeBrowser } from './fakeBrowser.ts';

/** The locator every site wrote by hand for the bar after the first pane. */
const BARS =
  'xpath=.//*[@data-testid="split-start"]/../following-sibling::div[1]';
const START = 'xpath=preceding-sibling::div[1]/*[@data-testid="split-start"]';
const END = 'xpath=following-sibling::div[1]/*[@data-testid="split-end"]';

/** A bar standing the height of a row on a lecture-hall screen. */
const BAR = { x: 600, y: 60, width: 7, height: 700 };

const VISIBLE = { state: 'visible', timeout: undefined };

/**
 * lcao's grip: two hundred pixels down the bar, or its middle when it is
 * shorter than twice that.
 * @param bar - The bar.
 * @param bar.height - Its height.
 * @returns How far down it is taken hold of.
 */
function lcaoGrip(bar: { height: number }): number {
  return Math.min(bar.height / 2, 200);
}

test('every bar on the page, or one of them, in document order', async () => {
  const { page, calls } = fakeBrowser({
    boxes: { [BARS]: BAR, [`${BARS} >> nth=1`]: BAR },
  });

  await rectOf(splitBar(page));
  await rectOf(splitBar(page, 1));

  expect(calls).toStrictEqual([
    ['waitFor', BARS, VISIBLE],
    ['boundingBox', BARS],
    ['waitFor', `${BARS} >> nth=1`, VISIBLE],
    ['boundingBox', `${BARS} >> nth=1`],
  ]);
});

test('the bars inside a row only, once a page puts a card after it', async () => {
  const { page, calls } = fakeBrowser({
    boxes: { [`.split-row >> ${BARS}`]: BAR },
  });

  await rectOf(splitBar(page.locator('.split-row')));

  expect(calls[0]).toStrictEqual(['waitFor', `.split-row >> ${BARS}`, VISIBLE]);
});

test('a box is read once its element is visible, and a missing one throws', async () => {
  const { page, calls } = fakeBrowser({ boxes: { '#figure': BAR } });

  await expect(rectOf(page.locator('#figure'))).resolves.toStrictEqual(BAR);
  await expect(
    rectOf(page.locator('#gone'), { timeout: 15_000 }),
  ).rejects.toThrow('the element is visible, not laid out');
  expect(calls).toStrictEqual([
    ['waitFor', '#figure', VISIBLE],
    ['boundingBox', '#figure'],
    ['waitFor', '#gone', { state: 'visible', timeout: 15_000 }],
    ['boundingBox', '#gone'],
  ]);
});

test("a drag takes the bar by its middle and moves it in twelve steps, as every site's did", async () => {
  const { page, calls } = fakeBrowser({ boxes: { [BARS]: BAR } });

  await dragSplitBar(page, splitBar(page), -260);

  expect(calls).toStrictEqual([
    ['waitFor', BARS, VISIBLE],
    ['boundingBox', BARS],
    ['move', 603.5, 410],
    ['down'],
    ['move', 343.5, 410, { steps: 12 }],
    ['up'],
  ]);
});

test('a bar taller than the window is taken by the middle of the part on screen', async () => {
  const tall = { x: 600, y: -100, width: 7, height: 1600 };
  const { page, calls } = fakeBrowser({
    boxes: { [BARS]: tall },
    viewport: { width: 1512, height: 900 },
  });

  await dragSplitBar(page, splitBar(page), 120, { grip: 'visible' });

  expect(calls.slice(2)).toStrictEqual([
    ['move', 603.5, 450],
    ['down'],
    ['move', 723.5, 450, { steps: 12 }],
    ['up'],
  ]);
});

test('without a viewport the part on screen is the whole bar', async () => {
  const { page, calls } = fakeBrowser({ boxes: { [BARS]: BAR } });

  await dragSplitBar(page, splitBar(page), 10, { grip: 'visible' });

  expect(calls[2]).toStrictEqual(['move', 603.5, 410]);
});

test('a grip worked out from the bar presses that far down it', async () => {
  const { page, calls } = fakeBrowser({
    boxes: { [BARS]: BAR, '.short': { ...BAR, height: 300 } },
  });

  // crystals' 200 pixels down, and lcao's 200 pixels or the middle.
  await dragSplitBar(page, splitBar(page), 50, { grip: () => 200 });
  await dragSplitBar(page, page.locator('.short'), 50, { grip: lcaoGrip });

  expect(calls[2]).toStrictEqual(['move', 603.5, 260]);
  expect(calls[4]).toStrictEqual(['move', 653.5, 260, { steps: 12 }]);
  expect(calls[8]).toStrictEqual(['move', 603.5, 210]);
});

test('hovering first presses where the pointer landed, then moves from the middle', async () => {
  const { page, calls } = fakeBrowser({ boxes: { [BARS]: BAR } });

  await dragSplitBar(page, splitBar(page), 100, { hover: true });

  expect(calls).toStrictEqual([
    ['hover', BARS],
    ['waitFor', BARS, VISIBLE],
    ['boundingBox', BARS],
    ['down'],
    ['move', 703.5, 410, { steps: 12 }],
    ['up'],
  ]);
});

test('a column bar is dragged down', async () => {
  const across = { x: 100, y: 400, width: 800, height: 7 };
  const { page, calls } = fakeBrowser({ boxes: { '.bar': across } });

  await dragSplitBar(page, page.locator('.bar'), 60, { axis: 'y' });

  expect(calls.slice(2)).toStrictEqual([
    ['move', 500, 403.5],
    ['down'],
    ['move', 500, 463.5, { steps: 12 }],
    ['up'],
  ]);
});

test('the share counts both panes and the bar between them, read in that order', async () => {
  const { page, calls } = fakeBrowser({
    boxes: {
      [`${BARS} >> ${START}`]: { x: 0, y: 60, width: 588, height: 700 },
      [`${BARS} >> ${END}`]: { x: 607, y: 60, width: 805, height: 700 },
      [BARS]: BAR,
    },
  });

  const share = await splitShare(splitBar(page));

  expect(share).toBe((588 / (588 + 805 + 7)) * 100);
  expect(calls).toStrictEqual([
    ['waitFor', `${BARS} >> ${START}`, VISIBLE],
    ['boundingBox', `${BARS} >> ${START}`],
    ['waitFor', `${BARS} >> ${END}`, VISIBLE],
    ['boundingBox', `${BARS} >> ${END}`],
    ['waitFor', BARS, VISIBLE],
    ['boundingBox', BARS],
  ]);
});

test('a share may leave the bar out, and a column shares its height', async () => {
  const bar = `.split-row--down >> ${BARS}`;
  const { page, calls } = fakeBrowser({
    boxes: {
      [`${bar} >> ${START}`]: { x: 0, y: 0, width: 600, height: 300 },
      [`${bar} >> ${END}`]: { x: 0, y: 307, width: 600, height: 450 },
      [bar]: { x: 0, y: 300, width: 600, height: 7 },
    },
  });
  const column = splitBar(page.locator('.split-row--down'));

  await expect(splitShare(column, { countBar: false })).resolves.toBe(
    (600 / (600 + 600)) * 100,
  );
  expect(calls).toHaveLength(4);
  await expect(splitShare(column, { along: 'height' })).resolves.toBe(
    (300 / (300 + 450 + 7)) * 100,
  );
});
