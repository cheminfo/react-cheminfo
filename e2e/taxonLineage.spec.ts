import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

test('the principal ranks read as one breadcrumb, the leaf emphasised', async ({
  page,
}) => {
  await openStory(page, 'taxonomy-taxonlineage--default');
  const lineage = page.getByRole('navigation', { name: 'Lineage' });

  await expect(lineage.getByRole('listitem')).toHaveCount(9);
  await expect(lineage.getByRole('link')).toHaveText([
    'Eukaryota',
    'Fungi',
    'Ascomycota',
    'Eurotiomycetes',
    'Eurotiales',
    'Aspergillaceae',
    'Penicillium',
    'Penicillium chrysogenum',
    'Penicillium chrysogenum Wisconsin 54-1255',
  ]);

  const leaf = lineage.getByRole('link', {
    name: 'Penicillium chrysogenum Wisconsin 54-1255',
  });

  await expect(leaf).toHaveCSS('font-weight', '600');
  await expect(leaf.locator('i')).toHaveText('Penicillium chrysogenum');
  await expect(
    lineage.getByRole('link', { name: 'Aspergillaceae' }).locator('i'),
  ).toHaveCount(0);
  // The rank a screen reader hears takes no room on the page.
  await expect(lineage.locator('.taxon-lineage__spoken').first()).toHaveCSS(
    'position',
    'absolute',
  );
});

test('a plain click is taken over by the site', async ({ page }) => {
  await openStory(page, 'taxonomy-taxonlineage--default');

  await page.getByRole('link', { name: 'Fungi' }).click();

  await expect(page.getByTestId('followed')).toHaveText(
    'Followed: Fungi (4751)',
  );
  expect(new URL(page.url()).hash).toBe('');
});

test('with every rank shown, each label sits over its name', async ({
  page,
}) => {
  await openStory(page, 'taxonomy-taxonlineage--every-rank');
  const first = page.getByRole('listitem').first();
  const rank = await first.locator('.taxon-lineage__rank').boundingBox();
  const name = await first.locator('.taxon-lineage__name').boundingBox();
  if (rank === null || name === null) throw new Error('nothing is laid out');

  expect(rank.y + rank.height).toBeLessThanOrEqual(name.y + 1);
  await expect(page.getByRole('listitem')).toHaveCount(13);
  await expect(page.locator('[aria-current="page"]')).toHaveText(
    'Penicillium chrysogenum Wisconsin 54-1255',
  );
});
