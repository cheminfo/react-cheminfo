import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { Molecule3DFile } from '../../core/file.ts';
import { Molecule3DExport } from '../Molecule3DExport.tsx';

function render(frameCount?: number, molfile?: Molecule3DFile): string {
  return renderToStaticMarkup(
    <Molecule3DExport
      getSize={() => ({ width: 400, height: 300 })}
      onExport={() => Promise.resolve()}
      onCopy={() => Promise.resolve('copied' as const)}
      frameCount={frameCount}
      molfile={molfile}
    />,
  );
}

/** Three atoms, one bond each from the first: enough for a counts line. */
const MOLFILE = `water
  OCL

  3  2  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    0.9600    0.0000    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0
   -0.2400    0.9300    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  1  3  1  0  0  0  0
M  END
`;

test('a scene of several frames offers them all, as an animation, by default', () => {
  const html = render(20);

  expect(html).toContain('Frames');
  expect(html).toContain('>This one<');
  expect(html).toContain('>All 20, animated<');
  expect(html).toMatch(/aria-checked="true"[^>]*>All 20, animated</);
});

test('a still scene offers no choice of frames', () => {
  expect(render(1)).not.toContain('animated');
  expect(render()).not.toContain('animated');
});

test('a model offers its molfiles beside its pictures, and says so in the title', () => {
  const html = render(1, { format: 'mol', data: MOLFILE });

  expect(html).toContain('Export image or molfile');
  expect(html).toContain('>Molfile<');
  // The version is a row of its own, once a molfile is picked.
  expect(html).not.toContain('V2000<');
  // The picture stays what the panel opens on.
  expect(html).toMatch(/aria-checked="true"[^>]*>PNG</);
});

test('a file a molfile cannot say offers pictures alone', () => {
  const xyz = render(1, { format: 'xyz', data: '1\n\nO 0 0 0\n' });
  const frames = render(5, { format: 'mol', data: MOLFILE });

  for (const html of [xyz, frames, render()]) {
    expect(html).not.toContain('Molfile');
    expect(html).toContain('Export image');
    expect(html).not.toContain('or molfile');
  }
});
