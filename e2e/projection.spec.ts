import { expect, test } from '@playwright/test';

import type { Vertex } from './lasso.ts';
import { lasso, plotBox, plotSurface } from './lasso.ts';
import { openStory } from './story.ts';

const IRIS = 'projection-pcaviewer--iris';
const PAIRS = 'projection-pcaviewer--every-pair';
const VARIABLES = 'projection-pcaviewer--what-differs';
const PROJECTED = 'projection-pcaviewer--projected-samples';
const UMAP = 'projection-projectionviewer--umap';

/** The glyph in the bar that hands the figure's own explanation back. */
const QUESTION = 'What am I looking at?';

// What each tab is called, how many charts it draws, and the sentence it
// hands back when the reader presses the question mark in the bar.
const TABS = [
  {
    name: 'Map',
    frames: 1,
    caption:
      'Each dot is one sample. Dots that sit together are alike; dots far apart are the ones that differ most. The two axes are the strongest patterns of difference, called components.',
  },
  {
    name: 'Every pair',
    frames: 16,
    caption:
      'The same map drawn for every pair of components. A grouping the first two miss often shows up in another pair.',
  },
  {
    name: 'What differs',
    frames: 3,
    caption:
      'Each panel is one pattern of difference, drawn as your average sample pushed to each end of it: what a sample at each end of the map actually looks like.',
  },
  {
    name: 'How much each explains',
    frames: 1,
    caption:
      'Every component accounts for a share of the differences between your samples, largest first. The first few usually account for most of them.',
  },
] as const;

/**
 * A loop around the left island of the map, which is the fifty setosa.
 *
 * It starts half way down its own left edge rather than in a corner: a
 * floating card takes the pointer back from the figure, so a drag begun under
 * one draws nothing, and the corners are where the cards are.
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

test('the four tabs each show their own figure and say what it is', async ({
  page,
}) => {
  await openStory(page, IRIS);
  const tabs = page.getByRole('tab');
  await expect(tabs).toHaveText(TABS.map((tab) => tab.name));

  /* eslint-disable no-await-in-loop -- one reader walks the tabs in turn */
  for (const tab of TABS) {
    const button = page.getByRole('tab', { name: tab.name, exact: true });
    await button.click();
    await expect(button).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('.chart-frame')).toHaveCount(tab.frames);

    // Nothing stands under the figure any more: the words that used to are
    // behind the one glyph the bar never folds away. Moving to the next tab
    // closes what this one opened, which is what the count above checks.
    await expect(page.getByText(tab.caption)).toHaveCount(0);
    await page.getByRole('button', { name: QUESTION }).click();
    await expect(page.getByText(tab.caption)).toHaveCount(1);
  }
  /* eslint-enable no-await-in-loop */
});

