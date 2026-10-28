import type { Locator } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

// The depiction pulls openchemlib, which a cold Vite dev server compiles before
// it serves it.
test.describe.configure({ timeout: 90_000 });

/**
 * The atoms or bonds react-ocl has painted in one picture.
 * @param picture - The svg.
 * @param kind - Which of the two to count.
 * @returns The painted ones.
 */
function painted(picture: Locator, kind: 'Atom' | 'Bond'): Locator {
  // openchemlib writes every highlight shape at opacity 0; react-ocl raises
  // the painted ones.
  return picture.locator(`[id*=":${kind}:"]:not([opacity="0"])`);
}

test('every match of the query is painted, atoms and bonds alike', async ({
  page,
}) => {
  await openStory(page, 'structure-structure--substructure');
  const picture = (name: string) =>
    page.locator('svg').filter({ hasText: name });

  await expect(painted(picture('aspirin'), 'Atom')).toHaveCount(6);
  await expect(painted(picture('aspirin'), 'Bond')).toHaveCount(6);
  await expect(painted(picture('benzene'), 'Atom')).toHaveCount(6);
  await expect(painted(picture('benzene'), 'Bond')).toHaveCount(6);
  await expect(picture('caffeine')).toBeVisible();
  await expect(painted(picture('caffeine'), 'Atom')).toHaveCount(0);

  // A light yellow, so the bonds and labels under it stay legible.
  const atom = painted(picture('aspirin'), 'Atom').first();
  await expect(atom).toHaveAttribute('fill', '#ffd500');
  await expect(atom).toHaveAttribute('opacity', '0.15');
  const bond = painted(picture('aspirin'), 'Bond').first();
  await expect(bond).toHaveAttribute('stroke', '#ffd500');

  await page.screenshot({ path: 'test-results/structure-substructure.png' });
});
