import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { FixedPanelRow } from '../FixedPanelRow.tsx';

function row(collapsed: boolean, isOpen: boolean): string {
  return renderToStaticMarkup(
    <FixedPanelRow
      collapsed={collapsed}
      isOpen={isOpen}
      onOpenChange={() => undefined}
      view={<p>the chart</p>}
      panels={<p>the peaks</p>}
    />,
  );
}

test('with room the figure and the side share the row, and nothing covers it', () => {
  const markup = row(false, true);

  expect(markup).toContain('the chart');
  expect(markup).toContain('the peaks');
  expect(markup).not.toContain('panel-row');
});

test('a narrow window puts the panel on show over the figure', () => {
  expect(row(true, true)).toBe(
    '<div class="panel-row">' +
      '<div class="panel-row__view"><p>the chart</p></div>' +
      '<div class="panel-row__drawer"><p>the peaks</p></div>' +
      '</div>',
  );
});

test('with no panel on show a narrow window draws the figure alone', () => {
  expect(row(true, false)).toBe(
    '<div class="panel-row">' +
      '<div class="panel-row__view"><p>the chart</p></div>' +
      '</div>',
  );
});
