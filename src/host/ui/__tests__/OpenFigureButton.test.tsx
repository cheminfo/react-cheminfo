// @vitest-environment jsdom
/**
 * Opening a figure the site drew, from a file picked: a figure of the site
 * opens as it was drawn, a document with its workspace, one of another site is
 * sent on there once the reader agrees, and anything else is said to hold no
 * figure.
 */

import { Blob as NodeBlob, File as NodeFile } from 'node:buffer';

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { setFigureRevision } from '../../../download/core/figureRevision.ts';
import { withFigureSource } from '../../../download/core/figureSource.ts';
import { writeSiteDocument } from '../../../storage/core/siteDocument.ts';
import type { OpenFigureButtonProps } from '../OpenFigureButton.tsx';
import { OpenFigureButton } from '../OpenFigureButton.tsx';

import { until } from './until.ts';

const FIGURE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"><rect width="40" height="20"/></svg>';
const STATE = { version: 1, value: { plate: { lanes: 3 } } };
const SAVED = 'https://1a2b3c4d.plate-cheminfo.pages.dev';
const RUNNING = 'https://9f8e7d6c.plate-cheminfo.pages.dev';

let host: HTMLDivElement;
let root: Root;
let forget: () => void;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  forget = setFigureRevision('plate', { deployment: RUNNING });
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  document.body.innerHTML = '';
  forget();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function figureOf(site: string, revision?: string): Promise<string> {
  return withFigureSource(FIGURE, {
    site,
    href: `https://${site}.cheminfo.org/?embed=1`,
    data: STATE,
    ...(revision === undefined ? {} : { revision }),
  });
}

async function render(props: Partial<OpenFigureButtonProps>): Promise<void> {
  await act(async () => {
    root.render(
      <OpenFigureButton site="plate" onOpen={vi.fn()} host="draw" {...props} />,
    );
    await Promise.resolve();
  });
}

function picker(): HTMLInputElement {
  const input = host.querySelector<HTMLInputElement>(
    '[data-testid="open-figure-input"]',
  );
  if (input === null) throw new Error('no file picker');
  return input;
}

async function pick(file: File): Promise<void> {
  const input = picker();
  Object.defineProperty(input, 'files', { value: [file], configurable: true });
  await act(async () => {
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

function alertText(): string | null {
  return (
    document.body.querySelector('.bp6-alert-contents')?.textContent ?? null
  );
}

function bodyButton(text: string): HTMLButtonElement | undefined {
  return [...document.body.querySelectorAll('button')].find(
    (button) => button.textContent === text,
  );
}

test('the button opens the file picker, for an SVG or a document', async () => {
  await render({});
  const button = host.querySelector('button');
  const click = vi.spyOn(picker(), 'click').mockImplementation(() => {
    // jsdom opens no picker.
  });

  expect(button?.textContent).toBe('Open');
  expect(button?.className).toContain('no-print');
  expect(button?.title).toBe(
    'Open a figure saved from this site, as an SVG or a document, as it was drawn.',
  );
  expect(picker().accept).toBe('.svg,image/svg+xml,.zip,application/zip');

  act(() => {
    button?.click();
  });

  expect(click).toHaveBeenCalledOnce();
});

test('a figure of the site opens as it was, and one saved elsewhere offers its own deployment', async () => {
  const onOpen = vi.fn();
  await render({ onOpen });
  await pick(new File([await figureOf('plate', SAVED)], 'plate.svg'));
  await until(() => bodyButton('Original version') !== undefined);

  expect(onOpen.mock.calls).toStrictEqual([
    [
      {
        site: 'plate',
        href: 'https://plate.cheminfo.org/?embed=1',
        data: STATE,
        edited: false,
      },
    ],
  ]);
  expect(bodyButton('Original version')?.title).toBe(
    'Open this figure in a new tab, in the version of the site that saved it.',
  );
  expect(alertText()).toBeNull();
  expect(picker().value).toBe('');
});

test('a document of the site opens on its figure, then takes its workspace', async () => {
  // A browser has one Blob. Under jsdom on Node 22, zip.js wraps the Blob
  // Node's `Response` returns in jsdom's, which reads back as "[object Blob]".
  vi.stubGlobal('Blob', NodeBlob);
  vi.stubGlobal('File', NodeFile);
  const onOpen = vi.fn();
  const onWorkspace = vi.fn();
  const workspace = { id: 'w1', name: 'Plate', preferences: { lanes: 4 } };
  const document = await writeSiteDocument(
    {
      data: [{ path: 'plate.plate.svg', content: await figureOf('plate') }],
      preferences: workspace,
    },
    { site: 'plate' },
  );
  await render({ onOpen, onWorkspace });
  await pick(new File([document], 'plate.plate.zip'));
  await until(() => onWorkspace.mock.calls.length > 0);

  expect(onOpen).toHaveBeenCalledOnce();
  expect(onWorkspace.mock.calls).toStrictEqual([[workspace]]);
});

test('a figure of another site is sent there once the reader agrees', async () => {
  const open = vi.fn<typeof globalThis.open>(() => null);
  vi.stubGlobal('open', open);
  const onOpen = vi.fn();
  await render({ onOpen });
  await pick(new File([await figureOf('lcao')], 'orbitals.svg'));
  await until(() => alertText() !== null);

  expect(alertText()).toBe(
    'This figure was drawn on lcao.cheminfo.org, and opens there as it was.',
  );
  expect(onOpen).not.toHaveBeenCalled();

  act(() => {
    bodyButton('Open on lcao.cheminfo.org')?.click();
  });

  expect(open.mock.calls).toStrictEqual([
    ['https://lcao.cheminfo.org/', '_blank'],
  ]);
});

test('a figure sent elsewhere stays put when the reader cancels', async () => {
  const open = vi.fn<typeof globalThis.open>(() => null);
  vi.stubGlobal('open', open);
  await render({});
  await pick(new File([await figureOf('lcao')], 'orbitals.svg'));
  await until(() => alertText() !== null);

  act(() => {
    bodyButton('Cancel')?.click();
  });

  expect(open).not.toHaveBeenCalled();
});

test('a file holding no figure of the site says so, and so does one the site cannot open', async () => {
  await render({});
  await pick(new File(['C6H6'], 'notes.txt'));
  await until(() => alertText() !== null);

  expect(alertText()).toBe('notes.txt holds no figure of this site to open.');

  act(() => {
    bodyButton('Close')?.click();
  });
  await render({
    onOpen: () => Promise.reject(new Error('This plate has no lanes.')),
  });
  await pick(new File([await figureOf('plate')], 'broken.svg'));
  await until(() => alertText()?.startsWith('broken') === true);

  expect(alertText()).toBe('broken.svg holds no figure of this site to open.');
});
