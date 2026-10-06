import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { SplitRow } from '../SplitRow.tsx';

function render(node: Parameters<typeof renderToStaticMarkup>[0]): string {
  return renderToStaticMarkup(node);
}

function ignore(): void {
  // The row is rendered to a string, so no drag is ever reported back.
}

test('a row with nothing in either pane draws nothing at all', () => {
  expect(
    render(
      <SplitRow
        ratio={null}
        defaultRatio={50}
        onRatio={ignore}
        start={null}
        end={null}
      />,
    ),
  ).toBe('');
});

test('a link that left one pane empty gives the other the whole width', () => {
  const markup = render(
    <SplitRow
      ratio={null}
      defaultRatio={42}
      onRatio={ignore}
      start={null}
      end={<p>the chart</p>}
    />,
  );

  expect(markup).toContain('the chart');
  expect(markup).not.toContain('split-start');
  // No splitter: there is nothing to divide.
  expect(markup).not.toContain('split-row');
});

test('a row the address divides is laid out at that share', () => {
  const markup = render(
    <SplitRow
      ratio={30}
      defaultRatio={42}
      onRatio={ignore}
      start={<p>the table</p>}
      end={<p>the chart</p>}
    />,
  );

  expect(markup).toContain('split-row');
  expect(markup).toContain('data-testid="split-start"');
  expect(markup).toContain('data-testid="split-end"');
  expect(markup).toContain('flex:100 0 0%');
});

test('a share no splitter could reach is brought back inside the range', () => {
  const markup = render(
    <SplitRow
      ratio={99}
      defaultRatio={42}
      onRatio={ignore}
      start={<p>a</p>}
      end={<p>b</p>}
    />,
  );

  // 80% of the row, written as the flex share react-science lays the other
  // side out with: (100 - 80) / 80 * 100 = 25.
  expect(markup).toContain('flex:25 0 0%');
});
