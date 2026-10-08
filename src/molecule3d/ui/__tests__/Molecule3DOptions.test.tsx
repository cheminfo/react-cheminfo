import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { DEFAULT_MOLECULE_3D_SETTINGS } from '../../core/settings.ts';
import { Molecule3DOptions } from '../Molecule3DOptions.tsx';

function resetButtonOf(html: string): string {
  const match =
    /<button[^>]*data-testid="molecule3d-reset-settings"[^>]*>/.exec(html);
  if (match === null) throw new Error('no reset button');
  return match[0];
}

function render(sizeFactor: number, showSurface = true): string {
  return renderToStaticMarkup(
    <Molecule3DOptions
      settings={{
        ...DEFAULT_MOLECULE_3D_SETTINGS,
        sizeFactor,
        showSurface,
      }}
      defaults={DEFAULT_MOLECULE_3D_SETTINGS}
      polarSurfaceArea={null}
      onChange={() => undefined}
    />,
  );
}

test('the reset button is off at the defaults, the surface toggle aside', () => {
  const html = render(1);

  expect(html).toContain('Reset to defaults');
  expect(resetButtonOf(html)).toContain('disabled');
});

test('the reset button is on once an option has moved', () => {
  expect(resetButtonOf(render(1.5))).not.toContain('disabled');
});

test('a hidden surface says why its settings are greyed, and offers it', () => {
  const off = render(1, false);

  expect(off).toContain('The surface is hidden.');
  expect(off).toContain('>Show it<');

  expect(render(1)).not.toContain('data-testid="molecule3d-surface-off"');
});

test('a greyed reset says it is already at the defaults', () => {
  expect(render(1)).toContain('title="Already at the defaults"');
  expect(render(1.5)).not.toContain('title="Already at the defaults"');
});
