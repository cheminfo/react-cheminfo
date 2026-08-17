import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { VIRIDIS_SCALE } from '../../core/scale.ts';
import { ColorScaleLegend } from '../ColorScaleLegend.tsx';

test('every stop of the scale becomes a stop of the gradient', () => {
  const html = renderToStaticMarkup(
    <ColorScaleLegend stops={VIRIDIS_SCALE} min={0} max={1} />,
  );

  for (const stop of VIRIDIS_SCALE) {
    expect(html).toContain(`stop-color="${stop}"`);
  }

  expect(html.match(/<stop /g)).toHaveLength(9);
  expect(html).toContain('offset="0"');
  expect(html).toContain('offset="1"');
  expect(html).toContain('offset="0.5"');
});

test('both ends of the range are written out', () => {
  const html = renderToStaticMarkup(
    <ColorScaleLegend stops={VIRIDIS_SCALE} min={0.5} max={1234.567_89} />,
  );

  expect(html).toContain('>0.5</span>');
  expect(html).toContain('>1234.568</span>');
});

test('the unit follows each end value, and the label is written before them', () => {
  const html = renderToStaticMarkup(
    <ColorScaleLegend
      stops={VIRIDIS_SCALE}
      min={1}
      max={10}
      unit="g/mol"
      label="Molar mass"
    />,
  );

  expect(html).toContain('>Molar mass</span>');
  expect(html).toContain('>1 g/mol</span>');
  expect(html).toContain('>10 g/mol</span>');
  expect(html).toContain('aria-label="Molar mass from 1 g/mol to 10 g/mol"');
});

test('with no label the scale still says what it is to a screen reader', () => {
  const html = renderToStaticMarkup(
    <ColorScaleLegend stops={VIRIDIS_SCALE} min={0} max={100} />,
  );

  expect(html).toContain('aria-label="Colour scale from 0 to 100"');
  expect(html).not.toContain('</span><span style="color:rgb(95 107 124)');
});

test('the caller may write the end values its own way', () => {
  const html = renderToStaticMarkup(
    <ColorScaleLegend
      stops={VIRIDIS_SCALE}
      min={1000}
      max={2_000_000}
      formatValue={(value) => `${value / 1000}k`}
    />,
  );

  expect(html).toContain('>1k</span>');
  expect(html).toContain('>2000k</span>');
});

test('a scale of one stop is still a bar, not a gradient with one end', () => {
  const html = renderToStaticMarkup(
    <ColorScaleLegend stops={['#2563eb']} min={0} max={1} />,
  );

  expect(html.match(/<stop /g)).toHaveLength(2);
  expect(html).toContain('offset="0"');
  expect(html).toContain('offset="1"');
});

test('an empty scale draws a neutral bar rather than throwing', () => {
  const html = renderToStaticMarkup(
    <ColorScaleLegend stops={[]} min={0} max={1} />,
  );

  expect(html).toContain('stop-color="#e4e8ee"');
  expect(html.match(/<stop /g)).toHaveLength(2);
});

test('the gradient the bar is filled with is the one the legend defines', () => {
  const html = renderToStaticMarkup(
    <ColorScaleLegend stops={VIRIDIS_SCALE} min={0} max={1} />,
  );
  const defined = /<linearGradient id="(?<id>[^"]+)"/.exec(html)?.groups?.id;

  expect(defined).toBeDefined();
  expect(html).toContain(`fill="url(#${String(defined)})"`);
});
