import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { categorySwatch } from '../src/periodic/core/categories.ts';
import { PERIODIC_ELEMENTS } from '../src/periodic/core/elements.ts';

import { openStory } from './story.ts';

// Read from the table itself, so an element added to it does not leave the
// spec behind.
const ELEMENT_COUNT = PERIODIC_ELEMENTS.length;

function cell(page: Page, symbol: string) {
  return page.getByTestId(`element-${symbol}`);
}

function table(page: Page) {
  return page.getByTestId('periodic-table');
}

test('the whole table is drawn, and every cell is a real button', async ({
  page,
}) => {
  await openStory(page, 'periodic-periodictable--picker');

  await expect(table(page).getByRole('button')).toHaveCount(ELEMENT_COUNT);
  await expect(cell(page, 'H')).toBeVisible();
  await expect(cell(page, 'Og')).toBeVisible();
  await expect(cell(page, 'Lr')).toBeVisible();
});

test('clicking a cell selects that element', async ({ page }) => {
  await openStory(page, 'periodic-periodictable--picker');
  await expect(page.getByText('Selected: C')).toBeVisible();

  await cell(page, 'Fe').click();

  await expect(page.getByText('Selected: Fe')).toBeVisible();
  await expect(cell(page, 'Fe')).toHaveAttribute('aria-pressed', 'true');
  await expect(cell(page, 'C')).toHaveAttribute('aria-pressed', 'false');
});

test('the arrow keys walk the grid, not the atomic number', async ({
  page,
}) => {
  await openStory(page, 'periodic-periodictable--picker');
  await cell(page, 'C').click();

  // Down is the cell underneath, which is silicon — carbon plus 18 protons
  // would be chromium.
  await page.keyboard.press('ArrowDown');
  await expect(page.getByText('Selected: Si')).toBeVisible();

  await page.keyboard.press('ArrowRight');
  await expect(page.getByText('Selected: P')).toBeVisible();

  await page.keyboard.press('ArrowUp');
  await expect(page.getByText('Selected: N')).toBeVisible();
});

test('the walk carries focus with it, so the next key continues from there', async ({
  page,
}) => {
  await openStory(page, 'periodic-periodictable--picker');
  await cell(page, 'Ne').click();

  // The end of a period continues at the start of the next one.
  await page.keyboard.press('ArrowRight');

  await expect(page.getByText('Selected: Na')).toBeVisible();
  await expect(cell(page, 'Na')).toBeFocused();
});

test('the walk stops at the edge of the table rather than wrapping', async ({
  page,
}) => {
  await openStory(page, 'periodic-periodictable--picker');
  await cell(page, 'H').click();

  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowUp');

  await expect(page.getByText('Selected: H')).toBeVisible();
});

test('a cell takes its family colour, and the legend names every family', async ({
  page,
}) => {
  await openStory(page, 'periodic-periodictable--picker');

  await expect(cell(page, 'Cl')).toHaveCSS(
    'background-color',
    rgb(categorySwatch('halogen').background),
  );
  await expect(cell(page, 'Fe')).toHaveCSS(
    'background-color',
    rgb(categorySwatch('transition-metal').background),
  );
  await expect(page.getByText('Alkali metal')).toBeVisible();
  await expect(page.getByText('Lanthanoid')).toBeVisible();
});

test('a property map colours the cells itself and writes the value in them', async ({
  page,
}) => {
  await openStory(page, 'periodic-periodictable--property-map');

  // Fluorine is the most electronegative element, so it takes the light end of
  // viridis; the family colours are gone entirely.
  await expect(cell(page, 'F')).toContainText('3.98');
  await expect(cell(page, 'F')).toHaveCSS('background-color', rgb('#b4de2c'));
  await expect(cell(page, 'Cl')).not.toHaveCSS(
    'background-color',
    rgb(categorySwatch('halogen').background),
  );
});

test('a header selects a whole run of the table', async ({ page }) => {
  await openStory(page, 'periodic-periodictable--property-map');

  await page.getByRole('button', { name: 'Period 3' }).click();
  await expect(page.getByText('Last header clicked: period 3')).toBeVisible();

  await page.getByRole('button', { name: 'Group 17' }).click();
  await expect(page.getByText('Last header clicked: group 17')).toBeVisible();
});

test('an element outside the shown set is dimmed, never removed', async ({
  page,
}) => {
  await openStory(page, 'periodic-periodictable--dimmed-selection');

  await expect(table(page).getByRole('button')).toHaveCount(ELEMENT_COUNT);
  await expect(cell(page, 'Fe')).toHaveCSS('opacity', '1');
  await expect(cell(page, 'C')).toHaveCSS('opacity', '0.28');
  await expect(cell(page, 'C')).toBeVisible();
});

/**
 * A hex colour as the browser reports a computed background.
 * @param hex - The colour, as `#rrggbb`.
 * @returns The same colour written `rgb(r, g, b)`.
 */
function rgb(hex: string): string {
  const channels: number[] = [];
  for (let offset = 1; offset < 7; offset += 2) {
    channels.push(Number.parseInt(hex.slice(offset, offset + 2), 16));
  }
  return `rgb(${channels.join(', ')})`;
}
