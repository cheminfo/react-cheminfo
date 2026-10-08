import { expect, test } from '@playwright/test';

import type { Molecule3DCamera } from '../src/molecule3d/core/camera.ts';
import { parseMolecule3DCamera } from '../src/molecule3d/core/camera.ts';

import { openStory } from './story.ts';

// molstar needs a real WebGL2 context, which headless Chromium only gets from
// the software renderer.
test.use({
  launchOptions: { args: ['--use-gl=angle', '--use-angle=swiftshader'] },
});

/** An open panel, never the tooltip of the button that opened it. */
const PANEL = '.bp6-popover:not(.bp6-tooltip)';

test('the surface is coloured by polarity and states its TPSA', async ({
  page,
}) => {
  // molstar's lazy chunk and a software-rendered surface outlast 30 s cold.
  test.setTimeout(120_000);
  const problems: string[] = [];
  page.on('console', (message) => {
    const text = message.text();
    if (text.includes('GL Driver Message')) return;
    if (message.type() === 'error') problems.push(text);
  });
  page.on('pageerror', (error) => {
    problems.push(error.message);
  });

  await openStory(page, 'molecule3d-moleculeviewer3d--polar-surface');

  await page.getByRole('button', { name: 'Mouse and keyboard' }).click();
  const help = page.getByTestId('molecule3d-help');
  await expect(
    help.getByText('Rotate in the plane of the screen', { exact: true }),
  ).toBeVisible();
  await help.screenshot({ path: 'test-results/molecule3d-help.png' });
  await page.keyboard.press('Escape');
  await expect(help).toHaveCount(0);

  await page.getByRole('button', { name: 'Display options' }).click();
  const options = page.locator(PANEL);

  await expect(options.getByTestId('molecule3d-tpsa-value')).toHaveText(
    'TPSA: 20.2 Å²',
  );
  await expect(options.getByTestId('molecule3d-polarity-legend')).toHaveText(
    'δ+δ−neutral',
  );
  await expect(options.getByTestId('molecule3d-surface-color')).toHaveCount(0);
  await page.screenshot({ path: 'test-results/molecule3d-polarity.png' });

  await options.getByText('Element', { exact: true }).click();
  await expect(options.getByTestId('molecule3d-tpsa-value')).toHaveCount(0);
  await expect(options.getByTestId('molecule3d-polarity-legend')).toHaveCount(
    0,
  );

  await options.getByText('Uniform', { exact: true }).click();

  // The picker is a popover inside the options popover: choosing a colour
  // must leave both open and reach the settings.
  await page
    .getByTestId('molecule3d-surface-color')
    .getByRole('button')
    .click();
  await page.getByTitle('#332288').click();
  await expect(page.locator('input[value="332288"]')).toHaveCount(1);
  await expect(page.getByText('Surface colour', { exact: true })).toBeVisible();

  expect(problems).toStrictEqual([]);
});

test('the options return to the defaults, the surface left on', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await openStory(page, 'molecule3d-moleculeviewer3d--surface-and-spin');

  await page.getByRole('button', { name: 'Display options' }).click();
  const options = page.locator(PANEL);
  const reset = options.getByTestId('molecule3d-reset-settings');
  await expect(reset).toBeDisabled();

  await options.getByText('Spacefill', { exact: true }).click();
  await options.getByText('Polarity', { exact: true }).click();
  await expect(reset).toBeEnabled();
  await options.screenshot({ path: 'test-results/molecule3d-reset.png' });

  await reset.click();
  await expect(reset).toBeDisabled();
  await expect(
    options.getByRole('radio', { name: 'Ball and stick' }),
  ).toHaveAttribute('aria-checked', 'true');
  // The surface is still drawn, so its controls stay live.
  await expect(options.getByRole('radio', { name: 'Uniform' })).toBeEnabled();
});

