import type { Page } from '@playwright/test';

/**
 * Opens one story on its own, without the Storybook chrome around it, so a
 * selector in a spec only ever reaches the component under test.
 * @param page - The page to navigate.
 * @param id - The story's identifier, as `title-path--story-name`.
 * @param globals - The toolbar values to open it under, as `name:value` pairs.
 * @default globals ''
 */
export async function openStory(
  page: Page,
  id: string,
  globals = '',
): Promise<void> {
  await page.goto(`/iframe.html?viewMode=story&globals=${globals}&id=${id}`);
}
