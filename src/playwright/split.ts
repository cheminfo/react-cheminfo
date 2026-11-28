/**
 * Measuring a `<SplitRow>` or a `<SplitColumn>` as it is drawn, for the
 * browser suite that checks the share a bar comes to rest at is the one the
 * address names: the bar react-science draws between the two panes, a drag of
 * it, the share the first pane takes, and where any of them is.
 *
 * The share is read off what is drawn rather than off the state, because a
 * parameter that lands in the address and divides nothing passes every unit
 * test there is.
 */

import type { Locator, Page } from '@playwright/test';

/** Where something is drawn, in the page's pixels. */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** How {@link rectOf} waits. */
export interface RectOfOptions {
  /**
   * How long to wait for it to be visible, in milliseconds.
   * @default the suite's action timeout: none unless its configuration sets one
   */
  timeout?: number;
}

/** How {@link dragSplitBar} drags. */
export interface DragSplitBarOptions {
  /**
   * Which way the bar moves: `x` for a row divided across, `y` for a column
   * divided down.
   * @default 'x'
   */
  axis?: 'x' | 'y';
  /**
   * Where along the bar it is taken hold of: its middle; the middle of the part
   * of it on screen, for a bar taller than the window; or that many pixels from
   * its start (its top across, its left down), worked out from where it is.
   * @default 'middle'
   */
  grip?: 'middle' | 'visible' | ((bar: Rect) => number);
  /**
   * Hover the bar first, which waits for a bar still moving — one in a dialog
   * arriving on a transition — and take hold of it where the pointer landed.
   * @default false
   */
  hover?: boolean;
}

/** How {@link splitShare} reads a share. */
export interface SplitShareOptions {
  /**
   * The length the two panes share: `width` for a row, `height` for a column.
   * @default 'width'
   */
  along?: 'width' | 'height';
  /**
   * Whether the bar's own length counts in what the panes share.
   * @default true
   */
  countBar?: boolean;
}

/**
 * The bar react-science draws after the first pane of a split: every one on
 * the page, in document order, or the one at `index`. Given a locator, only the
 * bars inside it — `page.locator('.split-row')` leaves out what follows a row
 * once its panes have stacked.
 * @param scope - The page, or what to look inside.
 * @param index - Which bar; every one when omitted, so a locator expecting one
 * bar stays strict.
 * @returns The bar, or the bars.
 */
export function splitBar(scope: Page | Locator, index?: number): Locator {
  const bars = scope.locator(
    'xpath=.//*[@data-testid="split-start"]/../following-sibling::div[1]',
  );
  return index === undefined ? bars : bars.nth(index);
}

/**
 * Where something is drawn, once it is visible.
 * @param locator - What to measure; it must match one element.
 * @param options - See {@link RectOfOptions}.
 * @returns Its rectangle.
 * @throws {Error} When it is visible and still has no box.
 */
export async function rectOf(
  locator: Locator,
  options: RectOfOptions = {},
): Promise<Rect> {
  await locator.waitFor({ state: 'visible', timeout: options.timeout });
  const rect = await locator.boundingBox();
  if (rect === null) throw new Error('the element is visible, not laid out');
  return rect;
}

/**
 * Take a bar and let it go somewhere else: pressed, moved in 12 steps, released.
 * @param page - The page under test.
 * @param bar - The bar, from {@link splitBar}.
 * @param by - How far to move it, in pixels; negative is left, or up.
 * @param options - See {@link DragSplitBarOptions}.
 */
export async function dragSplitBar(
  page: Page,
  bar: Locator,
  by: number,
  options: DragSplitBarOptions = {},
): Promise<void> {
  const { axis = 'x', grip = 'middle', hover = false } = options;
  if (hover) await bar.hover();
  const rect = await rectOf(bar);
  const point = gripPoint(page, rect, axis, grip);
  if (!hover) await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.mouse.move(
    axis === 'x' ? point.x + by : point.x,
    axis === 'x' ? point.y : point.y + by,
    { steps: 12 },
  );
  await page.mouse.up();
}

/**
 * The share of a split the first pane takes, as drawn, in percent. The two
 * panes are the ones on either side of `bar`, so a row nested inside another
 * one is paired with its own.
 * @param bar - The bar, from {@link splitBar}.
 * @param options - See {@link SplitShareOptions}.
 * @returns The percentage.
 */
export async function splitShare(
  bar: Locator,
  options: SplitShareOptions = {},
): Promise<number> {
  const { along = 'width', countBar = true } = options;
  const start = await rectOf(
    bar.locator(
      'xpath=preceding-sibling::div[1]/*[@data-testid="split-start"]',
    ),
  );
  const end = await rectOf(
    bar.locator('xpath=following-sibling::div[1]/*[@data-testid="split-end"]'),
  );
  let between = 0;
  if (countBar) {
    const drawn = await rectOf(bar);
    between = drawn[along];
  }
  return (start[along] / (start[along] + end[along] + between)) * 100;
}

/**
 * Where a bar is taken hold of.
 * @param page - The page, whose viewport bounds what is on screen.
 * @param rect - The bar.
 * @param axis - Which way it moves.
 * @param grip - See {@link DragSplitBarOptions.grip}.
 * @returns The point.
 */
function gripPoint(
  page: Page,
  rect: Rect,
  axis: 'x' | 'y',
  grip: NonNullable<DragSplitBarOptions['grip']>,
): { x: number; y: number } {
  const across = axis === 'x';
  const start = across ? rect.y : rect.x;
  const length = across ? rect.height : rect.width;
  let along = start + length / 2;
  if (grip === 'visible') {
    const viewport = page.viewportSize();
    const edge =
      (across ? viewport?.height : viewport?.width) ?? start + length;
    along = (Math.max(start, 0) + Math.min(start + length, edge)) / 2;
  } else if (typeof grip === 'function') {
    along = start + grip(rect);
  }
  return across
    ? { x: rect.x + rect.width / 2, y: along }
    : { x: along, y: rect.y + rect.height / 2 };
}
