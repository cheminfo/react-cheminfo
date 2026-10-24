import { readFile } from 'node:fs/promises';

import { expect, test } from '@playwright/test';

import { openStory } from './story.ts';

// molstar needs a real WebGL2 context, which headless Chromium only gets from
// the software renderer.
test.use({
  launchOptions: { args: ['--use-gl=angle', '--use-angle=swiftshader'] },
});

/** An open panel, never the tooltip of the button that opened it. */
const PANEL = '.bp6-popover:not(.bp6-tooltip)';

test('a file of several frames plays, and saves as an animated PNG of every frame', async ({
  page,
}) => {
  // molstar's lazy chunk and twenty software-rendered frames outlast 30 s cold.
  test.setTimeout(120_000);
  await openStory(page, 'molecule3d-moleculeviewer3d--trajectory');
  const canvas = page.getByTestId('molecule3d').locator('canvas');
  await expect(canvas).toBeVisible({ timeout: 60_000 });

  // Playing: two pictures of the canvas a moment apart differ.
  await expect
    .poll(
      async () => {
        const first = await canvas.screenshot();
        await page.waitForTimeout(120);
        return first.equals(await canvas.screenshot());
      },
      { timeout: 30_000 },
    )
    .toBe(false);

  await page.getByRole('button', { name: 'Export image' }).click();
  const panel = page.locator(PANEL);
  await expect(
    panel.getByRole('radio', { name: 'All 20, animated' }),
  ).toBeChecked();

  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 90_000 }),
    panel.getByRole('button', { name: 'Save' }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('molecule.png');
  const bytes = await readFile(await download.path());
  // 0x89 P N G, then an animation control chunk naming 20 frames, played
  // forever, before the first image data.
  expect(bytes.subarray(1, 4).toString('latin1')).toBe('PNG');
  const control = bytes.indexOf('acTL', 0, 'latin1');
  expect(control).toBeGreaterThan(0);
  expect(control).toBeLessThan(bytes.indexOf('IDAT', 0, 'latin1'));
  expect(bytes.readUInt32BE(control + 4)).toBe(20);
  expect(bytes.readUInt32BE(control + 8)).toBe(0);

  // Read back by the browser's own decoder: twenty frames, looping, each the
  // molecule at its own step — the stretched one (frame 6, a quarter period
  // in) is not the one at rest, and the period closes on it.
  const decoded = await page.evaluate(readAnimation, bytes.toString('base64'));
  expect(decoded.frameCount).toBe(20);
  expect(decoded.repetitionCount).toBe(Infinity);
  const [atRest, stretched, closed] = decoded.digests;
  expect(stretched).not.toBe(atRest);
  expect(closed).toBe(atRest);
});

/**
 * Decode an animated PNG in the page, with the browser's own decoder.
 * @param base64 - The file.
 * @returns How many frames it holds, how often it repeats, and a digest of the
 * pixels of frames 1, 6 and 11.
 */
async function readAnimation(base64: string): Promise<{
  frameCount: number;
  repetitionCount: number;
  digests: string[];
}> {
  const data = Uint8Array.from(
    atob(base64),
    (char) => char.codePointAt(0) ?? 0,
  );
  const decoder = new ImageDecoder({ data, type: 'image/png' });
  await decoder.tracks.ready;
  const track = decoder.tracks.selectedTrack;
  const digests: string[] = [];
  for (const frameIndex of [0, 5, 10]) {
    // eslint-disable-next-line no-await-in-loop -- one decoder, one frame at a time
    const { image } = await decoder.decode({ frameIndex });
    const canvas = new OffscreenCanvas(image.displayWidth, image.displayHeight);
    const context = canvas.getContext('2d');
    if (context === null) throw new Error('no 2D context');
    context.drawImage(image, 0, 0);
    image.close();
    const { data: pixels } = context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height,
    );
    // eslint-disable-next-line no-await-in-loop -- digests in frame order
    const digest = await crypto.subtle.digest('SHA-256', pixels);
    digests.push(btoa(String.fromCodePoint(...new Uint8Array(digest))));
  }
  return {
    frameCount: track?.frameCount ?? 0,
    repetitionCount: track?.repetitionCount ?? 0,
    digests,
  };
}
