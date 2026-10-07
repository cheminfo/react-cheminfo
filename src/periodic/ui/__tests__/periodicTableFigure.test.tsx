import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { PeriodicTable } from '../PeriodicTable.tsx';

test('the corner that takes the whole table stays off a print and out of a file', () => {
  const html = renderToStaticMarkup(
    <PeriodicTable headers onSelectAll={noop} onSelectRange={noop} />,
  );
  const corner = /<button[^>]*title="All elements"[^>]*>/u.exec(html)?.[0];
  const group = /<button[^>]*title="Group 18"[^>]*>/u.exec(html)?.[0];

  expect(corner).toContain('class="no-print"');
  expect(corner).toContain('data-figure="chrome"');
  // The numbers are labels a reader still needs on paper.
  expect(group).not.toContain('no-print');
  expect(group).not.toContain('data-figure');
});

test('the corner is out of sight until it is pointed at', () => {
  const html = renderToStaticMarkup(
    <PeriodicTable headers onSelectAll={noop} />,
  );
  const corner = /<button[^>]*title="All elements"[^>]*>/u.exec(html)?.[0];

  expect(corner).toContain('opacity:0');
});

test('the table is a figure drawn in HTML, saved from any box around it', () => {
  const html = renderToStaticMarkup(<PeriodicTable />);

  expect(html.startsWith('<div data-figure="html"')).toBe(true);
});

function noop(): void {
  // Nothing happens: these are rendered, never pressed.
}
