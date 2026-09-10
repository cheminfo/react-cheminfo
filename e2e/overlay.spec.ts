import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

// The small card floating in a corner of a figure, met over a real scatter:
// two controls on the strip and the rest behind the cog.
const CARD = 'overlay-overlaybar--second-tier';

// The same card on a figure too narrow to carry a strip, which folds itself.
const FOLDED = 'overlay-overlaybar--collapsed';

// The stretched bar, which is what an embedded figure gets instead: one row
// across the top of the viewer, holding its views as well as its settings.
const EMBEDDED = 'projection-pcaviewer--iris';

// The glyph in the bar that hands the figure's own explanation back, and the
// one thing that leaves the row on a figure too narrow to hold everything.
const QUESTION = 'What am I looking at?';

// What the card's ground is drawn at while nothing is pointing at the figure,
// and what it wakes to. Only the ground fades, never the words on it.
const RESTING = '0.74';
const AWAKE = '1';

/**
 * The strip of controls, which is the card's own named group.
 * @param page - The page showing the figure.
 * @returns The group.
 */
function bar(page: Page): Locator {
  return page.getByRole('group', { name: 'Options', exact: true });
}

/**
 * The translucent ground behind the strip — the one part that fades.
 * @param page - The page showing the figure.
 * @returns The ground.
 */
function ground(page: Page): Locator {
  return bar(page).locator('xpath=preceding-sibling::div[1]');
}

test('the card rests faded and wakes when the pointer reaches the figure', async ({
  page,
}) => {
  await openStory(page, CARD);
  await expect(bar(page)).toHaveCount(1);
  await expect(ground(page)).toHaveCSS('opacity', RESTING);

  await page.locator('.chart-frame').hover();
  await expect(ground(page)).toHaveCSS('opacity', AWAKE);

  // The top left corner of the page is outside the figure, so the pointer
  // leaving it puts the card back to rest.
  await page.mouse.move(2, 2);
  await expect(ground(page)).toHaveCSS('opacity', RESTING);
});

test('a reader arriving by keyboard wakes it without a pointer', async ({
  page,
}) => {
  await openStory(page, CARD);
  await expect(bar(page)).toHaveCount(1);
  await expect(ground(page)).toHaveCSS('opacity', RESTING);

  // The corner of the page is outside the figure, so the click that hands the
  // keyboard to the document leaves the pointer nowhere near the card.
  await page.mouse.click(2, 2);
  await expect(ground(page)).toHaveCSS('opacity', RESTING);

  // The first thing on the page is the help behind the first control's
  // caption — the caption itself now, rather than a question mark beside it —
  // so one press of Tab is a reader arriving at the card itself.
  await page.keyboard.press('Tab');
  await expect(page.locator('.help-name:text-is("Colour by")')).toBeFocused();
  await expect(ground(page)).toHaveCSS('opacity', AWAKE);
});

test('a narrow figure folds the card into a cog holding every control', async ({
  page,
}) => {
  await openStory(page, FOLDED);

  await expect(bar(page)).toHaveCount(0);
  await expect(page.getByRole('radiogroup', { name: 'Colour by' })).toHaveCount(
    0,
  );
  const cog = page.getByRole('button', { name: 'Options', exact: true });
  await expect(cog).toHaveCount(1);

  await cog.click();
  // Folded, the button holds the strip and the second tier alike.
  await expect(page.getByRole('radiogroup', { name: 'Colour by' })).toHaveCount(
    1,
  );
  await expect(
    page.getByRole('combobox', { name: 'Group outlines' }),
  ).toHaveCount(1);
  await expect(
    page.getByRole('combobox', { name: 'Across', exact: true }),
  ).toHaveCount(1);
  await expect(
    page.getByRole('combobox', { name: 'Up', exact: true }),
  ).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Reset view' })).toHaveCount(1);

  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('combobox', { name: 'Across', exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole('radiogroup', { name: 'Colour by' })).toHaveCount(
    0,
  );
});

test('a narrow figure gathers its settings into a chip that still reads them', async ({
  page,
}) => {
  await page.setViewportSize({ width: 380, height: 900 });
  await openStory(page, EMBEDDED);

  // A reader who cannot leave the view they are on is stuck rather than merely
  // short of options, so the strip keeps every view whatever the width.
  await expect(page.getByRole('tab')).toHaveCount(5);

  // What a narrow figure takes from the settings is their boxes, never their
  // answers: the chip is on the row, and it says how the picture is drawn
  // without being opened. That is the whole reason it is a chip and not a cog.
  const chip = page.getByRole('button', {
    name: 'Colour by — Species, Group outlines — 95%',
  });
  await expect(chip).toHaveCount(1);
  await expect(page.getByRole('radiogroup', { name: 'Colour by' })).toHaveCount(
    0,
  );

  await chip.click();
  await expect(page.getByRole('radiogroup', { name: 'Colour by' })).toHaveCount(
    1,
  );
  await expect(
    page.getByRole('combobox', { name: 'Group outlines' }),
  ).toHaveCount(1);
  await page.keyboard.press('Escape');

  // The one glyph that leaves the row at this width is the question mark, and
  // the paragraph it opened is written at the head of the panel instead.
  await expect(page.getByRole('button', { name: QUESTION })).toHaveCount(0);
  await page.getByRole('button', { name: 'Options', exact: true }).click();
  await expect(
    page.getByText(
      'Each dot is one sample. Dots that sit together are alike; dots far apart are the ones that differ most. The two axes are the strongest patterns of difference, called components. Colour = species. Each outline covers about 95% of that group, assuming the group is roughly bell-shaped.',
    ),
  ).toHaveCount(1);
  await expect(
    page.getByRole('button', { name: 'Zoom to selection' }),
  ).toHaveCount(1);
});

test('changing a control on the bar changes the figure', async ({ page }) => {
  await openStory(page, EMBEDDED);
  const dots = page.locator('g[data-layer="points"] circle');
  await expect(dots).toHaveCount(150);
  await expect(dots.first()).toHaveAttribute('r', '3.5');

  await page.getByRole('button', { name: 'Options', exact: true }).click();
  const bigger = page.getByRole('button', { name: 'Increase Dot size' });
  await bigger.click();
  await bigger.click();

  await expect(page.getByText('4.5px', { exact: true })).toHaveCount(1);
  await expect(dots).toHaveCount(150);
  await expect(dots.first()).toHaveAttribute('r', '4.5');
});
