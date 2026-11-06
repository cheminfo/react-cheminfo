import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { PanelRow } from '../PanelRow.tsx';

function row(collapsed: boolean, panels: string | null): string {
  return renderToStaticMarkup(
    <PanelRow
      collapsed={collapsed}
      ratio={null}
      defaultRatio={72}
      onRatio={() => undefined}
      view={<p>the figure</p>}
      panels={panels === null ? null : <p>{panels}</p>}
    />,
  );
}

test('with room the figure and the panels are divided by a splitter', () => {
  const markup = row(false, 'a panel');

  expect(markup).toContain('class="split-row"');
  expect(markup).toContain('data-testid="split-start"');
  expect(markup).toContain('data-testid="split-end"');
  expect(markup).not.toContain('panel-row__drawer');
});

test('a narrow window puts the panel over the figure, with no splitter', () => {
  const markup = row(true, 'a panel');

  expect(markup).toBe(
    '<div class="panel-row">' +
      '<div class="panel-row__view"><p>the figure</p></div>' +
      '<div class="panel-row__drawer"><p>a panel</p></div>' +
      '</div>',
  );
});

test('with no panel to show the figure has the row, however wide the window', () => {
  const figureAlone =
    '<div class="panel-row">' +
    '<div class="panel-row__view"><p>the figure</p></div>' +
    '</div>';

  expect(row(true, null)).toBe(figureAlone);
  expect(row(false, null)).toBe(figureAlone);
});
