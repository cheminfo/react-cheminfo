// @vitest-environment jsdom
/**
 * The "Save figure" panel behind a caller's own trigger: what it measures when
 * it opens, and how the format, the resolution and the size picked move what
 * it says it will write.
 */

import type { ReactElement } from 'react';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { placeAt } from '../../core/__tests__/pageLayout.ts';
import { SVG_NAMESPACE } from '../../core/svgNamespace.ts';
import type { FigureDownloadOptions } from '../useFigureDownload.tsx';
import { useFigureDownload } from '../useFigureDownload.tsx';

let host: HTMLDivElement;
let root: Root;

const WRITTEN = { markup: '<svg/>', width: 100, height: 40 };

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  const box = document.createElement('div');
  box.id = 'plot';
  box.append(
    placeAt(document.createElementNS(SVG_NAMESPACE, 'svg'), 0, 0, 360, 190),
  );
  host.append(box);
  document.body.append(host);
  const section = document.createElement('section');
  host.append(section);
  root = createRoot(section);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  vi.unstubAllGlobals();
});

test('opening the panel measures the figure on the page, and closing it hides it', async () => {
  await open({ targetId: 'plot' });

  expect(said()).toContain('Prints 9.5 × 5.0 cm, and stays sharp at any size.');
  expect(field('format')).toBe('svg');
  expect(said()).toContain('Size');

  await press(host.querySelector('[data-action="close"]'));

  expect(host.querySelector('[role="radiogroup"]')).toBeNull();
});

test('a box that is not on the page leaves nothing to save', async () => {
  await open({ targetId: 'elsewhere' });

  expect(said()).toContain('There is no figure on the page to save yet.');

  await open({});

  expect(said()).toContain('There is no figure on the page to save yet.');
});

test('a figure its page writes is measured once written, and one that fails leaves nothing to save', async () => {
  await open({ writeFigure: async () => WRITTEN });

  expect(said()).toContain('Prints 2.6 × 1.1 cm');

  await open({
    writeFigure: () => Promise.reject(new Error('nothing drawn yet')),
  });

  expect(said()).toContain('There is no figure on the page to save yet.');
});

test('one resolution serves copy, send and a PNG, and an SVG takes the width alone', async () => {
  const picked: number[] = [];
  await open({
    targetId: 'plot',
    unit: 'multiple',
    defaultFormat: 'png',
    onScaleChange: (scale) => picked.push(scale),
  });

  expect(said()).toContain('A PNG of 720 × 380 pixels.');

  await press(radio('4×'));

  expect(said()).toContain('A PNG of 1440 × 760 pixels.');

  await press(radio('SVG'));

  expect(field('format')).toBe('svg');
  expect(said()).toContain('Opens at 360 × 190 pixels');
  expect(said()).toContain('A PNG of 1440 × 760 pixels.');
  expect(picked).toStrictEqual([4]);
});

test('a figure with a printed size opens its SVG at that size, the resolution kept for the PNG', async () => {
  await open({ targetId: 'plot', unit: 'dpi', defaultFormat: 'svg' });

  expect(said()).toContain('Prints 9.5 × 5.0 cm, and stays sharp at any size.');
  expect(said()).toContain('which prints 9.5 × 5.0 cm.');
  expect(host.textContent).toContain('Resolution');
});

test('a figure that can be drawn again takes a width, or one typed in centimetres', async () => {
  await open({ targetId: 'plot', renderFigure: () => null });
  await press(radio('PNG'));

  expect(said()).toContain('which prints 9.5 × 5.0 cm.');

  await pickShape('One column (8.5 cm)');

  expect(said()).toContain('which prints 8.5 × 4.5 cm.');

  await pickShape('Custom');
  await type(input('Width'), '17.5');
  await leave(input('Width'));

  expect(said()).toContain('which prints 17.5 × 9.2 cm.');
});

function Harness(props: FigureDownloadOptions): ReactElement {
  const { isOpen, setOpen, panel, format, portal } = useFigureDownload(props);
  return (
    <>
      <button type="button" data-action="open" onClick={() => setOpen(true)} />
      <button
        type="button"
        data-action="close"
        onClick={() => setOpen(false)}
      />
      <output data-field="format">{format}</output>
      {isOpen ? panel : null}
      {portal}
    </>
  );
}

/**
 * Render the panel with these options, then open it.
 * @param options - What it saves.
 */
async function open(options: FigureDownloadOptions): Promise<void> {
  act(() => {
    root.render(<Harness {...options} />);
  });
  await press(host.querySelector('[data-action="open"]'));
}

/**
 * Click a control, and let what it started end.
 * @param target - The control.
 */
async function press(target: Element | null): Promise<void> {
  await act(async () => {
    if (target instanceof HTMLElement) target.click();
  });
}

/**
 * Leave a box, which takes what was typed in it.
 * @param box - The box.
 */
async function leave(box: Element | null): Promise<void> {
  await act(async () => {
    box?.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
  });
}

/**
 * Pick a shape from the size menu, which opens over the panel.
 * @param label - The shape, as the menu names it.
 */
async function pickShape(label: string): Promise<void> {
  await press(host.querySelector('[aria-label^="Size"]'));
  const item = [...document.querySelectorAll('[role="option"]')].find(
    (option) => option.textContent === label,
  );
  if (item === undefined) throw new Error(`no ${label} in the size menu`);
  await press(item.querySelector('a') ?? item);
}

/**
 * Type into a box as a reader does, which React hears as an input event.
 * @param box - The box.
 * @param text - What it holds afterwards.
 */
async function type(box: HTMLInputElement | null, text: string): Promise<void> {
  await act(async () => {
    if (box === null) return;
    // Set through the prototype, past the copy React keeps on the box, so
    // React sees the value change as a reader's keystroke would.
    Reflect.set(HTMLInputElement.prototype, 'value', text, box);
    box.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function radio(label: string): HTMLElement | null {
  for (const option of host.querySelectorAll<HTMLElement>('[role="radio"]')) {
    if (option.textContent === label) return option;
  }
  return null;
}

function input(label: string): HTMLInputElement | null {
  return host.querySelector(`input[aria-label="${CSS.escape(label)}"]`);
}

function field(name: string): string | null {
  return (
    host.querySelector(`[data-field="${CSS.escape(name)}"]`)?.textContent ??
    null
  );
}

function said(): string {
  return host.textContent ?? '';
}
