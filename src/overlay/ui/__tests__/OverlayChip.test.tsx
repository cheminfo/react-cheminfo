import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { overlayMetrics } from '../../core/overlayMetrics.ts';
import type { OverlayChipSetting } from '../OverlayChip.tsx';
import { OverlayChip } from '../OverlayChip.tsx';
import { OverlayLayer } from '../OverlayLayer.tsx';
import { overlayChipStyle } from '../overlayValueStyles.ts';

const SETTINGS: readonly OverlayChipSetting[] = [
  {
    label: 'Colour by',
    value: 'Species',
    swatches: ['#0072b2', '#d55e00', '#009e73'],
  },
  { label: 'Group outlines', value: '95%' },
];

function chip(settings: readonly OverlayChipSetting[] = SETTINGS): string {
  return renderToStaticMarkup(
    <OverlayLayer density="compact">
      <OverlayChip label="Settings" settings={settings}>
        <span>the controls</span>
      </OverlayChip>
    </OverlayLayer>,
  );
}

test('the chip still says how the figure is drawn, which is why it is not a cog', () => {
  const html = chip();

  expect(html).toContain(
    '<span style="color:var(--text);font-weight:600">Species</span>',
  );
  expect(html).toContain(
    '<span style="color:var(--text);font-weight:600">95%</span>',
  );
});

test('a hairline separates the two readings, and only between them', () => {
  const html = chip();

  expect(
    html.match(/width:1px;height:10px;background:var\(--border\)/g),
  ).toHaveLength(1);
});

test('a reader who cannot see it is told which question each value answers', () => {
  const html = chip();

  expect(html).toContain(
    'aria-label="Colour by — Species, Group outlines — 95%"',
  );
  expect(html).toContain('title="Colour by — Species, Group outlines — 95%"');
});

test('it takes the sunken ground of the tab track rather than an outline', () => {
  const html = chip();

  expect(html).toContain('background:var(--surface-sunken)');
  expect(html).toContain('border:none');
  expect(html).not.toContain('1px solid var(--border)');
  expect(html).not.toContain('var(--accent');
});

test('the chip is fully rounded, where a value button is only softened', () => {
  const compact = overlayChipStyle(overlayMetrics('compact'), {});

  expect(compact.borderRadius).toBe(12);
  expect(compact.height).toBe(24);
});

test('one palette rides at its head, taken from the first setting that has one', () => {
  const html = chip([
    { label: 'Group outlines', value: '95%' },
    SETTINGS[0] as OverlayChipSetting,
  ]);

  expect(html.match(/border-radius:50%/g)).toHaveLength(3);
  expect(html).toContain('background:#0072b2');
});

test('a chip whose settings have no colours draws no dots', () => {
  const html = chip([
    { label: 'Group outlines', value: '95%' },
    { label: 'Dot size', value: 'Medium' },
  ]);

  expect(html).not.toContain('border-radius:50%');
  expect(html).toContain('>Medium</span>');
});

test('it says there is more behind it, and that nothing is open yet', () => {
  const html = chip();

  expect(html).toContain('aria-haspopup="menu"');
  expect(html).toContain('aria-expanded="false"');
});

test('a chip nothing can change is greyed rather than removed', () => {
  const html = renderToStaticMarkup(
    <OverlayChip label="Settings" settings={SETTINGS} disabled>
      <span>the controls</span>
    </OverlayChip>,
  );

  expect(html).toContain('disabled=""');
  expect(html).toContain('cursor:default;opacity:0.6');
});

test('the pointer deepens the chip with a hairline instead of a second ground', () => {
  const metrics = overlayMetrics('compact');
  const hovered = overlayChipStyle(metrics, { hovered: true });
  const focused = overlayChipStyle(metrics, { focused: true });

  expect(hovered.boxShadow).toBe('inset 0 0 0 1px var(--border)');
  expect(hovered.background).toBe('var(--surface-sunken)');
  expect(focused.outline).toBe('2px solid var(--accent, var(--text))');
  expect(focused.boxShadow).toBeUndefined();
});

test('the chip is still a forty pixel target under a fingertip', () => {
  const style = overlayChipStyle(overlayMetrics('compact', 'coarse'), {});

  expect(style.height).toBe(40);
  expect(style.minWidth).toBe(40);
  expect(style.borderRadius).toBe(20);
});