test('a lasso on the map reports how many samples it caught', async ({
  page,
}) => {
  await openStory(page, IRIS);
  await expect(
    page.getByRole('button', { name: 'Zoom to selection' }),
  ).toHaveCount(0);

  await lasso(page, LEFT_ISLAND);

  await expect(
    page.getByText('50 of 150 samples selected.', { exact: true }),
  ).toHaveCount(1);
  await expect(page.locator('circle[data-ring="select"]')).toHaveCount(50);

  // The two selection actions behind the cog are dead until something is
  // picked, so the count reached the bar as well as the caption.
  await page.getByRole('button', { name: 'Options', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Zoom to selection' }),
  ).toBeEnabled();
  await expect(
    page.getByRole('button', { name: 'Clear selection' }),
  ).toBeEnabled();
});

test('clicking a cell of the pair grid promotes that pair onto the map', async ({
  page,
}) => {
  await openStory(page, PAIRS);
  await expect(page.locator('[data-scatter-cell]')).toHaveCount(16);

  // Column 0, row 2: the first component across and the third up.
  await page.locator('[data-scatter-cell="0,2"]').click();

  const map = page.getByRole('tab', { name: 'Map', exact: true });
  await expect(map).toHaveAttribute('aria-selected', 'true');
  await expect(
    page.locator('.chart-frame .chart-axis-bottom text').last(),
  ).toHaveText('PC1 — 73.0 %');
  await expect(
    page.locator('.chart-frame .chart-axis-left text').last(),
  ).toHaveText('PC3 — 3.7 %');
});

test('the loadings panels are one per component and track the pointer', async ({
  page,
}) => {
  await openStory(page, VARIABLES);
  const panels = page.locator('.chart-frame');
  await expect(panels).toHaveCount(3);
  await expect(page.getByText('PC1 — 73.0 %', { exact: true })).toHaveCount(1);
  await expect(page.getByText('PC2 — 22.9 %', { exact: true })).toHaveCount(1);
  await expect(page.getByText('PC3 — 3.7 %', { exact: true })).toHaveCount(1);

  // Only the last panel names the axis its slots are laid along.
  const last = panels.last();
  const names = last.locator('svg[width="100%"] .chart-axis-bottom text');
  await expect(names).toHaveText([
    'Sepal length',
    'Sepal width',
    'Petal length',
    'Petal width',
    'Measurement',
  ]);

  const slider = last.locator('svg[width="100%"] rect[fill="transparent"]');
  const box = await slider.boundingBox();
  if (box === null) throw new Error('the panel has not been laid out');
  await page.mouse.move(box.x + box.width * 0.625, box.y + box.height / 2);

  await expect(slider).toHaveAttribute(
    'aria-label',
    'Measurement Petal length',
  );
  await expect(last.locator('svg[width="100%"] circle')).toHaveCount(3);
});

test('samples placed into a finished model are drawn hollow and named', async ({
  page,
}) => {
  await openStory(page, PROJECTED);

  const dots = page.locator('g[data-layer="points"] circle');
  await expect(dots).toHaveCount(150);
  // The model was fitted on the first 120 flowers, so the last 30 are the
  // hollow ones: same radius, colour moved from the fill to the stroke.
  await expect(
    page.locator('g[data-layer="points"] circle[fill="none"]'),
  ).toHaveCount(30);

  // The key floats on the plot and says what the shape means; why it matters
  // is in the paragraph behind the question mark.
  await expect(
    page.getByText('Hollow = added after the map was built'),
  ).toHaveCount(1);

  await page.getByRole('button', { name: QUESTION }).click();
  await expect(
    page.getByText(
      'The hollow dots were placed on the finished map afterwards, so one of them landing far out is a finding rather than a fault.',
    ),
  ).toHaveCount(1);
});

test('a result that can fill one tab is drawn with no strip at all', async ({
  page,
}) => {
  await openStory(page, UMAP);

  await expect(page.getByRole('tablist')).toHaveCount(0);
  await expect(page.getByRole('tab')).toHaveCount(0);
  await expect(page.locator('g[data-layer="points"] circle')).toHaveCount(150);
  await expect(
    page.locator('.chart-frame .chart-axis-bottom text').last(),
  ).toHaveText('UMAP1');
});

test('the bar writes less of itself as the figure narrows, and never less than the values', async ({
  page,
}) => {
  await openStory(page, IRIS);
  const tabs = page.getByRole('tab');
  // Exactly, because the chip announces both settings and would otherwise
  // answer to either of their names on its own.
  const colour = page.getByRole('button', {
    name: 'Colour by — Species',
    exact: true,
  });
  const outlines = page.getByRole('button', {
    name: 'Group outlines — 95%',
    exact: true,
  });
  const chip = page.getByRole('button', {
    name: 'Colour by — Species, Group outlines — 95%',
    exact: true,
  });
  const help = page.getByRole('button', { name: QUESTION });

  // Every word: the views in full, and a key word in front of each value.
  await page.setViewportSize({ width: 1200, height: 900 });
  await expect(tabs).toHaveText(TABS.map((tab) => tab.name));
  await expect(page.getByText('Outlines', { exact: true })).toHaveCount(1);
  await expect(outlines).toHaveCount(1);

  // The key word is the first thing to go: a setting's name is read once and
  // its value every time.
  await page.setViewportSize({ width: 700, height: 900 });
  await expect(page.getByText('Outlines', { exact: true })).toHaveCount(0);
  await expect(tabs).toHaveText(TABS.map((tab) => tab.name));
  await expect(colour).toHaveCount(1);
  await expect(outlines).toHaveCount(1);

  // Then the long form of the view names, written out rather than truncated.
  await page.setViewportSize({ width: 560, height: 900 });
  await expect(tabs).toHaveText(['Map', 'Pairs', 'Differs', 'Explains']);
  await expect(outlines).toHaveCount(1);

  // Then the boxes around the settings, which gather into one chip that still
  // reads the configuration. The question mark is still on the row.
  await page.setViewportSize({ width: 460, height: 900 });
  await expect(chip).toHaveCount(1);
  await expect(outlines).toHaveCount(0);
  await expect(help).toHaveCount(1);

  // On the narrowest figure the question mark folds into the cog, and nothing
  // else does: four views, and a chip still saying Species and 95%.
  await page.setViewportSize({ width: 380, height: 900 });
  await expect(chip).toHaveCount(1);
  await expect(help).toHaveCount(0);
  await expect(tabs).toHaveCount(4);
  await expect(tabs.first()).toBeInViewport();
});

test('the map catches the wheel once the pointer has rested on it, and a double click gives the view back', async ({
  page,
}) => {
  await openStory(page, IRIS);
  const ticks = page.locator('.chart-frame .chart-axis-bottom text');
  const WHOLE = ['-4', '-2', '0', '2', '4', 'PC1 — 73.0 %'];
  await expect(ticks).toHaveText(WHOLE);

  // A reader on their way past the figure keeps their scroll: the wheel is
  // not caught until the pointer has stayed, and this one has just arrived.
  const box = await plotBox(page);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, -200);
  await expect(ticks).toHaveText(WHOLE);

  // Half a second later the same gesture zooms about the middle of the plot,
  // where the pointer is: a quarter off each end, and the axis written in
  // steps of one because that is what the frame it is left with carries.
  await page.waitForTimeout(CAUGHT_MS);
  await page.mouse.wheel(0, -200);
  await expect(ticks).toHaveText(['-2', '-1', '0', '1', '2', 'PC1 — 73.0 %']);

  await plotSurface(page).dblclick({
    position: { x: box.width / 2, y: box.height / 2 },
  });
  await expect(ticks).toHaveText(WHOLE);
});

/**
 * Long enough for the dwell to be up. It is the component's own half second
 * plus room for a slow frame, since a test that races the timer fails on a
 * loaded machine and says nothing about the gesture.
 */
const CAUGHT_MS = 800;
