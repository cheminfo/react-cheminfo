// @vitest-environment jsdom
/**
 * A row of round swatches, one pressed for the colour in use, and the button
 * for any other colour that ends it.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { CustomColorButton, SwatchRow } from '../SwatchRow.tsx';

const COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Orange', value: '#e69f00' },
];

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test('a swatch pressed hands its colour over, and the one in use is pressed', () => {
  const picks: string[] = [];
  act(() => {
    root.render(
      <SwatchRow
        label="Ink"
        colors={COLORS}
        value="#e69f00"
        onPick={(color) => {
          picks.push(color);
        }}
        nameOf={(name) => `Ink: ${name}`}
      />,
    );
  });
  const group = host.querySelector('[role="group"]');

  expect(group?.getAttribute('aria-label')).toBe('Ink');

  const swatches = [...host.querySelectorAll('button')];

  expect(
    swatches.map((swatch) => [
      swatch.getAttribute('aria-label'),
      swatch.title,
      swatch.getAttribute('aria-pressed'),
    ]),
  ).toStrictEqual([
    ['Ink: Black', 'Black', 'false'],
    ['Ink: Orange', 'Orange', 'true'],
  ]);

  act(() => {
    swatches[0]?.click();
  });

  expect(picks).toStrictEqual(['#000000']);
});

test('a row may start with a none, end with a custom button, and keep to one line', () => {
  const html = renderToStaticMarkup(
    <SwatchRow
      label="Fill"
      colors={COLORS}
      value={undefined}
      onPick={() => undefined}
      leading={<span className="none">None</span>}
      custom={<span className="custom">More</span>}
      clip
    />,
  );

  expect(
    html.startsWith(
      '<div class="color-row color-row--clip" role="group" aria-label="Fill"><span class="none">None</span><div class="color-row__swatches"><button',
    ),
  ).toBe(true);
  expect(
    html.endsWith('</button></div><span class="custom">More</span></div>'),
  ).toBe(true);
  expect(html.match(/aria-pressed="false"/g)).toHaveLength(2);
  expect(html).toContain('aria-label="Black"');
});

test('the custom button is pressed only for a colour off the presets', () => {
  const presets = ['#000000', '#e69f00'];
  const label = 'Another colour, with its opacity';
  const custom = renderToStaticMarkup(
    <CustomColorButton
      value="#12345680"
      presets={presets}
      onPick={() => undefined}
    />,
  );

  expect(custom).toContain('bp6-active');
  expect(custom).toContain(`aria-label="${label}"`);
  expect(custom).toContain('data-icon="tint"');

  const preset = renderToStaticMarkup(
    <CustomColorButton
      value="#E69F00"
      presets={presets}
      onPick={() => undefined}
      label="Other ink"
    />,
  );

  expect(preset).not.toContain('bp6-active');
  expect(preset).toContain('aria-label="Other ink"');
  expect(preset).toContain('data-icon="tint"');

  const none = renderToStaticMarkup(
    <CustomColorButton
      value={undefined}
      presets={[]}
      onPick={() => undefined}
    />,
  );

  expect(none).not.toContain('bp6-active');
});

test('a colour picked in the custom picker is handed over once it settles', () => {
  // jsdom has no 2D context; the picker's checkerboard draws nothing without.
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  vi.useFakeTimers();
  const picks: string[] = [];
  act(() => {
    root.render(
      <CustomColorButton
        value="#12345680"
        presets={['#000000', '#e69f00']}
        onPick={(color) => {
          picks.push(color);
        }}
      />,
    );
  });
  act(() => {
    host.querySelector('button')?.click();
  });
  const preset = document.body.querySelector<HTMLElement>('[title="#e69f00"]');

  expect(preset).not.toBeNull();

  act(() => {
    preset?.click();
  });

  expect(picks).toStrictEqual([]);

  act(() => {
    vi.advanceTimersByTime(100);
  });

  expect(picks).toStrictEqual(['#e69f00']);
});
