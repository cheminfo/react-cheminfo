import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { Molecule3DExport } from '../Molecule3DExport.tsx';

function render(frameCount?: number): string {
  return renderToStaticMarkup(
    <Molecule3DExport
      getSize={() => ({ width: 400, height: 300 })}
      onExport={() => Promise.resolve()}
      onCopy={() => Promise.resolve('copied' as const)}
      frameCount={frameCount}
    />,
  );
}

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
