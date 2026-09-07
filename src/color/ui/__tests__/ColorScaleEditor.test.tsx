import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { ColorScale } from '../../core/interpolate.ts';
import { ColorScaleEditor } from '../ColorScaleEditor.tsx';

const SCALE: ColorScale = {
  interpolation: 'hsv',
  stops: [
    { position: 0, color: '#0000ff' },
    { position: 0.4, color: '#00ff00' },
    { position: 1, color: '#ff0000' },
  ],
};

function noop(): void {
  // The editor is read here, never edited.
}

test('every anchor gets a colour, a position and a way out', () => {
  const html = renderToStaticMarkup(
    <ColorScaleEditor value={SCALE} onChange={noop} />,
  );

  expect(html.match(/type="color"/g)).toHaveLength(3);
  expect(html).toContain('value="#0000ff"');
  expect(html).toContain('value="0.4"');
  expect(html).toContain('aria-label="Remove anchor 2"');
  expect(html).toContain('0.40');
});

test('the path between two anchors is picked, and the one in force is selected', () => {
  const html = renderToStaticMarkup(
    <ColorScaleEditor value={SCALE} onChange={noop} />,
  );

  expect(html).toContain('HSV — turn the short way');
  expect(html).toContain('HSV — turn the long way');
  expect(html).toContain('RGB — mix the channels');
});

test('the last two anchors cannot be removed, because a scale needs both', () => {
  const html = renderToStaticMarkup(
    <ColorScaleEditor
      value={{
        interpolation: 'rgb',
        stops: [
          { position: 0, color: '#000000' },
          { position: 1, color: '#ffffff' },
        ],
      }}
      onChange={noop}
    />,
  );

  expect(html.match(/disabled=""/g)).toHaveLength(2);
});

test('a short hex is expanded, because a colour input reads nothing else', () => {
  const html = renderToStaticMarkup(
    <ColorScaleEditor
      value={{
        interpolation: 'rgb',
        stops: [
          { position: 0, color: '#f00' },
          { position: 1, color: '#00f' },
        ],
      }}
      onChange={noop}
    />,
  );

  expect(html).toContain('value="#ff0000"');
  expect(html).toContain('value="#0000ff"');
});
