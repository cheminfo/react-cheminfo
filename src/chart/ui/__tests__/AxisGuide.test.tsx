/**
 * The rule marking a place on the horizontal axis: standing on the value when
 * the window shows it, parked dashed on an edge with an arrow when it does not,
 * and labelled on whichever side keeps the words inside the plot.
 *
 * The plot runs from x 64 to x 584, and one unit of the axis is one pixel from
 * x 60, so a value of 100 stands at x 160.
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { plotRect } from '../../core/chartGeometry.ts';
import type { ChartScale } from '../../core/chartScale.ts';
import type { AxisGuideProps } from '../AxisGuide.tsx';
import { AxisGuide } from '../AxisGuide.tsx';

const plot = plotRect({ width: 600, height: 400 });
const xScale: ChartScale = { offset: 60, factor: 1 };

function draw(props: Partial<AxisGuideProps> & { value: number | null }) {
  return renderToStaticMarkup(
    <svg>
      <AxisGuide plot={plot} xScale={xScale} {...props} />
    </svg>,
  );
}

test('nothing is drawn when nothing is pointed at, or the value maps nowhere', () => {
  expect(draw({ value: null })).toBe('<svg></svg>');
  expect(draw({ value: Number.NaN })).toBe('<svg></svg>');
  expect(draw({ value: 3, xScale: { offset: 0, factor: Number.NaN } })).toBe(
    '<svg></svg>',
  );
});

test('a value in the window is marked by a solid rule standing on it', () => {
  const html = draw({ value: 100 });

  expect(html).toBe(
    '<svg><g pointer-events="none"><line x1="160" y1="10" x2="160" y2="362" ' +
      'stroke-width="1.5" style="stroke:var(--spectrum-highlight, #f97316)"></line></g></svg>',
  );
});

test('a value left of the window is parked dashed on the left edge, pointing out', () => {
  const html = draw({ value: -100, color: 'teal' });

  expect(html).toContain(
    '<line x1="64" y1="10" x2="64" y2="362" stroke-width="1.5" stroke-dasharray="4 3" style="stroke:teal">',
  );
  expect(html).toContain('<path d="M64 18L71 13L71 23Z" style="fill:teal">');
  expect(html).not.toContain('<text');
});

test('a value right of the window is parked on the right edge, its arrow the other way', () => {
  const html = draw({ value: 1000 });

  expect(html).toContain('x1="584"');
  expect(html).toContain('d="M584 18L577 13L577 23Z"');
});

test('a label runs right of the rule while it fits, and flips left near the edge', () => {
  const room = draw({ value: 100, label: 'MS2 456.7' });
  const edge = draw({ value: 500, label: 'scan 314' });

  expect(room).toContain('<text x="164" y="18" text-anchor="start"');
  expect(room).toContain('>MS2 456.7</text>');
  expect(edge).toContain('<text x="556" y="18" text-anchor="end"');
});

test('on a parked guide the label clears the arrow, on the side inside the plot', () => {
  const left = draw({ value: -5, label: 'MS2' });
  const right = draw({ value: 900, label: 'MS2' });

  expect(left).toContain('<text x="75" y="18" text-anchor="start"');
  expect(right).toContain('<text x="573" y="18" text-anchor="end"');
});
