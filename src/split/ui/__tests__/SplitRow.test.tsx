import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { SplitColumn } from '../SplitColumn.tsx';
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
  // A row is divided across, so the bar keeps the width rule and says nothing
  // about a direction.
  expect(markup).not.toContain('split-row--down');
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

test('a column divided by a share needs a height, and stacks where there is none', () => {
  // Rendered to a string there is no box to measure, so the fallback is the
  // viewport — and a page rendered to a string has none of that either, which
  // is the case a column must not collapse in.
  const markup = render(
    <SplitColumn
      ratio={40}
      defaultRatio={50}
      onRatio={ignore}
      start={<p>the viewer</p>}
      end={<p>the table</p>}
    />,
  );

  expect(markup).toContain('the viewer');
  expect(markup).toContain('the table');
  expect(markup).toContain('data-testid="split-start"');
});

test('a column that has a height to divide takes its share of it', () => {
  const previous = globalThis.innerHeight;
  Object.defineProperty(globalThis, 'innerHeight', {
    value: 900,
    configurable: true,
  });
  try {
    const markup = render(
      <SplitColumn
        ratio={40}
        defaultRatio={50}
        onRatio={ignore}
        start={<p>the viewer</p>}
        end={<p>the table</p>}
      />,
    );

    expect(markup).toContain('split-row');
    // And says which way it divides, because the seven pixels `chrome.css`
    // narrows the bar to are its height here and its width on a row. Reached
    // through the one class, a column's bar renders as a nub at the pane's
    // left edge rather than as a line across it.
    expect(markup).toContain('split-row split-row--down');
    // 40% of the column, written as the flex share react-science lays the
    // other pane out with: (100 - 40) / 40 * 100 = 150.
    expect(markup).toContain('flex:150 0 0%');
    expect(markup).toContain('padding-bottom:6px');
  } finally {
    Object.defineProperty(globalThis, 'innerHeight', {
      value: previous,
      configurable: true,
    });
  }
});
