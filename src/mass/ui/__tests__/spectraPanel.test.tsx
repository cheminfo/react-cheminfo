// @vitest-environment jsdom
/**
 * The spectra panel of the mass viewer: what each row does to its spectrum,
 * and what the panel's toolbar does to all of them.
 *
 * Every row addresses its spectrum by identity, so each gesture is read back
 * off the spectra the viewer's handle returns rather than off the markup.
 */

import { act, createRef } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { massFixture } from '../../core/__tests__/massFixtures.ts';
import type { MassEditorHandle } from '../../core/massEditorApi.ts';
import type { MassSpectrum } from '../../core/massSpectrum.ts';
import { MassEditor } from '../MassEditor.tsx';

import { iconsLoaded, stubViewerLayout } from './massViewerStubs.ts';

const TAXINE = 'Taxine B HCD53';
const AFLATOXIN = 'Aflatoxin  (macfile.jdx)';

let host: HTMLDivElement;
let root: Root;
let handle: ReturnType<typeof createRef<MassEditorHandle>>;
let saved: () => string[];

beforeEach(async () => {
  stubViewerLayout();
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test/1');
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
  const click = vi
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(() => undefined);
  saved = () =>
    (click.mock.contexts as HTMLAnchorElement[]).map(
      (anchor) => anchor.download,
    );
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  handle = createRef<MassEditorHandle>();
  const taxine = await massFixture('taxine-b-ms2.jdx');
  const aflatoxin = await massFixture(
    'aflatoxin-peaks.jdx',
    taxine.map((spectrum) => spectrum.color),
  );
  // Blueprint loads each icon's paths on its own, after the first render.
  await act(async () => {
    root.render(<MassEditor ref={handle} data={[...taxine, ...aflatoxin]} />);
    await iconsLoaded();
  });
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function spectrum(name: string): MassSpectrum | undefined {
  return handle.current?.getSpectra().find((one) => one.name === name);
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

// The name is the button a click selects with, under the row's other controls.
const NAME = 'button[title^="Click to work on this spectrum"]';

function nameButton(name: string): HTMLButtonElement {
  const found = [...host.querySelectorAll(NAME)].find(
    (button) => button.querySelector('span')?.textContent === name,
  );
  if (!(found instanceof HTMLButtonElement)) throw new Error(`no ${name} row`);
  return found;
}

function selected(): string | null {
  return (
    host.querySelector(`li[aria-current="true"] ${NAME} span`)?.textContent ??
    null
  );
}

function renameTo(name: string, text: string, ending: string): void {
  act(() => {
    nameButton(name).dispatchEvent(
      new MouseEvent('dblclick', { bubbles: true }),
    );
  });
  const box = host.querySelector<HTMLInputElement>(
    `input[aria-label="Name of ${CSS.escape(name)}"]`,
  );
  if (box === null) throw new Error(`no box to rename ${name}`);
  act(() => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set?.call(box, text);
    box.dispatchEvent(new Event('input', { bubbles: true }));
  });
  act(() => {
    box.dispatchEvent(
      ending === 'blur'
        ? new FocusEvent('focusout', { bubbles: true })
        : new KeyboardEvent('keydown', { key: ending, bubbles: true }),
    );
  });
}

test('a click on a name points every panel at that spectrum', () => {
  expect(selected()).toBe(TAXINE);

  act(() => {
    nameButton(AFLATOXIN).click();
  });

  expect(selected()).toBe(AFLATOXIN);
});

test('the arrow keys walk the list', () => {
  const list = host.querySelector('ul[aria-label="Open spectra"]');

  act(() => {
    list?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
  });

  expect(selected()).toBe(AFLATOXIN);
});

test('a name is renamed in place: Enter or leaving takes it, Escape and an empty box do not', () => {
  renameTo(TAXINE, '  Yew alkaloid  ', 'Enter');

  expect(spectrum('Yew alkaloid')).toBeDefined();

  renameTo('Yew alkaloid', 'Discarded', 'Escape');
  renameTo('Yew alkaloid', ' '.repeat(3), 'blur');

  expect(handle.current?.getSpectra().map((one) => one.name)).toStrictEqual([
    'Yew alkaloid',
    AFLATOXIN,
  ]);

  renameTo('Yew alkaloid', 'Taxine', 'blur');

  expect(spectrum('Taxine')).toBeDefined();
});

test('the trace icons swap the trace drawn, and take a spectrum off the chart', () => {
  press(`Centroid sticks of ${TAXINE}`);

  expect(spectrum(TAXINE)?.showProfile).toBe(false);
  expect(spectrum(TAXINE)?.showCentroid).toBe(true);

  press(`Centroid sticks of ${TAXINE}`);

  expect(spectrum(TAXINE)?.showCentroid).toBe(false);
  expect(host.textContent).toContain('1 spectrum drawn of 2');

  press('Draw every spectrum again');

  expect(spectrum(TAXINE)?.showProfile).toBe(true);
  expect(spectrum(TAXINE)?.showCentroid).toBe(false);
  expect(host.textContent).toContain('2 spectra drawn of 2');

  press(`Continuous trace of ${TAXINE}`);

  expect(spectrum(TAXINE)?.showProfile).toBe(false);
  expect(host.textContent).toContain('1 spectrum drawn of 2');
});

test('a hidden trace icon draws its spectrum and selects it', () => {
  press(`Centroid sticks of ${AFLATOXIN}`);

  expect(selected()).toBe(AFLATOXIN);
  expect(spectrum(AFLATOXIN)?.showCentroid).toBe(true);
});

test('a row saves its own spectrum, and the toolbar saves them all in one file', () => {
  press(`Download ${TAXINE}`);
  press('Download every spectrum');

  expect(saved()).toStrictEqual(['Taxine B HCD53.jdx', 'spectra.jdx']);
});

test('a row closes its spectrum, and the toolbar closes every one', () => {
  press(`Close ${TAXINE}`);

  expect(handle.current?.getSpectra().map((one) => one.name)).toStrictEqual([
    AFLATOXIN,
  ]);

  press('Download every spectrum');

  expect(saved()).toStrictEqual(['Aflatoxin (macfile.jdx).jdx']);

  press('Close every spectrum');

  expect(handle.current?.getSpectra()).toStrictEqual([]);
  expect(host.textContent).toContain('No spectrum is open.');
});

test('the folder of the toolbar opens the file picker', () => {
  const picked = vi.spyOn(HTMLInputElement.prototype, 'click');

  press('Open spectra… (o)');

  expect(picked).toHaveBeenCalledOnce();
});
