import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { Molecule3DTools } from '../../core/settings.ts';
import type { Molecule3DFullscreen } from '../Molecule3DToolbar.tsx';
import { Molecule3DToolbar } from '../Molecule3DToolbar.tsx';

function toolbar(
  fullscreen?: Molecule3DFullscreen,
  tools?: Partial<Molecule3DTools>,
): string {
  return renderToStaticMarkup(
    <Molecule3DToolbar
      tools={tools}
      fullscreen={fullscreen}
      measureKind={null}
      onMeasureKindChange={() => undefined}
      measurementCount={0}
      onClearMeasurements={() => undefined}
      spinning={false}
      onSpinningChange={() => undefined}
      onResetView={() => undefined}
    />,
  );
}

/**
 * The full screen button of a toolbar's markup.
 * @param html - The toolbar, rendered.
 * @returns The button's markup, or `undefined` when there is none.
 */
function fullscreenButton(html: string): string | undefined {
  return /<button[^>]*aria-label="Full screen"[^>]*>.*?<\/button>/.exec(
    html,
  )?.[0];
}

test('the full screen tool is offered beside the others', () => {
  const button = fullscreenButton(
    toolbar({ active: false, toggle: () => undefined }),
  );

  expect(button).toContain('data-icon="fullscreen"');
  expect(button).not.toContain('bp6-active');
});

test('while the canvas fills the screen the tool is pressed and shrinks it', () => {
  const button = fullscreenButton(
    toolbar({ active: true, toggle: () => undefined }),
  );

  expect(button).toContain('data-icon="minimize"');
  expect(button).toContain('bp6-active');
});

test('the tool is left out where the screen cannot be filled, or when turned off', () => {
  expect(fullscreenButton(toolbar())).toBeUndefined();
  expect(
    fullscreenButton(
      toolbar(
        { active: false, toggle: () => undefined },
        { fullscreen: false },
      ),
    ),
  ).toBeUndefined();
});
