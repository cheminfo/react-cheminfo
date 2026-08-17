import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

const DOI_URL = 'https://doi.org/10.1021/ci300563h';

// The accessible name of an entry is its label plus its hint, and `BibTeX`
// alone matches both the copy entry and the file below it.
const HTML_COPY = 'HTML Word, Docs, email';
const BIBTEX_COPY = 'BibTeX LaTeX';
const DOI_COPY = 'DOI link URL';
const RIS_FILE = 'RIS file Zotero, Mendeley, EndNote';

async function openCiteMenu(page: Page): Promise<void> {
  await openStory(page, 'citation-citebutton--default');
  await page.getByRole('button', { name: 'Cite', exact: true }).click();
  await expect(page.getByText('Copy the reference as')).toBeVisible();
}

/**
 * The clipboard, read once the entry says it holds the citation. The copy is
 * asynchronous, so reading on the click alone races the write and comes back
 * empty; the tick the entry shows is what says the write landed.
 * @param page - The page whose menu was just clicked.
 * @returns What the clipboard now holds, as plain text.
 */
async function copiedText(page: Page): Promise<string> {
  await expect(page.getByRole('menuitem', { name: /copied/ })).toBeVisible();
  return page.evaluate(() => navigator.clipboard.readText());
}

test('the menu opens on the work, at its DOI', async ({ page }) => {
  await openCiteMenu(page);

  const entry = page.getByRole('menuitem', {
    name: /J\. Chem\. Inf\. Model\./,
  });
  await expect(entry).toHaveAttribute('href', DOI_URL);
  await expect(entry).toHaveAttribute('target', '_blank');
});

test('a styled format holds the four journal styles', async ({ page }) => {
  await openCiteMenu(page);
  await page.getByRole('menuitem', { name: HTML_COPY }).hover();

  await expect(page.getByRole('menuitem', { name: 'ACS' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Nature' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'RSC' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Wiley' })).toBeVisible();
});

test('a style entry keeps its row on one line', async ({ page }) => {
  await openCiteMenu(page);
  await page.getByRole('menuitem', { name: HTML_COPY }).hover();

  // An entry carrying a preview tooltip is also a popover target, which
  // Blueprint turns into a block — stacking the icon, the name and the
  // journals. The inline rule that outranks it is what this asserts.
  await expect(page.getByRole('menuitem', { name: 'ACS' })).toHaveCSS(
    'display',
    'flex',
  );
});

test('copying a style puts the reference on the clipboard and says so', async ({
  page,
}) => {
  await openCiteMenu(page);
  await page.getByRole('menuitem', { name: HTML_COPY }).hover();
  await page.getByRole('menuitem', { name: 'ACS' }).click();

  // Both flavours go on: the plain one is what a plain editor receives, and it
  // is the styled line rather than the markup.
  const copied = await copiedText(page);
  expect(copied).toContain('Patiny, L.; Borel, A.');
  expect(copied).toContain('J. Chem. Inf. Model. 2013, 53, 1223–1228.');
  expect(copied).toContain(DOI_URL);
  expect(copied).not.toContain('<i>');
});

test('the DOI link copies exactly the resolvable address', async ({ page }) => {
  await openCiteMenu(page);
  await page.getByRole('menuitem', { name: DOI_COPY }).click();

  expect(await copiedText(page)).toBe(DOI_URL);
});

test('BibTeX copies an entry keyed on the first author and the year', async ({
  page,
}) => {
  await openCiteMenu(page);
  await page.getByRole('menuitem', { name: BIBTEX_COPY }).click();

  const copied = await copiedText(page);
  expect(copied.startsWith('@article{Patiny2013,')).toBe(true);
  expect(copied).toContain('doi = {10.1021/ci300563h}');
});

test('hovering an entry previews what it copies', async ({ page }) => {
  await openCiteMenu(page);
  await page.getByRole('menuitem', { name: BIBTEX_COPY }).hover();

  const preview = page.locator('.citation-preview');
  await expect(preview).toBeVisible();
  await expect(preview).toContainText('@article{Patiny2013,');
});

