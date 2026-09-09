import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { overlayMetrics } from '../../core/index.ts';
import { OverlayBar } from '../OverlayBar.tsx';
import { OverlayLayer } from '../OverlayLayer.tsx';
import { overlayCardStyle } from '../overlayStyles.ts';
import { useCoarsePointer, useOverlaySurface } from '../overlaySurface.ts';

test('a resting card fades its ground to three quarters, never its text', () => {
  const html = renderToStaticMarkup(
    <OverlayLayer awake={false}>
      <OverlayBar label="Map options">
        <span>Colour by</span>
      </OverlayBar>
    </OverlayLayer>,
  );

  expect(html).toContain('opacity:0.74');
  expect(html).toContain('<span>Colour by</span>');
});

test('a card with no layer above it is awake, so it is never stuck faded', () => {
  const html = renderToStaticMarkup(
    <OverlayBar label="Map options">
      <span>Colour by</span>
    </OverlayBar>,
  );

  expect(html).toContain('opacity:1');
  expect(html).not.toContain('opacity:0.74');
});

test('the strip is a named group, so a reader arriving by tab is told what it is', () => {
  const html = renderToStaticMarkup(
    <OverlayBar label="Map options">
      <span>Colour by</span>
    </OverlayBar>,
  );

  expect(html).toContain('role="group"');
  expect(html).toContain('aria-label="Map options"');
});

test('a placement puts the card in the corner it names', () => {
  const html = renderToStaticMarkup(
    <OverlayBar placement="bottom-left">
      <span>Colour by</span>
    </OverlayBar>,
  );

  expect(html).toContain('position:absolute;bottom:8px;left:8px');
});

test('a folded card is one button, and the controls are behind it', () => {
  const html = renderToStaticMarkup(
    <OverlayBar collapsed label="Map options" more={<span>Dot size</span>}>
      <span>Colour by</span>
    </OverlayBar>,
  );

  expect(html.split('<button')).toHaveLength(2);
  expect(html).toContain('bp6-icon-cog');
  expect(html).toContain('aria-label="Map options"');
  expect(html).not.toContain('Colour by');
  expect(html).not.toContain('Dot size');
});

test('a bar with a second tier and nothing in the strip still opens it', () => {
  const html = renderToStaticMarkup(
    <OverlayBar more={<span>Dot size</span>}>{null}</OverlayBar>,
  );

  expect(html.split('<button')).toHaveLength(2);
  expect(html).toContain('bp6-icon-cog');
});

test('a bar with nothing behind it carries no button at all', () => {
  const html = renderToStaticMarkup(
    <OverlayBar>
      <span>Colour by</span>
    </OverlayBar>,
  );

  expect(html).not.toContain('<button');
  expect(html).toContain('<span>Colour by</span>');
});

test('a figure narrower than the breakpoint folds the bar by itself', () => {
  const html = renderToStaticMarkup(
    <OverlayLayer width={320}>
      <OverlayBar>
        <span>Colour by</span>
      </OverlayBar>
    </OverlayLayer>,
  );

  expect(html.split('<button')).toHaveLength(2);
  expect(html).not.toContain('Colour by');
});

test('a figure that has not been measured stays expanded rather than flickering', () => {
  const html = renderToStaticMarkup(
    <OverlayLayer width={0}>
      <OverlayBar>
        <span>Colour by</span>
      </OverlayBar>
    </OverlayLayer>,
  );

  expect(html).toContain('<span>Colour by</span>');
  expect(html).not.toContain('<button');
});

test('a bar may be asked to start folded', () => {
  const html = renderToStaticMarkup(
    <OverlayBar defaultCollapsed>
      <span>Colour by</span>
    </OverlayBar>,
  );

  expect(html.split('<button')).toHaveLength(2);
});

test('a resting opacity is floored, so no card fades to a ghost', () => {
  const html = renderToStaticMarkup(
    <OverlayLayer awake={false}>
      <OverlayBar restingOpacity={0.15}>
        <span>Colour by</span>
      </OverlayBar>
    </OverlayLayer>,
  );

  expect(html).toContain('opacity:0.6');
});

test('a bar about to be screenshotted pins its ground at full strength', () => {
  const html = renderToStaticMarkup(
    <OverlayLayer awake={false}>
      <OverlayBar restingOpacity={1}>
        <span>Colour by</span>
      </OverlayBar>
    </OverlayLayer>,
  );

  expect(html).toContain('opacity:1;transition');
});

test('a repainting figure costs the card its blur, not its ground', () => {
  const html = renderToStaticMarkup(
    <OverlayLayer busy>
      <OverlayBar>
        <span>Colour by</span>
      </OverlayBar>
    </OverlayLayer>,
  );

  expect(html).not.toContain('backdrop-filter');
  expect(html).toContain('background:var(--surface)');
});

test('the layer lets every pointer event through and the card takes it back', () => {
  const html = renderToStaticMarkup(
    <OverlayLayer className="map-chrome">
      <OverlayBar testId="map-options">
        <span>Colour by</span>
      </OverlayBar>
    </OverlayLayer>,
  );

  expect(html).toContain('class="overlay-layer map-chrome"');
  expect(html).toContain('pointer-events:none;overflow:hidden');
  expect(html).toContain('pointer-events:auto');
  expect(html).toContain('data-testid="map-options"');
});

test('a compact layer packs every card inside it more tightly', () => {
  const html = renderToStaticMarkup(
    <OverlayLayer density="compact">
      <OverlayBar>
        <span>Colour by</span>
      </OverlayBar>
    </OverlayLayer>,
  );

  expect(html).toContain('gap:4px;padding:3px 6px');
});

test('a control with no layer above it still has measurements to draw from', () => {
  function Probe() {
    const { metrics, awake, busy, width, pointer } = useOverlaySurface();
    return (
      <output>{`${metrics.controlHeight} ${awake} ${busy} ${width} ${pointer}`}</output>
    );
  }

  expect(renderToStaticMarkup(<Probe />)).toBe(
    '<output>30 true false 0 fine</output>',
  );
});

test('a page with no matchMedia reads as a mouse rather than throwing', () => {
  function Probe() {
    return <output>{String(useCoarsePointer())}</output>;
  }

  expect(renderToStaticMarkup(<Probe />)).toBe('<output>false</output>');
});

test('a docked card holds its own ground rather than letting it cover the figure', () => {
  // The ground is absolutely positioned inside the card. A `static` card would
  // send it to the nearest positioned ancestor — the whole figure — where it
  // paints an opaque rectangle over the picture that nothing can hit-test,
  // because the ground takes no pointer events.
  for (const placement of ['above', 'below', 'stretch'] as const) {
    const style = overlayCardStyle(placement, overlayMetrics('comfortable'));

    expect(style.position).toBe('relative');
  }

  for (const placement of [
    'top-left',
    'top-right',
    'bottom-left',
    'bottom-right',
  ] as const) {
    const style = overlayCardStyle(placement, overlayMetrics('comfortable'));

    expect(style.position).toBe('absolute');
  }
});
