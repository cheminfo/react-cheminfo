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

test('every anchor stands on the strip where it sits', () => {
  const html = renderToStaticMarkup(
    <ColorScaleEditor value={SCALE} onChange={noop} />,
  );

  expect(html.match(/role="slider"[^>]*Position of anchor/g)).toHaveLength(3);
  expect(html).toContain('aria-valuenow="0.4"');
  expect(html).toContain('left:40%');
  expect(html).toContain('aria-label="Position of anchor 3"');
});

test('the saturation and the brightness are set for every anchor at once', () => {
  const html = renderToStaticMarkup(
    <ColorScaleEditor value={SCALE} onChange={noop} />,
  );

  expect(html).toContain('Saturation');
  expect(html).toContain('Brightness');
  expect(html.match(/100 %/g)).toHaveLength(2);
});

test('the first anchor is the one shown to set exactly, with one colour box', () => {
  const html = renderToStaticMarkup(
    <ColorScaleEditor value={SCALE} onChange={noop} />,
  );

  expect(html.match(/type="color"/g)).toHaveLength(1);
  expect(html).toContain('aria-label="Colour of anchor 1"');
  expect(html).toContain('value="#0000ff"');
  expect(html).toContain('aria-label="Remove anchor 1"');
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

  expect(
    html.match(/aria-label="Remove anchor 1"[^>]*disabled=""/g),
  ).toHaveLength(1);
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
});
