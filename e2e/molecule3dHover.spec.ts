import { expect, test } from '@playwright/test';

import { litScene, openViewer } from './highlightsStory.ts';
import { inkCores, inkOf } from './sceneInk.ts';

// molstar needs a real WebGL2 context, which headless Chromium only gets from
// the software renderer.
test.use({
  launchOptions: { args: ['--use-gl=angle', '--use-angle=swiftshader'] },
});

test('the atom under the pointer is reported, and none once it leaves the atoms', async ({
  page,
}) => {
  // molstar's lazy chunk and a software-rendered scene outlast 30 s cold.
  test.setTimeout(120_000);
  const { canvas, accent } = await openViewer(page);
  const on = await litScene(page, canvas, accent);
  // The story opens on the C–H row, so every lit atom is a hydrogen: H5 to H10.
  const top = inkCores(await inkOf(page, on, accent), 6)[0];
  if (top === undefined) throw new Error('no atom is lit');
  const readout = page.getByRole('status', { name: 'Atom under the pointer' });

  await expect(readout).toHaveText('none');

  // molstar reads the pointer off a picking buffer it draws when first asked,
  // so the pointer is nudged until the atom under it is reported.
  await expect(async () => {
    await page.mouse.move(on.left + top.x + 1, on.top + top.y);
    await page.mouse.move(on.left + top.x, on.top + top.y);
    await expect(readout).toHaveText(/^atom (?:[5-9]|10)$/, { timeout: 1000 });
  }).toPass({ timeout: 20_000 });

  const box = await canvas.boundingBox();
  if (box === null) throw new Error('the viewer drew no canvas');
  await page.mouse.move(box.x + box.width - 4, box.y + box.height - 4);

  await expect(readout).toHaveText('none');
});
