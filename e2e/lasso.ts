import type { Locator, Page } from '@playwright/test';

/** One vertex of a lasso, as a fraction of the plot rectangle. */
export type Vertex = readonly [number, number];

/**
 * The transparent rectangle every gesture on a scatter lands on.
 * @param page - The page showing the plot.
 * @returns The rectangle.
 */
export function plotSurface(page: Page): Locator {
  return page.locator('.chart-frame rect[fill="transparent"]');
}

/**
 * The plot rectangle, in page pixels.
 * @param page - The page showing the plot.
 * @returns The box, as Playwright reports it.
 */
export async function plotBox(page: Page) {
  const box = await plotSurface(page).boundingBox();
  if (box === null) throw new Error('the plot has not been laid out');
  return box;
}

/**
 * Wait for the browser to paint once.
 *
 * The gesture coalesces pointer moves to one a frame, so a burst of moves in
 * one frame is one vertex; a lasso drawn without waiting is a straight line.
 * @param page - The page being dragged on.
 * @returns Nothing, once a frame has passed.
 */
export function nextFrame(page: Page): Promise<void> {
  return page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      }),
  );
}

/**
 * Draw a loop over the plot with the pointer.
 *
 * It is shared by every spec that drags on a figure rather than copied into
 * each: a gesture written twice drifts, and a lasso that has drifted reports a
 * count nobody can reproduce.
 * @param page - The page showing the plot.
 * @param ring - The vertices, as fractions of the plot rectangle.
 * @param modifier - Held for the whole gesture, which is what makes it add or cut.
 * @default modifier undefined — the gesture replaces the selection
 */
export async function lasso(
  page: Page,
  ring: readonly Vertex[],
  modifier?: 'Shift' | 'Alt',
): Promise<void> {
  const box = await plotBox(page);
  const start = ring[0];
  if (start === undefined) throw new Error('a lasso needs a first vertex');

  if (modifier !== undefined) await page.keyboard.down(modifier);
  // Aimed at the plot itself rather than at bare coordinates, so a first
  // vertex that has fallen under a floating card fails here and says so
  // instead of drawing an empty gesture.
  await plotSurface(page).hover({
    position: { x: box.width * start[0], y: box.height * start[1] },
  });
  await page.mouse.down();
  /* eslint-disable no-await-in-loop -- a drag is one move per frame, in order */
  for (let index = 1; index < ring.length; index++) {
    const vertex = ring[index];
    if (vertex === undefined) continue;
    await page.mouse.move(
      box.x + box.width * vertex[0],
      box.y + box.height * vertex[1],
    );
    await nextFrame(page);
  }
  /* eslint-enable no-await-in-loop */
  await page.mouse.up();
  if (modifier !== undefined) await page.keyboard.up(modifier);
}
