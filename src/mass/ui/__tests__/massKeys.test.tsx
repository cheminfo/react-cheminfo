// @vitest-environment jsdom
/**
 * The mass viewer driven from the keyboard and from a host's handle.
 *
 * The keys are heard on the viewer's own root, so each is dispatched there.
 * What the chart shows is read off the page: the window off the peaks panel,
 * which lists the peaks the chart is showing, the labels off the chart, and
 * the tool off the status bar. The chart is laid out at 600 × 400, which jsdom
 * cannot measure, so the box is given that size.
 */

import { act, createRef } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { massFixture } from '../../core/__tests__/massFixtures.ts';
import type { MassEditorHandle } from '../../core/massEditorApi.ts';
import { MassEditor } from '../MassEditor.tsx';

import { stubViewerLayout } from './massViewerStubs.ts';

let host: HTMLDivElement;
let root: Root;
let handle: ReturnType<typeof createRef<MassEditorHandle>>;

beforeEach(async () => {
  stubViewerLayout();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  handle = createRef<MassEditorHandle>();
  const data = await massFixture('taxine-b-ms2.jdx');
  act(() => root.render(<MassEditor ref={handle} data={data} />));
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function viewer(): HTMLElement {
  const found = host.querySelector<HTMLElement>('[tabindex="-1"]');
  if (found === null) throw new Error('no viewer');
  return found;
}

function key(name: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    key: name,
    bubbles: true,
    cancelable: true,
    ...init,
  });
  act(() => {
    viewer().dispatchEvent(event);
  });
  return event;
}

function listed(): string {
  return (
    host
      .querySelector('[title$="peaks of this spectrum listed"]')
      ?.getAttribute('title') ?? ''
  );
}

function labelled(mz: string): boolean {
  return host.innerHTML.includes(`>${mz}</tspan>`);
}

test('l takes the labels off the chart, and puts them back', () => {
  expect(labelled('194.1175')).toBe(true);

  const event = key('l');

  expect(event.defaultPrevented).toBe(true);
  expect(labelled('194.1175')).toBe(false);

  key('L');

  expect(labelled('194.1175')).toBe(true);
});

test('a key pressed with a modifier is the browser’s, not the viewer’s', () => {
  const event = key('l', { ctrlKey: true });

  expect(event.defaultPrevented).toBe(false);
  expect(labelled('194.1175')).toBe(true);
});

test('a key with no command goes on to the page', () => {
  const heard: string[] = [];
  document.addEventListener('keydown', (event) => heard.push(event.key));

  key('q');
  key('l');

  expect(heard).toStrictEqual(['q']);
});

test('b switches to the square zoom, b again and r back to reading', () => {
  key('b');

  expect(host.textContent).toContain('square zoom: drag a rectangle');

  key('b');

  expect(host.textContent).not.toContain('square zoom');

  key('b');
  key('r');

  expect(host.textContent).not.toContain('square zoom');
});

test('h opens the documentation, and o the file picker', () => {
  const picked = vi.spyOn(HTMLInputElement.prototype, 'click');

  key('h');

  expect(document.body.textContent).toContain('Using the mass spectrum viewer');

  key('o');

  expect(picked).toHaveBeenCalledOnce();
  expect(picked.mock.contexts[0]).toBe(
    host.querySelector('input[aria-label="Open spectra"]'),
  );
});

test('a mass framed by the host narrows the peaks listed, and f shows them all again', () => {
  expect(listed()).toBe('10 of the 10 peaks of this spectrum listed');

  // 194.1175 and its neighbour at 195.4300 lie within 2 of the mass.
  act(() => handle.current?.zoomToMz(194.1175, { halfWidth: 2 }));

  expect(listed()).toBe('2 of the 10 peaks of this spectrum listed');

  key('f');

  expect(listed()).toBe('10 of the 10 peaks of this spectrum listed');

  act(() => handle.current?.setDomain({ x: [100, 200], y: [0, 120] }));

  expect(listed()).toBe('6 of the 10 peaks of this spectrum listed');

  act(() => handle.current?.resetDomain());

  expect(listed()).toBe('10 of the 10 peaks of this spectrum listed');
});

test('+ and - scale the intensity axis about zero', () => {
  act(() => handle.current?.setDomain({ x: [60, 240], y: [0, 120] }));
  const before = host.innerHTML;

  key('+');
  const zoomedIn = host.innerHTML;
  key('-');

  expect(zoomedIn).not.toBe(before);
  expect(host.innerHTML).toBe(before);
  expect(listed()).toBe('10 of the 10 peaks of this spectrum listed');
});

test('spectra are added, replaced, selected and cleared through the handle', async () => {
  const [taxine] = handle.current?.getSpectra() ?? [];
  const aflatoxin = await massFixture('aflatoxin-peaks.jdx');

  act(() => handle.current?.addSpectra(aflatoxin));

  expect(handle.current?.getSpectra()).toHaveLength(2);
  expect(host.textContent).toContain('2 spectra drawn of 2');

  act(() => handle.current?.selectSpectrum(null));

  expect(listed()).toBe('0 of the 0 peaks of this spectrum listed');
  expect(host.textContent).toContain('No spectrum is selected.');

  act(() => handle.current?.selectSpectrum(taxine?.id ?? null));

  expect(listed()).toBe('10 of the 10 peaks of this spectrum listed');

  act(() => handle.current?.setSpectra(aflatoxin));

  expect(handle.current?.getSpectra()).toStrictEqual(aflatoxin);

  act(() => handle.current?.clear());

  expect(handle.current?.getSpectra()).toStrictEqual([]);
  expect(host.textContent).toContain('no spectrum open');
});

function isActive(label: string): boolean {
  return (
    host
      .querySelector(`button[aria-label="${CSS.escape(label)}"]`)
      ?.classList.contains('bp6-active') ?? false
  );
}

test('z stops and starts writing the charges, and x opens and closes the figure panel', () => {
  expect(isActive('Write the charges (z)')).toBe(true);

  key('z');

  expect(isActive('Write the charges (z)')).toBe(false);

  key('x');

  expect(isActive('Save figure… (x)')).toBe(true);

  key('x');
  key('z');

  expect(isActive('Save figure… (x)')).toBe(false);
  expect(isActive('Write the charges (z)')).toBe(true);
});

test('the About opens from the toolbar', () => {
  const about = host.querySelector<HTMLButtonElement>(
    'button[aria-label="About the mass spectrum viewer"]',
  );
  act(() => {
    about?.click();
  });

  expect(document.querySelector('.bp6-dialog-header')?.textContent).toContain(
    'About the mass spectrum viewer',
  );
});
