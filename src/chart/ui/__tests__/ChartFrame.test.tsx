import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { ChartFrameProps, ChartPlotArea } from '../ChartFrame.tsx';
import { ChartFrame } from '../ChartFrame.tsx';

const TITLED = {
  width: 800,
  height: 400,
  x: { domain: [0, 10], label: 'PC 1 — 73.0 %' },
  y: { domain: [-1, 1], label: 'PC 2 — 22.9 %' },
} as const;

const BARE = {
  width: 800,
  height: 400,
  x: { domain: [0, 10] },
  y: { domain: [0, 10] },
} as const;

test('a titled 800 by 400 figure gives its data the rectangle it promised', () => {
  expect(plotOf(TITLED)).toStrictEqual({
    left: 58,
    top: 10,
    right: 788,
    bottom: 352,
    width: 730,
    height: 342,
  });
});

test('an axis with no title hands the words back to the plot', () => {
  expect(plotOf(BARE)).toStrictEqual({
    left: 42,
    top: 10,
    right: 788,
    bottom: 370,
    width: 746,
    height: 360,
  });
});

test('an axis with no ticks either keeps nothing back at all', () => {
  expect(
    plotOf({
      width: 800,
      height: 400,
      x: { domain: [0, 10], showTicks: false },
      y: { domain: [0, 10], showTicks: false },
    }),
  ).toStrictEqual({
    left: 10,
    top: 10,
    right: 788,
    bottom: 392,
    width: 778,
    height: 382,
  });
});

test('a figure measured in a collapsed panel draws nothing rather than throwing', () => {
  expect(plotOf({ ...BARE, width: 0, height: 0 })).toStrictEqual({
    left: 42,
    top: 10,
    right: 42,
    bottom: 10,
    width: 0,
    height: 0,
  });
});

test('the margins a caller insists on win over what the axes asked for', () => {
  expect(
    plotOf({ ...TITLED, margins: { left: 100, bottom: 60 } }),
  ).toStrictEqual({
    left: 100,
    top: 10,
    right: 788,
    bottom: 340,
    width: 688,
    height: 330,
  });
});

test('the clip is declared once and used once, under an id of its own', () => {
  const html = render(TITLED);
  const declared = /<clipPath id="(?<id>[^"]+)"/u.exec(html)?.groups?.id;

  expect(declared).toBeDefined();
  expect(html).toContain(`<clipPath id="${declared}">`);
  expect(html).toContain(`clip-path="url(#${declared})"`);
  expect(html.split(String(declared))).toHaveLength(3);
});

test('two figures on one page never share the clip that hides their overflow', () => {
  const html = renderToStaticMarkup(
    <>
      <ChartFrame {...TITLED}>{() => null}</ChartFrame>
      <ChartFrame {...TITLED}>{() => null}</ChartFrame>
    </>,
  );
  const ids = html.match(/<clipPath id="[^"]+"/gu) ?? [];

  expect(ids).toHaveLength(2);
  expect(ids[0]).not.toBe(ids[1]);
});

test('a named figure is read out; an unnamed one is decoration', () => {
  const named = render({ ...TITLED, label: 'Principal component map' });

  expect(named).toContain('role="img"');
  expect(named).toContain('aria-label="Principal component map"');
  expect(named).not.toContain('aria-hidden');

  const anonymous = render(TITLED);

  expect(anonymous).toContain('aria-hidden="true"');
  expect(anonymous).not.toContain('role="img"');
});

test('the floating chrome sits in a layer of its own, and only when there is any', () => {
  const withChrome = render({ ...TITLED, overlay: <span>Colour by</span> });

  expect(withChrome).toContain('class="overlay-layer"');
  expect(withChrome).toContain('<span>Colour by</span>');

  expect(render(TITLED)).not.toContain('overlay-layer');
});

test('the grid goes down before the marks and the axes come back over them', () => {
  const html = renderToStaticMarkup(
    <ChartFrame {...TITLED}>
      {() => <circle data-mark="point" cx="100" cy="100" r="3" />}
    </ChartFrame>,
  );
  const passes = html.split('class="chart-axis');

  expect(passes).toHaveLength(5);
  expect(passes[1]).not.toContain('<text ');
  expect(passes[2]).toContain('data-mark="point"');
  expect(passes[4]).toContain('<text ');
});

test('the wrapper carries the handle the end-to-end tests reach for', () => {
  expect(render({ ...TITLED, testId: 'pca-map' })).toContain(
    'data-testid="pca-map"',
  );
});

function render(props: Omit<ChartFrameProps, 'children'>): string {
  return renderToStaticMarkup(<ChartFrame {...props}>{() => null}</ChartFrame>);
}

function plotOf(
  props: Omit<ChartFrameProps, 'children'>,
): ChartPlotArea | undefined {
  let plot: ChartPlotArea | undefined;
  renderToStaticMarkup(
    <ChartFrame {...props}>
      {(frame) => {
        plot = frame.plot;
        return null;
      }}
    </ChartFrame>,
  );
  return plot;
}
