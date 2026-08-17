import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

// Every story the book holds, so a component that gains one without a spec, or
// loses one to a rename, is noticed rather than silently skipped.
const STORY_IDS = [
  'capsule-capsulefilter--compact-counts',
  'capsule-capsulefilter--default',
  'capsule-capsulefilter--pre-selected',
  'capsule-capsulefilter--without-counts',
  'chrome-navlink--active',
  'chrome-navlink--as-button',
  'chrome-navlink--default',
  'chrome-navlink--external',
  'chrome-navlink--link-and-button',
  'chrome-navlink--with-count',
  'chrome-navlink--with-icon',
  'chrome-navmenubutton--default',
  'chrome-navmenubutton--holds-the-page-on-show',
  'chrome-navmenubutton--in-bar',
  'chrome-navmenubutton--opened',
  'chrome-navmenubutton--with-action',
  'chrome-sitefooter--custom-heading',
  'chrome-sitefooter--default',
  'chrome-sitefooter--embedded',
  'chrome-sitefooter--row',
  'chrome-sitefooter--with-site-line',
  'chrome-siteheader--active-and-hovered',
  'chrome-siteheader--default',
  'chrome-siteheader--embedded',
  'chrome-siteheader--every-site',
  'chrome-siteheader--narrow',
  'chrome-siteheader--whole-page',
  'citation-citationmenu--default',
  'citation-citationmenu--several-works',
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
  'citation-citebutton--own-guidance',
  'citation-citebutton--several-works',
  'clipboard-codeblock--copyable',
  'clipboard-codeblock--dark',
  'clipboard-codeblock--default',
  'clipboard-codeblock--highlighted',
  'clipboard-codeblock--muted',
  'clipboard-codeblock--scrolling',
  'clipboard-copybutton--custom-label',
  'clipboard-copybutton--default',
  'clipboard-copybutton--icon-only',
  'clipboard-copybutton--lazy-content',
  'clipboard-copybutton--minimal',
  'color-colorscalelegend--default',
  'color-colorscalelegend--readable-swatches',
  'color-colorscalelegend--universal-indicator',
  'credits-creditslist--default',
  'credits-creditslist--every-work',
  'credits-creditslist--in-about-dialog',
  'credits-creditslist--without-licenses',
  'delimited-delimitedtextdialog--comma-separated',
  'delimited-delimitedtextdialog--default',
  'delimited-delimitedtextdialog--from-a-button',
  'delimited-delimitedtextpanel--comma-separated',
  'delimited-delimitedtextpanel--default',
  'delimited-delimitedtextpanel--own-description',
  'delimited-delimitedtextpanel--semicolon-separated',
  'delimited-delimitedtextpanel--without-save',
  'disclosure-collapsiblesection--closed',
  'disclosure-collapsiblesection--controlled',
  'disclosure-collapsiblesection--default',
  'disclosure-collapsiblesection--with-icon',
  'disclosure-collapsiblesection--with-right-element',
  'disclosure-usedisclosure--default',
  'disclosure-usedisclosure--driving-a-dialog',
  'disclosure-usedisclosure--starts-closed',
  'ecosystem-ecosystembutton--compact',
  'ecosystem-ecosystembutton--current-site',
  'ecosystem-ecosystembutton--default',
  'ecosystem-ecosystembutton--in-header',
  'ecosystem-ecosystemmenu--current-site',
  'ecosystem-ecosystemmenu--default',
  'ecosystem-sitemark--default',
  'ecosystem-sitemark--every-site',
  'ecosystem-sitemark--every-size',
  'ecosystem-sitetheme--default',
  'ecosystem-sitetheme--side-by-side',
  'ecosystem-sitetheme--tokens',
  'ecosystem-wordmark--default',
  'ecosystem-wordmark--every-site',
  'ecosystem-wordmark--every-size',
  'error-errorboundary--caught',
  'error-errorboundary--caught-with-title',
  'error-errorboundary--custom-fallback',
  'error-errorboundary--default',
  'help-helpicon--beside-field-labels',
  'help-helpicon--default',
  'help-helpicon--every-placement',
  'help-helptoolbarbutton--default',
  'help-helptoolbarbutton--icon-only',
  'help-helptoolbarbutton--in-toolbar',
  'help-helptoolbarbutton--small',
  'help-helptooltip--default',
  'help-helptooltip--every-trigger',
  'help-helptooltip--wide',
  'help-helptooltip--without-example-or-link',
  'hooks-persistbucket--default',
  'hooks-persistbucket--next-version',
  'hooks-usecontainersize--default',
  'hooks-usecontainersize--driving-an-svg',
  'hooks-usedebouncedvalue--default',
  'hooks-usedebouncedvalue--no-delay',
  'hooks-usedebouncedvalue--slow',
  'hooks-uselistkeyboardnavigation--default',
  'hooks-uselistkeyboardnavigation--default-page-step',
  'orbital-atomicorbitalviewer--colour-blind-safe',
  'orbital-atomicorbitalviewer--default',
  'orbital-atomicorbitalviewer--f-orbital',
  'orbital-atomicorbitalviewer--radial-nodes',
  'orbital-atomicorbitalviewer--simple',
  'orbital-atomicorbitalviewer--spinning',
  'pedagogy-exerciseactions--default',
  'pedagogy-exerciseactions--hints-exhausted',
  'pedagogy-exerciseactions--nothing-to-check-yet',
  'pedagogy-exerciseactions--solution-showing',
  'pedagogy-exerciseactions--two-actions',
  'pedagogy-exerciseactions--with-tool-buttons',
  'pedagogy-exerciseleveltag--as-filters',
  'pedagogy-exerciseleveltag--default',
  'pedagogy-exerciseleveltag--every-level',
  'pedagogy-exerciseleveltag--renamed-for-the-course',
  'pedagogy-exerciseleveltag--selected',
  'pedagogy-exerciseprogressheader--confirmation-open',
  'pedagogy-exerciseprogressheader--default',
  'pedagogy-exerciseprogressheader--finished',
  'pedagogy-exerciseprogressheader--nothing-solved-yet',
  'pedagogy-exerciseprogressheader--renamed-for-the-course',
  'pedagogy-exerciseprogressheader--report-only',
  'pedagogy-exercisestatusicon--announced',
  'pedagogy-exercisestatusicon--default',
  'pedagogy-exercisestatusicon--every-status',
  'pedagogy-exercisestatusicon--large',
  'pedagogy-exercisestatusicon--the-exercise-list',
  'pedagogy-glossaryprovider--default',
  'pedagogy-glossaryprovider--no-terms-yet',
  'pedagogy-glossaryprovider--two-vocabularies',
  'pedagogy-glossarytext--default',
  'pedagogy-glossarytext--no-glossary',
  'pedagogy-glossarytext--opens-to-the-right',
  'pedagogy-glossarytext--own-glossary',
  'pedagogy-glossarytext--renamed-in-the-sentence',
  'pedagogy-hintladder--default',
  'pedagogy-hintladder--exhausted',
  'pedagogy-hintladder--partly-open',
  'pedagogy-hintladder--renamed-for-the-tool',
  'pedagogy-hintladder--without-the-button',
  'pedagogy-referencegrid--cheatsheet-page',
  'pedagogy-referencegrid--default',
  'pedagogy-referencegrid--one-column',
  'pedagogy-referencegrid--wide-syntax-column',
  'pedagogy-referencegrid--with-a-screen-only-block',
  'pedagogy-referencesectionblock--another-colour',
  'pedagogy-referencesectionblock--default',
  'pedagogy-referencesectionblock--narrow-syntax-column',
  'pedagogy-referencesectionblock--screen-only',
  'pedagogy-referencesectionblock--sparse',
  'pedagogy-syntaxtooltip--default',
  'pedagogy-syntaxtooltip--on-a-cheatsheet-row',
  'pedagogy-syntaxtooltip--open',
  'pedagogy-syntaxtooltip--renamed-labels',
  'pedagogy-syntaxtooltip--without-a-tag',
  'pedagogy-testcaselist--all-passing',
  'pedagogy-testcaselist--default',
  'pedagogy-testcaselist--not-graded-yet',
  'pedagogy-testcaselist--with-the-molecule-named',
  'pedagogy-tutorialstepstrip--default',
  'pedagogy-tutorialstepstrip--mid-course',
  'pedagogy-tutorialstepstrip--no-pager',
  'pedagogy-tutorialstepstrip--one-level-only',
  'pedagogy-tutorialstepstrip--plain-level-names',
  'pedagogy-tutorialstepstrip--with-a-pager-hint',
  'share-hiddenpartsprovider--default',
  'share-hiddenpartsprovider--from-the-link',
  'share-hiddenpartsprovider--nothing-hidden',
  'share-pagepart--default',
  'share-pagepart--hidden',
  'share-pagepart--side-by-side',
  'share-sharebutton--as-blueprint-button',
  'share-sharebutton--compact',
  'share-sharebutton--custom-label',
  'share-sharebutton--default',
  'share-sharebutton--in-header',
  'share-sharedialog--default',
  'share-sharedialog--everything-shown',
  'share-sharedialog--from-the-header',
  'share-sharedialog--the-link-and-the-frame',
  'share-sharedialog--with-tool-section',
  'structure-structure--default',
  'structure-structure--every-size',
  'structure-structure--highlighted',
  'structure-structure--labels',
  'structure-structure--real-molecules',
  'structure-structure--unreadable',
  'structure-structureeditor--default',
  'structure-structureeditor--empty',
  'structure-structureeditor--fragment',
  'structure-structureeditor--no-debounce',
  'structure-structureeditor--reaction',
];

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

test('every story renders, with nothing thrown', async ({ page }) => {
  const problems: string[] = [];
  page.on('pageerror', (error) => problems.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(message.text());
  });

  /* eslint-disable no-await-in-loop -- one page walks the stories in turn */
  for (const id of STORY_IDS) {
    const before = problems.length;
    await openStory(page, id);
    // Storybook writes a render failure into its own error display instead of
    // throwing, so the listeners above would not see a story that failed to
    // draw; the display sits in the page at all times and is only shown then.
    await expect(page.locator('#storybook-root > *').first()).toBeVisible();
    await expect(page.locator('#error-message')).toBeHidden();
    if (STORIES_THAT_THROW_ON_PURPOSE.has(id)) problems.length = before;
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
