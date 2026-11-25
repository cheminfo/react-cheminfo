import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

test('a decimal typed into the box stays typed, and the page reads it', async ({
  page,
}) => {
  await openStory(page, 'number-numberinput--default');
  const box = page.getByRole('textbox', { name: 'Concentration' });

  await box.click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type('0.2');

  await expect(box).toHaveValue('0.2');
  await expect(page.getByTestId('held')).toHaveText('0.2');
});

test('the bounds wait until the box is left', async ({ page }) => {
  await openStory(page, 'number-numberinput--whole-numbers');
  const box = page.getByRole('textbox', { name: 'Concentration' });

  await box.click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type('1');
  await expect(box).toHaveValue('1');

  await page.keyboard.type('5');
  await box.blur();
  await expect(box).toHaveValue('15');
});

test('a unit and a grip sit on the typed value’s line, in its type, in all three sizes', async ({
  page,
}) => {
  await openStory(page, 'number-numberinput--with-units');
  await expect(page.getByTestId('length-large')).toBeVisible();

  const rows = () =>
    Promise.all(
      SIZES.map((size) =>
        page.getByTestId(`length-${size}`).evaluate((input, name) => {
          const group = input.closest('.bp6-input-group');
          const unit = group?.querySelector('.bp6-input-action > *');
          const grip = group?.querySelector('.bp6-input-left-container > *');
          if (!group || !unit || !grip) return { size: name, found: false };
          const field = input.getBoundingClientRect();
          const unitBox = unit.getBoundingClientRect();
          const gripBox = grip.getBoundingClientRect();
          const line = field.top + field.height / 2;
          return {
            size: name,
            found: true,
            groupHugsField:
              group.getBoundingClientRect().height === field.height,
            unitOffset: unitBox.top + unitBox.height / 2 - line,
            gripOffset: gripBox.top + gripBox.height / 2 - line,
            sameType:
              globalThis.getComputedStyle(unit).fontSize ===
              globalThis.getComputedStyle(input).fontSize,
          };
        }, size),
      ),
    );

  const level = { found: true, groupHugsField: true, unitOffset: 0 };
  // Read again until it holds, as a story drawn twice replaces its boxes.
  await expect.poll(rows).toStrictEqual([
    { size: 'small', ...level, gripOffset: 0, sameType: true },
    { size: 'medium', ...level, gripOffset: 0, sameType: true },
    { size: 'large', ...level, gripOffset: 0, sameType: true },
  ]);
});

/** The three sizes a box comes in, as the story draws them. */
const SIZES = ['small', 'medium', 'large'] as const;
