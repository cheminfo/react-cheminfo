// @vitest-environment jsdom

import { Blob as NodeBlob } from 'node:buffer';

import type { ReactElement } from 'react';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { readSiteDocument } from '../../../storage/core/siteDocument.ts';
import { useSaveFigureAs } from '../useSaveFigureAs.tsx';

const downloads = vi.hoisted(() => [] as Array<{ blob: Blob; name: string }>);

vi.mock('../../../download/core/downloadBlob.ts', () => ({
  downloadBlob: (blob: Blob, name: string) => {
    downloads.push({ blob, name });
  },
}));

const SVG =
  '<svg xmlns="http://www.w3.org/2000/svg"><title>plate</title></svg>';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  // A browser has one Blob. Under jsdom on Node 22, zip.js wraps the Blob
  // Node's `Response` returns in jsdom's, which writes it as "[object Blob]".
  vi.stubGlobal('Blob', NodeBlob);
  downloads.length = 0;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
});

function Saving(props: { keepsWorkspace: boolean }): ReactElement {
  const saveAs = useSaveFigureAs({
    site: 'plate',
    figure: async () => SVG,
    stem: () => 'tlc-plate',
    ...(props.keepsWorkspace
      ? { workspace: () => ({ lanes: 4, scale: 'linear' }) }
      : {}),
  });
  return (
    <>
      <button type="button" id="save-as" onClick={saveAs.open} />
      {saveAs.dialog}
    </>
  );
}

function render(keepsWorkspace = true): void {
  act(() => {
    root.render(<Saving keepsWorkspace={keepsWorkspace} />);
  });
  act(() => {
    document.querySelector<HTMLButtonElement>('#save-as')?.click();
  });
}

async function submit(): Promise<void> {
  await act(async () => {
    document.querySelector('form')?.requestSubmit();
    await vi.waitFor(
      () => {
        expect(downloads).toHaveLength(1);
      },
      { timeout: 10_000 },
    );
  });
}

function labels(): string[] {
  return [...document.querySelectorAll('.bp6-control')].map(
    (control) => control.textContent ?? '',
  );
}

test('Save as offers the SVG first, and the document with its workspace, never the view', () => {
  render();

  expect(labels()).toStrictEqual([
    'SVG picture that opens here again .plate.svg',
    'Document: the same picture, with what you tick below .plate.zip',
    'The workspaceIt opens with these panels and their settings.',
  ]);
  expect(document.querySelector('.input-affix input')).toHaveProperty(
    'value',
    'tlc-plate',
  );
  expect(
    document.querySelector<HTMLInputElement>('input[value="svg"]')?.checked,
  ).toBe(true);
});

test("the SVG is saved under the site's extension", async () => {
  render();

  await submit();

  expect(downloads.map(({ name }) => name)).toStrictEqual([
    'tlc-plate.plate.svg',
  ]);
  await expect(downloads[0]?.blob.text()).resolves.toBe(SVG);
});

test('the document holds the same figure, and the preferences as its workspace', async () => {
  render();
  act(() => {
    document
      .querySelector<HTMLInputElement>('input[value="document"]')
      ?.click();
  });

  await submit();

  expect(downloads.map(({ name }) => name)).toStrictEqual([
    'tlc-plate.plate.zip',
  ]);

  const saved = await readSiteDocument(
    downloads[0]?.blob ?? new Blob(),
    'plate',
  );

  expect(saved.data.map(({ path }) => path)).toStrictEqual([
    'tlc-plate.plate.svg',
  ]);
  expect(saved.data[0]?.text()).toBe(SVG);
  expect(saved.preferences).toMatchObject({
    name: 'tlc-plate',
    preferences: { lanes: 4, scale: 'linear' },
  });
});

test('a site keeping no workspace saves its document with the figure alone', async () => {
  render(false);

  expect(labels()).toHaveLength(2);

  act(() => {
    document
      .querySelector<HTMLInputElement>('input[value="document"]')
      ?.click();
  });

  await submit();

  const saved = await readSiteDocument(
    downloads[0]?.blob ?? new Blob(),
    'plate',
  );

  expect(saved.preferences).toBeUndefined();
});
