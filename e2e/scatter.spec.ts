import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import type { Vertex } from './lasso.ts';
import { lasso, plotBox, plotSurface } from './lasso.ts';
import { openStory } from './story.ts';

// The lasso story reports what it caught in a paragraph under the figure, so a
// gesture can be checked against species rather than against a bare number.
const LASSO_STORY = 'scatter-scatterplot--lasso';
const HOVER_STORY = 'scatter-scatterplot--hover-card';
const MAP_STORY = 'projection-pcaviewer--iris';

const NOTHING_PICKED = 'Nothing selected — drag a loop around some dots.';

/**
 * A loop around the left island of the iris map, which holds the fifty setosa
 * and nothing else: their dots span 0.16 to 0.28 across, and the nearest
 * versicolor is at 0.44.
 *
 * Every ring here starts half way down its own left edge rather than in a
 * corner. A floating card takes the pointer back from the figure, so a drag
 * begun under one draws nothing at all, and the corners are where the cards
 * are.
 */
const LEFT_ISLAND: readonly Vertex[] = [
  [0.02, 0.5],
  [0.02, 0.25],
  [0.02, 0.01],
  [0.15, 0.01],
  [0.28, 0.01],
  [0.36, 0.01],
  [0.36, 0.3],
  [0.36, 0.6],
  [0.36, 0.99],
  [0.25, 0.99],
  [0.12, 0.99],
  [0.02, 0.99],
  [0.02, 0.75],
];

/** A loop around everything to the right of that island: fifty of each of the other two. */
const RIGHT_CROWD: readonly Vertex[] = [
  [0.4, 0.5],
  [0.4, 0.25],
  [0.4, 0.01],
  [0.6, 0.01],
  [0.8, 0.01],
  [0.995, 0.01],
  [0.995, 0.3],
  [0.995, 0.6],
  [0.995, 0.99],
  [0.8, 0.99],
  [0.6, 0.99],
  [0.4, 0.99],
  [0.4, 0.75],
];

/**
 * Flower 42, the most isolated dot on the map — ninety pixels from its nearest
 * neighbour, so the card it opens can only be its own.
 */
const LONE_FLOWER: Vertex = [0.2685, 0.8883];

/**
 * The ring drawn around each selected dot.
 * @param page - The page showing the plot.
 * @returns Every ring on it.
 */
function rings(page: Page): Locator {
  return page.locator('circle[data-ring="select"]');
}

test('a drag lassoes a crowd and selects exactly the dots inside it', async ({
  page,
}) => {
  await openStory(page, LASSO_STORY);
  await expect(page.locator('#storybook-root p')).toHaveText(NOTHING_PICKED);

  await lasso(page, LEFT_ISLAND);

  await expect(page.locator('#storybook-root p')).toHaveText(
    '50 of 150 samples selected. 50 setosa.',
  );
  await expect(rings(page)).toHaveCount(50);
  // A selected dot gains a ring and keeps its colour, so the cloud is still
  // 150 dots and still says which species each one is.
  await expect(page.locator('g[data-layer="points"] circle')).toHaveCount(150);
});

test('shift adds to the selection and alt cuts from it', async ({ page }) => {
  await openStory(page, LASSO_STORY);
  await lasso(page, LEFT_ISLAND);
  await expect(rings(page)).toHaveCount(50);

  await lasso(page, RIGHT_CROWD, 'Shift');
  await expect(page.locator('#storybook-root p')).toHaveText(
    '150 of 150 samples selected. 50 setosa, 50 versicolor, 50 virginica.',
  );
  await expect(rings(page)).toHaveCount(150);

  await lasso(page, LEFT_ISLAND, 'Alt');
  await expect(page.locator('#storybook-root p')).toHaveText(
    '100 of 150 samples selected. 50 versicolor, 50 virginica.',
  );
  await expect(rings(page)).toHaveCount(100);
});

test('a click on empty ground clears the selection', async ({ page }) => {
  await openStory(page, LASSO_STORY);
  await lasso(page, LEFT_ISLAND);
  await expect(rings(page)).toHaveCount(50);

  // The bottom right corner of the plot is 200 pixels from the nearest dot, so
  // the click lands on nothing at all.
  const box = await plotBox(page);
  await plotSurface(page).click({
    position: { x: box.width * 0.98, y: box.height * 0.98 },
  });

  await expect(page.locator('#storybook-root p')).toHaveText(NOTHING_PICKED);
  await expect(rings(page)).toHaveCount(0);
});

test('resting on a dot opens a card carrying that sample', async ({ page }) => {
  await openStory(page, HOVER_STORY);
  await expect(page.getByRole('tooltip')).toHaveCount(0);

  const box = await plotBox(page);
  await page.mouse.move(
    box.x + box.width * LONE_FLOWER[0],
    box.y + box.height * LONE_FLOWER[1],
  );

  const card = page.getByRole('tooltip');
  await expect(card).toHaveCount(1);
  await expect(card).toContainText('Flower 42');
  await expect(card).toContainText('setosa');
  // Its four measurements, which is what the caller knows and the plot does not.
  await expect(card).toContainText('4.5 cm');
  await expect(card).toContainText('2.3 cm');
  await expect(card).toContainText('1.3 cm');
  await expect(card).toContainText('0.3 cm');

  await page.mouse.move(2, 2);
  await expect(card).toHaveCount(0);
});

test('the group outlines appear and disappear with their control', async ({
  page,
}) => {
  await openStory(page, MAP_STORY);
  const outlines = page.locator('g[data-layer="ellipses"] ellipse');
  await expect(outlines).toHaveCount(3);
  // The key floating on the plot names the colour and nothing else; what an
  // outline actually holds is in the paragraph behind the question mark.
  await expect(
    page.getByText('Colour = species.', { exact: true }),
  ).toHaveCount(1);
  await page.getByRole('button', { name: 'What am I looking at?' }).click();
  await expect(
    page.getByText(
      'Colour = species. Each outline covers about 95% of that group, assuming the group is roughly bell-shaped.',
    ),
  ).toHaveCount(1);

  await page.keyboard.press('Escape');

  // On the bar the setting is written as what it currently is, so the reader
  // knows how wide the rings are drawn before pressing anything; the choices
  // behind it open under the setting's own name.
  await page.getByRole('button', { name: 'Group outlines — 95%' }).click();
  await page.getByRole('option', { name: 'None', exact: true }).click();

  await expect(page.locator('g[data-layer="ellipses"]')).toHaveCount(0);
  await expect(
    page.getByText('Colour = species.', { exact: true }),
  ).toHaveCount(1);

  await page.getByRole('button', { name: 'Group outlines — None' }).click();
  await page.getByRole('option', { name: '50%', exact: true }).click();
  await expect(outlines).toHaveCount(3);
  await page.getByRole('button', { name: 'What am I looking at?' }).click();
  await expect(
    page.getByText(
      'Colour = species. Each outline covers about 50% of that group, assuming the group is roughly bell-shaped.',
    ),
  ).toHaveCount(1);
});
