import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { chartScale } from '../../../chart/core/index.ts';
import type { ScatterEllipseLayerProps } from '../ScatterEllipseLayer.tsx';
import { ScatterEllipseLayer } from '../ScatterEllipseLayer.tsx';

/*
 * A cloud that is a circle in data units and a pair of points on a line, so
 * that one group exercises the projection and the other the degenerate case.
 */
const ROUND = { x: [1, 3, 2, 2], y: [1, 1, 2, 0] };
const PAIR = { x: [5, 6], y: [5, 6] };

const CLOUD = {
  x: [...ROUND.x, ...PAIR.x],
  y: [...ROUND.y, ...PAIR.y],
  groupOf: [0, 0, 0, 0, 1, 1],
  colors: ['var(--text)', 'var(--text-muted)'],
  scaleX: chartScale(0, 10, 0, 400),
  scaleY: chartScale(0, 10, 300, 0),
  size: { kind: 'standardDeviations', standardDeviations: 1 },
} as const satisfies ScatterEllipseLayerProps;

test('a group of two says more about the sample than the group, so it is left out', () => {
  const html = renderToStaticMarkup(<ScatterEllipseLayer {...CLOUD} />);

  expect(occurrences(html, '<ellipse')).toBe(1);
  expect(occurrences(html, '<line')).toBe(0);
});

test('asked for it anyway, a collinear group is a segment and never an ellipse', () => {
  const html = renderToStaticMarkup(
    <ScatterEllipseLayer {...CLOUD} minimumPoints={2} />,
  );

  expect(occurrences(html, '<line')).toBe(1);
  expect(occurrences(html, '<ellipse')).toBe(1);
  expect(html).toContain('<line data-group="1"');
});

test('a circle in the data is an ellipse on a plot whose axes disagree', () => {
  const html = renderToStaticMarkup(<ScatterEllipseLayer {...CLOUD} />);

  expect(html).toContain('cx="80"');
  expect(html).toContain('cy="270"');
  expect(html).toContain('rx="32.66"');
  expect(html).toContain('ry="24.49"');
  expect(html).toContain('transform="rotate(0 80 270)"');
});

test('an outline is a translucent region and nothing else, with no boundary drawn', () => {
  const html = renderToStaticMarkup(<ScatterEllipseLayer {...CLOUD} />);
  const region = html.slice(html.indexOf('<ellipse'), html.indexOf('</g>'));

  expect(region).toContain('fill="var(--text)"');
  expect(region).toContain('fill-opacity="0.1"');
  expect(region).not.toContain('stroke');
});

test('a caller drawing many groups can turn the fill down', () => {
  const faint = renderToStaticMarkup(
    <ScatterEllipseLayer {...CLOUD} fillOpacity={0.04} />,
  );

  expect(faint).toContain('fill-opacity="0.04"');
});

test('a collinear group has no area to fill, so its segment is stroked instead', () => {
  const html = renderToStaticMarkup(
    <ScatterEllipseLayer {...CLOUD} minimumPoints={2} />,
  );
  const line = html.slice(html.indexOf('<line'));

  expect(line).toContain('fill="none"');
  expect(line).not.toContain('fill-opacity');
  expect(line).toContain('stroke="var(--text-muted)"');
  expect(line).toContain('stroke-width="1.5"');
});

test('a muted group keeps its outline and loses its weight', () => {
  const html = renderToStaticMarkup(
    <ScatterEllipseLayer {...CLOUD} opacities={[0.2, 1]} />,
  );

  expect(occurrences(html, '<ellipse')).toBe(1);
  expect(html).toContain('opacity="0.2"');
});

test('a group nobody belongs to is skipped rather than drawn empty', () => {
  const html = renderToStaticMarkup(
    <ScatterEllipseLayer
      {...CLOUD}
      colors={['var(--text)', 'var(--text-muted)', 'var(--text-faint)']}
    />,
  );

  expect(occurrences(html, '<ellipse')).toBe(1);
  expect(html).toContain('<g data-layer="ellipses">');
});

function occurrences(html: string, needle: string): number {
  return html.split(needle).length - 1;
}
