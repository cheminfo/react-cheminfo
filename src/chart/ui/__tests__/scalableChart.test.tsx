import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { BinChart } from '../BinChart.tsx';

const SERIES = {
  edges: Float64Array.from([0, 10, 20, 30, 40]),
  counts: Uint32Array.from([5, 0, 100, 1]),
};

/**
 * The wrapper's style and the drawing's size attributes of a chart's markup.
 * @param markup - The chart, rendered.
 * @returns The wrapper's style, the drawing's width, height and view box.
 */
function frameOf(markup: string): Array<string | undefined> {
  const wrapper = /<div class="chart-frame" style="(?<style>[^"]*)"/.exec(
    markup,
  )?.groups?.style;
  const svg = /<svg (?<attributes>[^>]*)>/.exec(markup)?.groups?.attributes;
  const size = (name: string) =>
    new RegExp(String.raw`\b${name}="(?<value>[^"]*)"`).exec(svg ?? '')?.groups
      ?.value;
  return [wrapper, size('width'), size('height'), size('viewBox')];
}

test('a still chart that scales keeps its proportions and is never wider than its width; one that does not is drawn at its size', () => {
  const x = { label: 'Diameter (nm)' };

  expect([
    frameOf(
      renderToStaticMarkup(
        <BinChart series={SERIES} width={640} height={160} x={x} scalable />,
      ),
    ),
    frameOf(
      renderToStaticMarkup(
        <BinChart series={SERIES} width={640} height={160} x={x} />,
      ),
    ),
  ]).toStrictEqual([
    [
      'position:relative;width:100%;max-width:640px;aspect-ratio:640 / 160',
      '100%',
      '100%',
      '0 0 640 160',
    ],
    ['position:relative;width:640px;height:160px', '640', '160', undefined],
  ]);
});
