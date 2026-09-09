import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { overlayMetrics } from '../../core/overlayMetrics.ts';
import { OverlayLayer } from '../OverlayLayer.tsx';
import { OverlayValueButton } from '../OverlayValueButton.tsx';
import { OverlayValueMenu } from '../OverlayValueMenu.tsx';
import {
  overlayValueButtonStyle,
  overlayValueKeyStyle,
} from '../overlayValueStyles.ts';

const OUTLINES = [
  { value: 'ninety', label: '95%' },
  { value: 'sixty', label: '68%' },
  { value: 'none', label: 'None', title: 'Draws no outline at all.' },
];

const COLOURS = ['#0072b2', '#d55e00', '#009e73'];

test('the button writes the value, and the key word only in front of it', () => {
  const html = renderToStaticMarkup(
    <OverlayValueButton
      label="Group outlines"
      keyWord="Outlines"
      value="95%"
    />,
  );

  expect(html).toContain(
    '<span style="color:var(--text-muted);font-weight:500">Outlines</span>',
  );
  expect(html).toContain(
    '<span style="color:var(--text);font-weight:600">95%</span>',
  );
});

test('the name is what is announced, with the value after it', () => {
  const html = renderToStaticMarkup(
    <OverlayValueButton
      label="Group outlines"
      keyWord="Outlines"
      value="95%"
    />,
  );

  expect(html).toContain('title="Group outlines — 95%"');
  expect(html).toContain('aria-label="Group outlines — 95%"');
});

test('a narrowing bar drops the key word and keeps every announcement', () => {
  const html = renderToStaticMarkup(
    <OverlayValueButton
      label="Group outlines"
      keyWord="Outlines"
      value="95%"
      showKey={false}
    />,
  );

  expect(html).not.toContain('>Outlines<');
  expect(html).toContain('aria-label="Group outlines — 95%"');
  expect(html).toContain('>95%</span>');
});

test('the name serves as the key word wherever it is already one word', () => {
  const html = renderToStaticMarkup(
    <OverlayValueButton label="Colour" value="Species" />,
  );

  expect(html).toContain('>Colour</span>');
  expect(html).toContain('aria-label="Colour — Species"');
});

test('it carries no box at rest: no border, no fill, no accent anywhere', () => {
  const html = renderToStaticMarkup(
    <OverlayLayer density="compact">
      <OverlayValueButton label="Colour by" keyWord="Colour" value="Species" />
    </OverlayLayer>,
  );

  expect(html).toContain('border:none');
  expect(html).toContain('background:transparent');
  expect(html).not.toContain('1px solid var(--border)');
  expect(html).not.toContain('var(--accent');
});

test('the ground appears while the choices are open, and the ink never fades', () => {
  const html = renderToStaticMarkup(
    <OverlayValueButton label="Colour by" value="Species" active opensMenu />,
  );

  expect(html).toContain('background:var(--surface-sunken)');
  expect(html).toContain('color:var(--text)');
  expect(html).toContain('aria-expanded="true"');
  expect(html).toContain('aria-haspopup="menu"');
});

test('the colours it opens are the colours the figure draws', () => {
  const html = renderToStaticMarkup(
    <OverlayLayer density="compact">
      <OverlayValueButton
        label="Colour by"
        value="Species"
        swatches={COLOURS}
      />
    </OverlayLayer>,
  );

  expect(html.match(/border-radius:50%/g)).toHaveLength(3);
  expect(html).toContain('background:#0072b2');
  expect(html).toContain('background:#d55e00');
  expect(html).toContain('background:#009e73');
});

test('an empty palette draws no dots rather than an empty row', () => {
  const html = renderToStaticMarkup(
    <OverlayValueButton label="Colour by" value="Nothing" swatches={[]} />,
  );

  expect(html).not.toContain('border-radius:50%');
});

test('a setting that cannot be reached says why, and is greyed rather than gone', () => {
  const html = renderToStaticMarkup(
    <OverlayValueButton
      label="Group outlines"
      value="95%"
      disabled
      disabledReason="Only once the samples are in groups."
    />,
  );

  expect(html).toContain('title="Only once the samples are in groups."');
  expect(html).toContain('aria-label="Group outlines — 95%"');
  expect(html).toContain('disabled=""');
  expect(html).toContain('cursor:default;opacity:0.6');
});

test('the keyboard is shown a ring, which is not the ground the pointer gets', () => {
  const metrics = overlayMetrics('compact');
  const focused = overlayValueButtonStyle(metrics, { focused: true });
  const hovered = overlayValueButtonStyle(metrics, { hovered: true });

  expect(focused.outline).toBe('2px solid var(--accent, var(--text))');
  expect(focused.background).toBe('transparent');
  expect(hovered.outline).toBeUndefined();
  expect(hovered.background).toBe('var(--surface-sunken)');
});

test('a greyed control is given no ring and no ground at all', () => {
  const metrics = overlayMetrics('compact');
  const style = overlayValueButtonStyle(metrics, {
    focused: true,
    hovered: true,
    disabled: true,
  });

  expect(style.outline).toBeUndefined();
  expect(style.background).toBe('transparent');
  expect(style.opacity).toBe(0.6);
});

test('a finger keeps its forty pixels however narrow the figure is', () => {
  const style = overlayValueButtonStyle(
    overlayMetrics('compact', 'coarse'),
    {},
  );

  expect(style.height).toBe(40);
  expect(style.minWidth).toBe(40);
});

test('the key word is the caption grey, never the value ink', () => {
  expect(overlayValueKeyStyle()).toStrictEqual({
    color: 'var(--text-muted)',
    fontWeight: 500,
  });
});

test('the menu writes the label of the choice in force, and ticks it', () => {
  const html = renderToStaticMarkup(
    <OverlayValueMenu
      label="Group outlines"
      keyWord="Outlines"
      value="ninety"
      options={OUTLINES}
      onChange={() => null}
    />,
  );

  expect(html).toContain('aria-label="Group outlines — 95%"');
  expect(html).toContain('>Outlines</span>');
  expect(html).toContain('aria-haspopup="menu"');
  expect(html).toContain('aria-expanded="false"');
});

test('a value nothing in the menu matches is still what the button writes', () => {
  const html = renderToStaticMarkup(
    <OverlayValueMenu
      label="Group outlines"
      value="ninety-nine"
      options={OUTLINES}
      onChange={() => null}
    />,
  );

  expect(html).toContain(
    '<span style="color:var(--text);font-weight:600">ninety-nine</span>',
  );
  expect(html).toContain('aria-label="Group outlines — ninety-nine"');
});

test('a setting nothing can change opens nothing and says why', () => {
  const html = renderToStaticMarkup(
    <OverlayValueMenu
      label="Group outlines"
      value="ninety"
      options={OUTLINES}
      onChange={() => null}
      disabled
      disabledReason="Only once the samples are in groups."
    />,
  );

  expect(html).toContain('disabled=""');
  expect(html).toContain('title="Only once the samples are in groups."');
});
