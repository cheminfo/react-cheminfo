import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { Molecule3DHelp } from '../Molecule3DHelp.tsx';

function rowsOf(html: string): string[] {
  const text = html
    .replaceAll('</span></div>', '\n')
    .replaceAll(/<\/(?:span|kbd)>/g, ' ')
    .replaceAll(/<[^>]+>/g, '');
  return text
    .split('\n')
    .map((row) => row.replaceAll(/\s+/g, ' ').trim())
    .filter((row) => row !== '' && !row.startsWith('Keys act'));
}

test('every gesture is listed with what it does, the roll included', () => {
  const html = renderToStaticMarkup(<Molecule3DHelp />);

  expect(rowsOf(html)).toStrictEqual([
    'Drag Rotate',
    'Shift + Ctrl + drag Rotate in the plane of the screen',
    'Q or E Rotate in the plane, while held',
    'Right-drag Move',
    'Ctrl + drag Move',
    'Scroll Zoom',
    'Shift + scroll Clip around the centre',
    'Click an atom Centre on it',
    'Click the background Centre on the molecule',
  ]);
  expect(html.match(/<kbd class="bp6-key">/g)).toHaveLength(6);
});
