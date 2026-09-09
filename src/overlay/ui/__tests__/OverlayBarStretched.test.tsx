import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { OverlayBar } from '../OverlayBar.tsx';
import { OverlayLayer } from '../OverlayLayer.tsx';

test('a stretched bar spans the figure in the flow, its two ends apart', () => {
  const html = renderToStaticMarkup(
    <OverlayLayer density="compact" width={900}>
      <OverlayBar placement="stretch" end={<span>Ellipses</span>}>
        <span>Views</span>
      </OverlayBar>
    </OverlayLayer>,
  );

  expect(html).toContain('position:relative;display:flex;width:100%');
  expect(html).toContain('justify-content:space-between');
  expect(html).toContain('gap:4px;padding:3px 6px');
  expect(html).toContain('<span>Views</span>');
  expect(html).toContain('<span>Ellipses</span>');
});

test('a stretched bar is chrome: a solid ground under a hairline, never faded', () => {
  const html = renderToStaticMarkup(
    <OverlayLayer awake={false}>
      <OverlayBar placement="stretch" restingOpacity={0.74}>
        <span>Views</span>
      </OverlayBar>
    </OverlayLayer>,
  );

  expect(html).toContain(
    'border-bottom:1px solid var(--border);background:var(--surface)',
  );
  expect(html).not.toContain('opacity:0.74');
  expect(html).not.toContain('backdrop-filter');
  expect(html).not.toContain('box-shadow');
});

test('a narrow stretched bar keeps its start and folds only its far end', () => {
  const html = renderToStaticMarkup(
    <OverlayLayer width={320}>
      <OverlayBar
        placement="stretch"
        end={<span>Ellipses</span>}
        info={<span>Explain</span>}
      >
        <span>Views</span>
      </OverlayBar>
    </OverlayLayer>,
  );

  expect(html).toContain('<span>Views</span>');
  expect(html).toContain('<span>Explain</span>');
  expect(html).not.toContain('<span>Ellipses</span>');
  expect(html.split('<button')).toHaveLength(2);
  expect(html).toContain('bp6-icon-cog');
});

test('a stretched bar with nothing to fold away carries no button', () => {
  const html = renderToStaticMarkup(
    <OverlayLayer width={320}>
      <OverlayBar placement="stretch" info={<span>Explain</span>}>
        <span>Views</span>
      </OverlayBar>
    </OverlayLayer>,
  );

  expect(html).not.toContain('<button');
  expect(html).toContain('<span>Views</span>');
  expect(html).toContain('<span>Explain</span>');
});

test('the end of a stretched bar is the named group, so the start can name itself', () => {
  const html = renderToStaticMarkup(
    <OverlayBar
      placement="stretch"
      label="Map options"
      more={<span>Dot size</span>}
    >
      <span>Views</span>
    </OverlayBar>,
  );

  expect(html).toContain('role="group" aria-label="Map options"');
  expect(html.indexOf('<span>Views</span>')).toBeLessThan(
    html.indexOf('role="group"'),
  );
});