test('the compact button drops its text but keeps its label', async ({
  page,
}) => {
  await openStory(page, 'citation-citebutton--compact');
  const compact = page.getByRole('button', { name: 'Cite' });

  await expect(compact).toHaveText('');
  await expect(compact).toHaveAttribute('aria-label', 'Cite');
  await expect(compact).toHaveAttribute('title', 'Cite');

  await compact.click();
  await expect(page.getByText('Copy the reference as')).toBeVisible();
});

test('the label prop reaches the button and its accessible name', async ({
  page,
}) => {
  await openStory(page, 'citation-citebutton--custom-label');
  const button = page.getByRole('button', { name: 'Cite this work' });

  await expect(button).toHaveText('Cite this work');
});

test('saving the RIS file hands over what a reference manager imports', async ({
  page,
}) => {
  await openCiteMenu(page);

  const started = page.waitForEvent('download');
  await page.getByRole('menuitem', { name: RIS_FILE }).click();
  const download = await started;

  expect(download.suggestedFilename()).toBe('Patiny2013.ris');

  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(chunk as Buffer);
  const content = Buffer.concat(chunks).toString('utf8');

  expect(content.startsWith('TY  - JOUR')).toBe(true);
  expect(content).toContain('AU  - Patiny, L.');
  expect(content.trimEnd().endsWith('ER  -')).toBe(true);
});

const PLATFORM_DOI_URL = 'https://doi.org/10.2533/chimia.2025.66';

async function openWorksMenu(page: Page): Promise<void> {
  await openStory(page, 'citation-citebutton--several-works');
  await page.getByRole('button', { name: 'Cite', exact: true }).click();
  await expect(page.getByText('Please cite both works')).toBeVisible();
}

test('a site built on two works names each, and what citing it credits', async ({
  page,
}) => {
  await openWorksMenu(page);

  await expect(page.getByText('The calculator')).toBeVisible();
  await expect(
    page.getByText('Cite it for the masses and the isotopic distributions'),
  ).toBeVisible();
  await expect(page.getByText('The browser platform')).toBeVisible();
  await expect(page.getByText('Copy both references as')).toBeVisible();
});

test('a work opens its own article, and copies its own reference', async ({
  page,
}) => {
  await openWorksMenu(page);
  await page.getByRole('menuitem', { name: /The browser platform/ }).hover();

  // Blueprint renders a submenu inside the row that opens it, and the set below
  // the works offers the same formats — so the entry clicked has to be looked
  // up inside that row rather than in the menu at large.
  const submenu = page
    .locator('li.bp6-submenu')
    .filter({ hasText: 'The browser platform' });
  const article = submenu.getByRole('menuitem', { name: /Open the article/ });
  await expect(article).toHaveAttribute('href', PLATFORM_DOI_URL);

  await submenu.getByRole('menuitem', { name: BIBTEX_COPY }).click();

  const copied = await copiedText(page);
  expect(copied.startsWith('@article{Patiny2025,')).toBe(true);
  expect(copied).not.toContain('Vanderveen');
});

test('copying the set puts both references on the clipboard', async ({
  page,
}) => {
  await openWorksMenu(page);
  await page.getByRole('menuitem', { name: HTML_COPY }).hover();
  await page.getByRole('menuitem', { name: 'ACS' }).click();

  const copied = await copiedText(page);
  expect(copied).toContain('Patiny, L.; Borel, A.');
  expect(copied).toContain('Patiny, L. Unlocking the Potential');
  expect(copied).toContain(DOI_URL);
  expect(copied).toContain(PLATFORM_DOI_URL);
});

test('the saved file holds a record for every work', async ({ page }) => {
  await openWorksMenu(page);

  const started = page.waitForEvent('download');
  await page.getByRole('menuitem', { name: RIS_FILE }).click();
  const download = await started;

  expect(download.suggestedFilename()).toBe('references.ris');

  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(chunk as Buffer);
  const content = Buffer.concat(chunks).toString('utf8');

  expect(content.match(/^TY {2}- JOUR$/gm)).toHaveLength(2);
  expect(content).toContain('AU  - Borel, A.');
  expect(content).toContain('JO  - CHIMIA');
});
