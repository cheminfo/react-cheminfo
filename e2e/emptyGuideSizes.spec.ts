import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

/** A box a tool gives its guide, and what the guide keeps in it. */
interface BoxCase {
  story: string;
  width: number;
  height: number;
  figures: boolean;
}

const CASES: readonly BoxCase[] = [
  { story: 'large', width: 1000, height: 600, figures: true },
  { story: 'half-editor', width: 590, height: 370, figures: true },
  { story: 'small', width: 480, height: 320, figures: true },
  { story: 'phone', width: 360, height: 640, figures: false },
];

/** Where an element is drawn, in CSS pixels. */
interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

const START = 'Start building';
const SECOND_LINE = 'The rays are traced again at every move.';

for (const box of CASES) {
  test(`a ${box.width} × ${box.height} guide keeps its buttons in the box${box.figures ? ' and its figures' : ''}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await openStory(page, `guide-emptyguide-sizes--${box.story}`);
    const frame = page.getByTestId('guide-box');
    const guide = page.getByTestId('empty-guide');
    await expect(guide.getByRole('button', { name: START })).toBeVisible();

    const outer = await boundsOf(frame);
    expect(Math.round(outer.width)).toBe(box.width);
    expect(Math.round(outer.height)).toBe(box.height);
    const lines = await Promise.all([
      boundsOf(guide.getByRole('button', { name: START })),
      boundsOf(guide.getByRole('button', { name: 'Open a file' })),
      boundsOf(guide.getByTestId('empty-guide-hint')),
    ]);
    for (const line of lines) expectInside(line, outer);

    const pictures = guide.locator('.empty-guide__figure img');
    if (box.figures) {
      await expect(pictures).toHaveCount(3);
      await expectLoaded(page);
      const found = await pictures.all();
      const shown = await Promise.all(
        found.map((picture) => boundsOf(picture)),
      );
      for (const picture of shown) {
        expect(picture.height).toBeGreaterThanOrEqual(40);
        expectInside(picture, outer);
      }
      await expect(
        guide.getByText('or click an example to open it'),
      ).toBeVisible();
    } else {
      await expect(guide.getByRole('img')).toHaveCount(0);
      const [start, help] = await Promise.all([
        boundsOf(guide.getByRole('button', { name: START })),
        boundsOf(guide.locator('.empty-guide__help')),
      ]);
      expect(start.y + start.height).toBeLessThanOrEqual(help.y);
    }

    // The guide fades in, and a picture taken during the fade is blank.
    await frame.screenshot({
      path: `test-results/empty-guide-${box.width}x${box.height}.png`,
      animations: 'disabled',
    });
  });
}

test('a large guide says the whole of its help, a small one its first lines', async ({
  page,
}) => {
  await openStory(page, 'guide-emptyguide-sizes--large');
  const guide = page.getByTestId('empty-guide');
  await expect(guide.getByText(SECOND_LINE)).toBeVisible();
  await expect(guide.getByText('Undo', { exact: true })).toBeVisible();
  const large = await boundsOf(guide.getByRole('button', { name: START }));
  expect(large.height).toBeGreaterThanOrEqual(44);

  await openStory(page, 'guide-emptyguide-sizes--half-editor');
  await expect(guide.getByText('Build a bench')).toBeVisible();
  await expect(
    guide.getByText('Drag a source, a lens or a mirror'),
  ).toBeVisible();
  await expect(guide.getByText(SECOND_LINE)).toBeHidden();
  await expect(guide.getByText('Take it away')).toBeVisible();
  await expect(guide.getByText('Undo', { exact: true })).toBeHidden();

  // Two sections fit across 480 pixels, and the third is left out whole
  // rather than cut through a line.
  await openStory(page, 'guide-emptyguide-sizes--small');
  const [help, third] = await Promise.all([
    boundsOf(guide.locator('.empty-guide__help')),
    boundsOf(guide.getByText('Read the image')),
  ]);
  expect(third.y).toBeGreaterThanOrEqual(help.y + help.height);
});

test('a capsule placed in the help takes the click', async ({ page }) => {
  await openStory(page, 'guide-emptyguide-sizes--large');
  const pointer = await page.locator('.empty-guide__help').evaluate((help) => {
    const capsule = document.createElement('span');
    capsule.setAttribute('role', 'button');
    capsule.textContent = 'Capsule';
    help.append(capsule);
    return globalThis.getComputedStyle(capsule).pointerEvents;
  });
  expect(pointer).toBe('auto');
});

/**
 * Where an element is drawn, failing when it is not.
 * @param locator - The element.
 * @returns Its box, in CSS pixels.
 */
async function boundsOf(locator: Locator): Promise<Bounds> {
  const box = await locator.boundingBox();
  if (box === null) throw new Error('The element is not drawn.');
  return box;
}

/**
 * Expect one box to lie within another, to the pixel.
 * @param inner - The box that has to fit.
 * @param outer - The box it has to fit in.
 */
function expectInside(inner: Bounds, outer: Bounds): void {
  expect(inner.x).toBeGreaterThanOrEqual(outer.x - 0.5);
  expect(inner.y).toBeGreaterThanOrEqual(outer.y - 0.5);
  expect(inner.x + inner.width).toBeLessThanOrEqual(
    outer.x + outer.width + 0.5,
  );
  expect(inner.y + inner.height).toBeLessThanOrEqual(
    outer.y + outer.height + 0.5,
  );
}

/**
 * Wait for every figure of the guide to have loaded.
 * @param page - The page the story is open in.
 */
async function expectLoaded(page: Page): Promise<void> {
  await expect
    .poll(() =>
      page
        .locator('.empty-guide__figure img')
        .evaluateAll((images) =>
          images.every(
            (image) =>
              image instanceof HTMLImageElement && image.naturalWidth > 0,
          ),
        ),
    )
    .toBe(true);
}
