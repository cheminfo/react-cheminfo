import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';
import { STORY_IDS } from './storyIds.ts';

// React reports every caught error-boundary hit through `console.error`, so the
// stories whose child throws on purpose — the only way the fallback is visible —
// would fail the walk below on the very message they exist to show.
const STORIES_THAT_THROW_ON_PURPOSE = new Set([
  'error-errorboundary--caught',
  'error-errorboundary--caught-with-title',
  'error-errorboundary--custom-fallback',
]);

test('the book holds exactly the stories the specs address', async ({
  page,
}) => {
  const response = await page.request.get('/index.json');
  const index = (await response.json()) as {
    entries: Record<string, { type: string }>;
  };

  const stories = Object.entries(index.entries)
    .filter(([, entry]) => entry.type === 'story')
    .map(([id]) => id)
    .toSorted();

  expect(stories).toStrictEqual(STORY_IDS);
});

// The walk is cut into slices, each a test of its own, so the book spreads over
// the workers instead of holding one of them for every story.
const STORIES_PER_TEST = 50;

for (let start = 0; start < STORY_IDS.length; start += STORIES_PER_TEST) {
  const slice = STORY_IDS.slice(start, start + STORIES_PER_TEST);

  test(`every story renders, with nothing thrown (${start + 1}–${start + slice.length})`, async ({
    page,
  }) => {
    // One page opens each story of the slice in turn, so the budget is per
    // story rather than Playwright's flat 30 s: a cold runner is far slower
    // than a warm laptop at each navigation. Without this the walk is killed
    // part-way and reports the story it happened to be on as empty.
    test.setTimeout(Math.max(60_000, slice.length * 2_000));

    const problems: string[] = [];
    page.on('pageerror', (error) => problems.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') problems.push(message.text());
    });

    /* eslint-disable no-await-in-loop -- one page walks the stories in turn */
    for (const id of slice) {
      const before = problems.length;
      await openStory(page, id);
      // Storybook writes a render failure into its own error display instead
      // of throwing, so the listeners above would not see a story that failed
      // to draw; the display sits in the page at all times and is only shown
      // then.
      await expect(page.locator('#storybook-root > *').first()).toBeVisible();
      await expect(page.locator('#error-message')).toBeHidden();
      if (STORIES_THAT_THROW_ON_PURPOSE.has(id)) problems.length = before;
    }
    /* eslint-enable no-await-in-loop */

    expect(problems).toStrictEqual([]);
  });
}

test('the brand toolbar retunes the colours a story reads', async ({
  page,
}) => {
  await openStory(page, 'citation-citebutton--default');
  await expect(page.getByRole('button', { name: 'Cite' })).toBeVisible();
  expect(await brandOf(page)).toBe('#2d72d2');

  await openStory(page, 'citation-citebutton--default', 'brand:isomers');
  await expect(page.getByRole('button', { name: 'Cite' })).toBeVisible();
  expect(await brandOf(page)).toBe('#4338ca');
});

/**
 * The leading colour currently on the document, which is the contract a site's
 * two colours reach the components through.
 * @param page - The page showing a story.
 * @returns The value of `--brand`.
 */
function brandOf(page: Parameters<typeof openStory>[0]): Promise<string> {
  return page.evaluate(() =>
    window
      .getComputedStyle(document.documentElement)
      .getPropertyValue('--brand')
      .trim(),
  );
}
