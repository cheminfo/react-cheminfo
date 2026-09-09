import { getNumbers } from 'ml-dataset-iris';
import { PCA } from 'ml-pca';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { explainedShares, pcaResult } from '../../core/index.ts';
import { ProjectionSharesTab } from '../ProjectionSharesTab.tsx';

const rows = getNumbers();
const result = pcaResult(new PCA(rows, { scale: true }), {
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
