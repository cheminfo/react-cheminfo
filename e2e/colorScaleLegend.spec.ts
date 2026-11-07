/**
 * A legend narrower than its one line breaks after the label, never between an
 * end value and the bar it stands at the end of.
 */

import type { Locator } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

async function boxOf(locator: Locator): Promise<Box> {
  const box = await locator.boundingBox();
  if (box === null) throw new Error('not drawn');
  return box;
}

function middleOf(box: Box): number {
  return box.y + box.height / 2;
}

for (const width of [320, 1024]) {
  test(`at ${width} px the end values stand at the ends of the bar`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 600 });
    await openStory(page, 'color-colorscalelegend--default');
    const bar = page.getByRole('img', { name: /^Orbital energy from/ });
    await expect(bar).toBeVisible();

    const barBox = await boxOf(bar);
    const low = await boxOf(page.getByText('-12.4 eV', { exact: true }));
    const high = await boxOf(page.getByText('-3.1 eV', { exact: true }));
    const label = await boxOf(
      page.getByText('Orbital energy', { exact: true }),
    );

    expect(Math.abs(middleOf(low) - middleOf(barBox))).toBeLessThan(1);
    expect(Math.abs(middleOf(high) - middleOf(barBox))).toBeLessThan(1);
    expect(low.x + low.width).toBeLessThanOrEqual(barBox.x);
    expect(high.x).toBeGreaterThanOrEqual(barBox.x + barBox.width);
    if (width === 320) {
      expect(label.y + label.height).toBeLessThanOrEqual(barBox.y);
    } else {
      expect(Math.abs(middleOf(label) - middleOf(barBox))).toBeLessThan(1);
    }
  });
}
