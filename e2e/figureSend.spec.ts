import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

// The embedded viewer, whose bar carries the glyph that saves the figure.
const IRIS = 'projection-pcaviewer--iris';

/** A file as the stand-in sheet received it. */
interface SharedFile {
  name: string;
  type: string;
  /** Its first bytes: hexadecimal for a PNG, text for anything else. */
  head: string;
  /** Whether the press was still fresh when the sheet was asked for. */
  fresh: boolean | null;
}

/**
 * Stand in for the share sheet of a phone, which no headless browser has: it
 * takes PNG and SVG files, records what it is handed, and refuses the first
 * `refusals` calls the way a browser refuses a press that is no longer fresh.
 * @param page - The page, before it is opened.
 * @param refusals - How many calls to refuse.
 */
async function standInSheet(page: Page, refusals = 0): Promise<void> {
  await page.addInitScript((refuse: number) => {
    const shared: unknown[] = [];
    let refused = 0;
    Object.assign(globalThis, { sharedFiles: shared });
    Object.defineProperty(Navigator.prototype, 'canShare', {
      configurable: true,
      value: (data: ShareData) =>
        (data.files ?? []).every((file) =>
          ['image/png', 'image/svg+xml'].includes(file.type),
        ),
    });
    Object.defineProperty(Navigator.prototype, 'share', {
      configurable: true,
      value: async (data: ShareData) => {
        const activation = (
          navigator as { userActivation?: { isActive: boolean } }
        ).userActivation;
        const fresh = activation === undefined ? null : activation.isActive;
        if (refused < refuse) {
          refused += 1;
          throw new DOMException('Not allowed', 'NotAllowedError');
        }
        const files = await Promise.all(
          (data.files ?? []).map(async (file) => {
            const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
            const head =
              file.type === 'image/png'
                ? [...bytes]
                    .map((byte) => byte.toString(16).padStart(2, '0'))
                    .join('')
                : await file.slice(0, 200).text();
            return { name: file.name, type: file.type, head, fresh };
          }),
        );
        shared.push(...files);
      },
    });
  }, refusals);
}

async function sharedFiles(page: Page): Promise<SharedFile[]> {
  return page.evaluate(
    () => (globalThis as unknown as { sharedFiles: SharedFile[] }).sharedFiles,
  );
}

async function openPanel(page: Page): Promise<void> {
  await openStory(page, IRIS);
  await expect(page.locator('.chart-frame')).toHaveCount(1);
  await page
    .getByRole('button', { name: 'Save this figure — PNG', exact: true })
    .click();
  await expect(
    page.getByRole('group', { name: 'Save figure', exact: true }),
  ).toHaveCount(1);
}

const SEND = { name: 'Send', exact: true } as const;

test('a browser with no share sheet offers no send', async ({ page }) => {
  await page.addInitScript(() => {
    for (const name of ['share', 'canShare']) {
      Object.defineProperty(Navigator.prototype, name, {
        configurable: true,
        value: undefined,
      });
    }
  });
  await openPanel(page);

  await expect(
    page.getByRole('button', { name: 'Save', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('button', SEND)).toHaveCount(0);
});

test('send hands the PNG save would write to the share sheet', async ({
  page,
}) => {
  await standInSheet(page);
  await openPanel(page);

  await page.getByRole('button', SEND).click();

  await expect(
    page.getByText(/^Sent \d+ × \d+ pixels, as a PNG\.$/u),
  ).toBeVisible();
  const files = await sharedFiles(page);
  expect(files).toHaveLength(1);
  expect(files[0]).toMatchObject({
    name: 'projection-map.png',
    type: 'image/png',
    head: '89504e470d0a1a0a',
  });
});

test('send hands over the SVG, with a type the sheet accepts', async ({
  page,
}) => {
  await standInSheet(page);
  await openPanel(page);
  await page.getByRole('radio', { name: 'SVG' }).click();

  await page.getByRole('button', SEND).click();

  await expect(
    page.getByText(
      'Sent as an SVG, which a chat app passes on as a file, untouched.',
    ),
  ).toBeVisible();
  const files = await sharedFiles(page);
  expect(files).toHaveLength(1);
  expect(files[0]).toMatchObject({
    name: 'projection-map.svg',
    type: 'image/svg+xml',
  });
  expect(files[0]?.head).toMatch(/^<\?xml[^>]*\?>\s*<svg\b/u);
});

test('a press gone stale keeps the file, and the next press shares it while fresh', async ({
  page,
}) => {
  await standInSheet(page, 1);
  await openPanel(page);

  await page.getByRole('button', SEND).click();
  await expect(
    page.getByText(
      'The file is ready. Press Send again to choose where it goes.',
    ),
  ).toBeVisible();
  expect(await sharedFiles(page)).toHaveLength(0);

  await page.getByRole('button', SEND).click();

  await expect(
    page.getByText(/^Sent \d+ × \d+ pixels, as a PNG\.$/u),
  ).toBeVisible();
  const files = await sharedFiles(page);
  expect(files).toHaveLength(1);
  // The kept file goes inside the press itself, which is what an older
  // Safari demands.
  expect(files[0]?.fresh).toBe(true);
});
