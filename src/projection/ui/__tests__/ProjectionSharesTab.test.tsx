import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { IRIS_PCA, IRIS_ROWS as rows } from '../../core/__tests__/iris.ts';
import { explainedShares, pcaResult } from '../../core/index.ts';
import { ProjectionSharesTab } from '../ProjectionSharesTab.tsx';

const result = pcaResult(IRIS_PCA, {
  rows,
  scaled: true,
});

test('every component is one bar carrying its own colour', () => {
  const html = render();

  expect(count(html, /data-component="/g)).toBe(4);
  expect(html).toContain('data-component="1"');
  expect(html).toContain('fill="#e69f00"');
  expect(html).toContain('fill="#56b4e9"');
  expect(html).toContain('fill="#4d4d4d"');
  expect(html).toContain('fill="#f0e442"');
});

test('the running total names itself at its own right-hand end', () => {
  const html = render();

  expect(html).toContain('Running total 100.0%');
  expect(count(html, /data-shares="total"/g)).toBe(1);
  expect(count(html, /<circle/g)).toBe(4);
  expect(html).not.toContain('Running total</');
});

test('the target is one dashed rule with a band over the components reaching it', () => {
  const html = render();

  expect(count(html, /data-shares="target"/g)).toBe(1);
  expect(html).toContain('stroke-dasharray="4 3"');
  expect(html).toContain('stroke="var(--border-strong)"');
});

test('a target of zero draws no marker at all', () => {
  const html = render(0);

  expect(count(html, /data-shares="target"/g)).toBe(0);
  expect(count(html, /data-component="/g)).toBe(4);
});

test('both axes are captioned in words rather than named after the maths', () => {
  const html = render();

  expect(html).toContain('Components, strongest first');
  expect(html).toContain('Share of the differences explained');
  expect(html).toContain('>PC1</text>');
  expect(html).toContain('>PC4</text>');
});

test('each name stands under its own bar, and the caption under the plot', () => {
  const html = render();

  // The names are written in HTML over the frame, from the plot it laid out:
  // 61 to 608 across four slots, under a foot at 329.
  expect(
    html.match(/<text x="[\d.]+" y="344"[^>]*>PC\d<\/text>/g)?.map(xOf),
  ).toStrictEqual([129.375, 266.125, 402.875, 539.625]);
  expect(
    html.match(/<rect data-component="\d"[^>]*>/g)?.map(centreOf),
  ).toStrictEqual([129.375, 266.125, 402.875, 539.625]);
  expect(html).toContain(
    '<text x="334.5" y="367" text-anchor="middle" style="fill:var(--text-muted);font-size:12px;font-weight:500;user-select:none">Components, strongest first</text>',
  );
});

test('the bars name themselves, so the figure carries no key of its own', () => {
  const html = render();

  // Every bar is written under itself in its own colour, so a key would be a
  // second place to look for what the marks already say.
  expect(count(html, /aria-pressed/g)).toBe(0);
  expect(html).not.toContain('Colour =');
  expect(html.toLowerCase()).not.toContain('reconstructed');
});

function render(target = 0.95): string {
  return renderToStaticMarkup(
    <ProjectionSharesTab
      result={result}
      shares={explainedShares(result.axes, { target })}
      width={620}
      height={380}
      testId="shares"
    />,
  );
}

function count(html: string, pattern: RegExp): number {
  return html.match(pattern)?.length ?? 0;
}

function xOf(element: string): number {
  return Number(/ x="(?<x>[\d.]+)"/.exec(element)?.groups?.x);
}

function centreOf(bar: string): number {
  const width = Number(/ width="(?<width>[\d.]+)"/.exec(bar)?.groups?.width);
  return xOf(bar) + width / 2;
}
