import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { colorAt } from '../../core/interpolate.ts';
import { VIRIDIS_COLORS } from '../../core/scaleData.ts';
import { resolveColorScale } from '../../core/scaleText.ts';
import { ColorScaleLegend } from '../ColorScaleLegend.tsx';

test('every colour of a plain list becomes a stop of the gradient', () => {
  const html = renderToStaticMarkup(
    <ColorScaleLegend scale={VIRIDIS_COLORS} min={0} max={1} />,
  );

  for (const stop of VIRIDIS_COLORS) {
    expect(html).toContain(`stop-color="${stop}"`);
  }

  expect(html.match(/<stop /g)).toHaveLength(9);
  expect(html).toContain('offset="0"');
  expect(html).toContain('offset="1"');
  expect(html).toContain('offset="0.5"');
});

test('a scale from the registry draws the same stops as its list of colours', () => {
  const fromList = renderToStaticMarkup(
    <ColorScaleLegend scale={VIRIDIS_COLORS} min={0} max={1} />,
  );
  const fromRegistry = renderToStaticMarkup(
    <ColorScaleLegend
      scale={resolveColorScale('viridis').scale}
      min={0}
      max={1}
    />,
  );

  expect(stopsOf(fromRegistry)).toStrictEqual(stopsOf(fromList));
});

test('anchors that are not evenly spread keep their positions', () => {
  const html = renderToStaticMarkup(
    <ColorScaleLegend
      scale={{
        interpolation: 'rgb',
        stops: [
          { position: 0, color: '#000000' },
          { position: 0.8, color: '#ffffff' },
        ],
      }}
      min={0}
      max={1}
    />,
  );

  expect(stopsOf(html)).toStrictEqual(['0:#000000', '0.8:#ffffff']);
});

test('a scale that turns around the wheel is sampled rather than cut across', () => {
  const rainbow = resolveColorScale('rainbow').scale;
  const html = renderToStaticMarkup(
    <ColorScaleLegend scale={rainbow} min={0} max={1} />,
  );
  const stops = stopsOf(html);

  expect(stops).toHaveLength(24);
  expect(stops[0]).toBe('0:#0000ff');
  expect(stops[8]).toBe(`${String(8 / 23)}:${colorAt(rainbow, 8 / 23)}`);
  expect(stops[12]).toBe(`${String(12 / 23)}:${colorAt(rainbow, 12 / 23)}`);
  expect(stops.at(-1)).toBe('1:#ff0000');
});

test('both ends of the range are written out', () => {
  const html = renderToStaticMarkup(
    <ColorScaleLegend scale={VIRIDIS_COLORS} min={0.5} max={1234.567_89} />,
  );

  expect(html).toContain('>0.5</span>');
  expect(html).toContain('>1234.568</span>');
});

test('the unit follows each end value, and the label is written before them', () => {
  const html = renderToStaticMarkup(
    <ColorScaleLegend
      scale={VIRIDIS_COLORS}
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
    <ColorScaleLegend scale={VIRIDIS_COLORS} min={0} max={100} />,
  );

  expect(html).toContain('aria-label="Colour scale from 0 to 100"');
  expect(html).not.toContain('--text-muted');
});

test('the caller may write the end values its own way', () => {
  const html = renderToStaticMarkup(
    <ColorScaleLegend
      scale={VIRIDIS_COLORS}
      min={1000}
      max={2_000_000}
      formatValue={(value) => `${value / 1000}k`}
    />,
  );

  expect(html).toContain('>1k</span>');
  expect(html).toContain('>2000k</span>');
});

test('a scale of one colour is still a bar, not a gradient with one end', () => {
  const html = renderToStaticMarkup(
    <ColorScaleLegend scale={['#2563eb']} min={0} max={1} />,
  );

  expect(stopsOf(html)).toStrictEqual(['0:#2563eb', '1:#2563eb']);
});

test('an empty scale draws a bar in the border grey rather than throwing', () => {
  const html = renderToStaticMarkup(
    <ColorScaleLegend scale={[]} min={0} max={1} />,
  );

  expect(html).not.toContain('<stop');
  expect(html).toContain('style="fill:var(--border, #dfe3e8)"');
});

test('the gradient the bar is filled with is the one the legend defines', () => {
  const html = renderToStaticMarkup(
    <ColorScaleLegend scale={VIRIDIS_COLORS} min={0} max={1} />,
  );
  const defined = /<linearGradient id="(?<id>[^"]+)"/.exec(html)?.groups?.id;

  expect(defined).toBeDefined();
  expect(html).toContain(`fill="url(#${String(defined)})"`);
});

function stopsOf(html: string): string[] {
  const stops: string[] = [];
  for (const match of html.matchAll(
    /<stop offset="(?<offset>[^"]+)" stop-color="(?<color>[^"]+)"/g,
  )) {
    stops.push(`${match.groups?.offset}:${match.groups?.color}`);
  }
  return stops;
}
