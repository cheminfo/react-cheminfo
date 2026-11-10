// @vitest-environment jsdom
/**
 * The side panels of the mass viewer: the peaks of the selected spectrum, how
 * it was acquired, and the panels a host adds to the viewer's own.
 *
 * The panels are read the way a chemist reads them — which rows are listed and
 * in what order, which facts the file stated — and what a click on a row does
 * to the chart is read back off the peaks the panel then lists.
 */

import { act, createRef } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { massFixture } from '../../core/__tests__/massFixtures.ts';
import type { MassEditorHandle } from '../../core/massEditorApi.ts';
import type { MassSpectrum } from '../../core/massSpectrum.ts';
import type { MassEditorProps } from '../MassEditor.tsx';
import { MassEditor } from '../MassEditor.tsx';

import { iconsLoaded, stubViewerLayout } from './massViewerStubs.ts';

let host: HTMLDivElement;
let root: Root;
let handle: ReturnType<typeof createRef<MassEditorHandle>>;
let taxine: MassSpectrum[];

beforeEach(async () => {
  stubViewerLayout();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  handle = createRef<MassEditorHandle>();
  taxine = await massFixture('taxine-b-ms2.jdx');
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  Reflect.deleteProperty(navigator, 'clipboard');
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// Blueprint loads each icon's paths on its own, after the first render.
async function render(props: MassEditorProps): Promise<void> {
  await act(async () => {
    root.render(<MassEditor ref={handle} {...props} />);
    await iconsLoaded();
  });
}

function press(label: string): void {
  const button = host.querySelector<HTMLButtonElement>(
    `button[aria-label="${CSS.escape(label)}"]`,
  );
  if (button === null) throw new Error(`no button labelled ${label}`);
  act(() => {
    button.click();
  });
}

function listed(): string {
  return (
    host
      .querySelector('[title$="peaks of this spectrum listed"]')
      ?.getAttribute('title') ?? ''
  );
}

function rows(): HTMLTableRowElement[] {
  return [...host.querySelectorAll<HTMLTableRowElement>('tr[data-index]')];
}

function firstColumn(): string[] {
  return rows().map((row) => row.cells[0]?.textContent ?? '');
}

test('the peaks are listed by m/z, or by intensity from the base peak down', async () => {
  await render({ data: taxine });

  expect(firstColumn().slice(0, 3)).toStrictEqual([
    '71.4512',
    '79.0544',
    '80.5207',
  ]);

  const intensity = [...host.querySelectorAll('th button')].find((button) =>
    button.textContent?.startsWith('intensity'),
  );
  act(() => {
    (intensity as HTMLButtonElement).click();
  });

  expect(firstColumn().slice(0, 3)).toStrictEqual([
    '194.1175',
    '107.0493',
    '228.3293',
  ]);
  expect(intensity?.textContent).toBe('intensity ▼');
});

test('a row clicked, or chosen from the keyboard, frames its peak', async () => {
  await render({ data: taxine });
  const row = rows().find((one) => one.cells[0]?.textContent === '107.0493');

  act(() => {
    row?.click();
  });

  expect(listed()).toBe('1 of the 10 peaks of this spectrum listed');

  press('Only the peaks the chart is showing');

  expect(listed()).toBe('10 of the 10 peaks of this spectrum listed');

  const last = rows().find((one) => one.cells[0]?.textContent === '228.3293');
  act(() => {
    last?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
  });
  press('Only the peaks the chart is showing');

  expect(listed()).toBe('1 of the 10 peaks of this spectrum listed');
});

test('the pointer resting on a row lights it, and leaving the table puts it out', async () => {
  await render({ data: taxine });
  const row = rows()[3];

  act(() => {
    row?.dispatchEvent(new Event('pointerover', { bubbles: true }));
  });

  expect(rows()[3]?.style.background).toBe('rgb(232, 241, 251)');

  act(() => {
    row?.parentElement?.dispatchEvent(
      new Event('pointerout', { bubbles: true }),
    );
  });

  expect(rows()[3]?.style.background).toBe('');
});

test('the floor of 1 % of the base peak can be lifted', async () => {
  await render({ data: await massFixture('aflatoxin-peaks.jdx') });

  expect(listed()).toBe('22 of the 23 peaks of this spectrum listed');

  press('Leave out the peaks under 1 % of the base peak');

  expect(listed()).toBe('23 of the 23 peaks of this spectrum listed');
});

test('the rows listed are copied as tab-separated text', async () => {
  const writeText = vi.fn<(text: string) => Promise<void>>(
    async () => undefined,
  );
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
  await render({ data: taxine });

  await act(async () => {
    press('Copy the rows as tab-separated text');
    await Promise.resolve();
  });

  const text = writeText.mock.calls[0]?.[0] ?? '';

  expect(text.split('\n').slice(0, 2)).toStrictEqual([
    'm/z\tintensity\tcharge',
    '71.4512\t12.48\t',
  ]);
  expect(text.split('\n')).toHaveLength(12);
});

test('the acquisition panel states what the file wrote, and its scan line on demand', async () => {
  await render({ data: taxine, defaultPanelIds: ['metadata'] });

  expect(host.textContent).toContain('Taxine B HCD53');
  expect(host.textContent).toContain('FormulaC33H45NO8');
  expect(host.textContent).toContain('AnalyserFTMS');
  expect(host.querySelector('pre')).toBeNull();

  press('Show the scan description');

  expect(host.querySelector('pre')?.textContent).toContain(
    'FTMS + p ESI d Full ms2 584.8218@hcd53.33 [61.7793-617.7933]',
  );
});

test('a file that stated nothing is described by what the viewer knows', async () => {
  await render({
    data: await massFixture('caffeine-peaks.txt'),
    defaultPanelIds: ['metadata'],
  });

  expect(host.textContent).toContain(
    'This file carried no acquisition metadata, so this is what the viewer knows about it.',
  );

  act(() => handle.current?.selectSpectrum(null));

  expect(host.textContent).toContain(
    'No spectrum is selected. Click one in the Spectra panel and what its file said about the acquisition appears here.',
  );
});

test('a host’s panel comes first and opens like the others, and a taken id is refused', async () => {
  await render({
    data: taxine,
    defaultPanelIds: ['isotopes'],
    panels: [
      {
        id: 'isotopes',
        title: 'Isotopes',
        icon: 'function',
        content: <p>The predicted pattern</p>,
      },
      { id: 'peaks', title: 'Shadow', icon: 'th', content: <p>never</p> },
      { id: 'isotopes', title: 'Twice', icon: 'th', content: <p>never</p> },
    ],
  });

  expect(host.textContent).toContain('The predicted pattern');
  expect(host.textContent).not.toContain('never');

  const titles = new Set(['Isotopes', 'Shadow', 'Twice']);
  for (const own of ['Spectra', 'Peaks', 'Acquisition']) titles.add(own);
  const rail = [...host.querySelectorAll('button[aria-label]')]
    .map((button) => button.getAttribute('aria-label') ?? '')
    .filter((label) => titles.has(label));

  expect(rail).toStrictEqual(['Isotopes', 'Spectra', 'Peaks', 'Acquisition']);

  press('Isotopes');

  expect(host.textContent).not.toContain('The predicted pattern');
});