test('a hidden surface says why its options are greyed, and a copy is offered', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await openStory(page, 'molecule3d-moleculeviewer3d--default');
  await expect(page.locator('canvas').first()).toBeVisible({ timeout: 60_000 });

  await page.getByRole('button', { name: 'Display options' }).click();
  const options = page.locator(PANEL);
  const note = options.getByTestId('molecule3d-surface-off');
  await expect(note).toContainText('The surface is hidden.');
  await expect(options.getByRole('radio', { name: 'Polarity' })).toBeDisabled();
  await options.screenshot({ path: 'test-results/molecule3d-surface-off.png' });

  await note.getByRole('button', { name: 'Show it' }).click();
  await expect(note).toHaveCount(0);
  await expect(options.getByRole('radio', { name: 'Polarity' })).toBeEnabled();

  await page.getByRole('button', { name: 'Export image' }).click();
  const panel = page.locator(PANEL).filter({ hasText: 'Export image' });
  await panel.getByRole('button', { name: 'Copy' }).click();
  await expect(panel).toContainText('to the clipboard, as a PNG.', {
    timeout: 30_000,
  });
  await panel.screenshot({ path: 'test-results/molecule3d-copy.png' });
});

/** The camera the SharedCamera story opens on: a quarter turn about y. */
const QUARTER_TURN = [0, Math.SQRT1_2, 0, Math.SQRT1_2] as const;

test('a camera a link carries is the one the reopened viewer stands at', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await openStory(page, 'molecule3d-moleculeviewer3d--shared-camera');
  const canvas = page.locator('canvas').first();
  await expect(canvas).toBeVisible({ timeout: 60_000 });
  const readout = page.getByTestId('molecule3d-camera');
  const box = await canvas.boundingBox();
  if (box === null) throw new Error('the viewer drew no canvas');
  const centreX = box.x + box.width / 2;
  const centreY = box.y + box.height / 2;

  // A view nobody chose is never reported, however the scene settles.
  await page.waitForTimeout(1500);
  await expect(readout).toHaveText('—');

  await page.mouse.move(centreX, centreY);
  await page.mouse.down();
  // The trackball turns the model about a degree per pixel, so a short drag.
  await page.mouse.move(centreX + 12, centreY, { steps: 6 });
  await page.mouse.up();
  await expect(readout).not.toHaveText('—', { timeout: 10_000 });
  const left = cameraOf((await readout.textContent()) ?? '');
  // The link's quarter turn was applied when the model was framed, and the drag
  // then turned the model a little further.
  expect(agreement(left.rotation, QUARTER_TURN)).toBeGreaterThan(0.9);
  expect(agreement(left.rotation, QUARTER_TURN)).toBeLessThan(0.999);

  await page.getByRole('button', { name: 'Open the link' }).click();
  await expect(readout).toHaveText('—');
  await expect(canvas).toBeVisible({ timeout: 60_000 });

  // A zoom leaves the rotation alone, so the next report shows where the
  // reopened viewer stood: the reader's rotation, not a fresh framing.
  await page.mouse.move(centreX, centreY);
  await page.mouse.wheel(0, -200);
  await expect(readout).not.toHaveText('—', { timeout: 10_000 });
  const reopened = cameraOf((await readout.textContent()) ?? '');

  expect(agreement(reopened.rotation, left.rotation)).toBeGreaterThan(0.999);
  expect(reopened.zoom).not.toBe(left.zoom);
});

/**
 * The camera a readout prints.
 * @param text - What the readout shows.
 * @returns The camera.
 */
function cameraOf(text: string): Molecule3DCamera {
  const camera = parseMolecule3DCamera(text);
  if (camera === null) throw new Error(`not a camera: ${text}`);
  return camera;
}

/**
 * How closely two unit quaternions turn the model the same way: 1 when they
 * agree, whatever their sign, since q and -q are the same rotation.
 * @param first - One rotation.
 * @param second - The other.
 * @returns The absolute value of their dot product.
 */
function agreement(
  first: Molecule3DCamera['rotation'],
  second: Molecule3DCamera['rotation'],
): number {
  let dot = 0;
  for (let index = 0; index < 4; index++) {
    dot += (first[index] ?? 0) * (second[index] ?? 0);
  }
  return Math.abs(dot);
}
