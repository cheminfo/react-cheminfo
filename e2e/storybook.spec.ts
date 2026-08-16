import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

// Every story the book holds, so a component that gains one without a spec, or
// loses one to a rename, is noticed rather than silently skipped.
const STORY_IDS = [
  'citation-citationmenu--default',
  'citation-citationpreview--bib-te-x',
  'citation-citationpreview--doi-link',
  'citation-citationpreview--html',
  'citation-citationpreview--markdown',
  'citation-citationpreview--ris',
  'citation-citebutton--bottom-start',
  'citation-citebutton--compact',
  'citation-citebutton--custom-label',
  'citation-citebutton--default',
  'citation-citebutton--in-header',
  'ecosystem-ecosystembutton--compact',
  'ecosystem-ecosystembutton--current-site',
  'ecosystem-ecosystembutton--default',
  'ecosystem-ecosystembutton--in-header',
  'ecosystem-ecosystemmenu--current-site',
  'ecosystem-ecosystemmenu--default',
  'ecosystem-sitemark--default',
  'ecosystem-sitemark--every-site',
  'ecosystem-sitemark--every-size',
];

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

test('every story renders, with nothing thrown', async ({ page }) => {
  const problems: string[] = [];
  page.on('pageerror', (error) => problems.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(message.text());
  });

  /* eslint-disable no-await-in-loop -- one page walks the stories in turn */
  for (const id of STORY_IDS) {
    await openStory(page, id);
    // Storybook writes a render failure into its own error display instead of
    // throwing, so the listeners above would not see a story that failed to
    // draw; the display sits in the page at all times and is only shown then.
    await expect(page.locator('#storybook-root > *').first()).toBeVisible();
    await expect(page.locator('#error-message')).toBeHidden();
  }
  /* eslint-enable no-await-in-loop */

  expect(problems).toStrictEqual([]);
});

test('the brand toolbar retunes the colours a story reads', async ({
  page,
}) => {
  await openStory(page, 'citation-citebutton--default');
  await expect(page.getByRole('button', { name: 'Cite' })).toBeVisible();
  expect(await brandOf(page)).toBe('#2d72d2');

  await openStory(page, 'citation-citebutton--default', 'brand:surge');
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
