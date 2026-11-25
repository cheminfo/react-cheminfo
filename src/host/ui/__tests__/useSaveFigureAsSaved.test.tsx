// @vitest-environment jsdom
/**
 * Save as tells the site once the file is handed to the browser, and only
 * then: never on a cancel, a failure, or while there is nothing to save.
 */

import { Blob as NodeBlob } from 'node:buffer';

import type { ReactElement } from 'react';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { useSaveFigureAs } from '../useSaveFigureAs.tsx';

const downloads = vi.hoisted(() => [] as string[]);

vi.mock('../../../download/core/downloadBlob.ts', () => ({
  downloadBlob: (_blob: Blob, name: string) => {
    downloads.push(name);
  },
}));

const SVG =
  '<svg xmlns="http://www.w3.org/2000/svg"><title>cells</title></svg>';

let host: HTMLDivElement;
let root: Root;
const saved: Array<{ name: string; format: 'svg' | 'document' }> = [];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  // zip.js writes the document from Node's Blob, not jsdom's.
  vi.stubGlobal('Blob', NodeBlob);
  downloads.length = 0;
  saved.length = 0;
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

function Saving(props: {
  figure: () => Promise<string | undefined>;
}): ReactElement {
  const saveAs = useSaveFigureAs({
    site: 'image',
    figure: props.figure,
    stem: () => 'cells',
    onSaved: (choice) => {
      saved.push(choice);
    },
  });
  return (
    <>
      <button type="button" id="save-as" onClick={saveAs.open} />
      {saveAs.dialog}
    </>
  );
}

function open(figure: () => Promise<string | undefined>): void {
  act(() => {
    root.render(<Saving figure={figure} />);
  });
  act(() => {
    document.querySelector<HTMLButtonElement>('#save-as')?.click();
  });
}

async function submit(settled: () => void): Promise<void> {
  await act(async () => {
    document.querySelector('form')?.requestSubmit();
    await vi.waitFor(settled, { timeout: 10_000 });
  });
}

test('saving the figure tells the site once, with the name and the format', async () => {
  open(async () => SVG);

  await submit(() => {
    expect(downloads).toHaveLength(1);
  });

  expect(downloads).toStrictEqual(['cells.image.svg']);
  expect(saved).toStrictEqual([{ name: 'cells', format: 'svg' }]);
});

test('saving the document tells the site once, after it is handed over', async () => {
  open(async () => SVG);
  act(() => {
    document
      .querySelector<HTMLInputElement>('input[value="document"]')
      ?.click();
  });

  await submit(() => {
    expect(downloads).toHaveLength(1);
  });

  expect(downloads).toStrictEqual(['cells.image.zip']);
  expect(saved).toStrictEqual([{ name: 'cells', format: 'document' }]);
});

test('a dialog closed without saving tells nothing', () => {
  open(async () => SVG);

  expect(document.body.querySelector('.bp6-overlay-open')).not.toBeNull();

  act(() => {
    [...document.querySelectorAll('button')]
      .find((button) => button.textContent === 'Cancel')
      ?.click();
  });

  expect(document.body.querySelector('.bp6-overlay-open')).toBeNull();
  expect(downloads).toStrictEqual([]);
  expect(saved).toStrictEqual([]);
});

test('a figure with nothing to save tells nothing', async () => {
  let asked = 0;
  open(async () => {
    asked++;
    return undefined;
  });

  await submit(() => {
    expect(asked).toBe(1);
  });

  expect(downloads).toStrictEqual([]);
  expect(saved).toStrictEqual([]);
});

test('a save that fails says why, and tells nothing', async () => {
  open(() => Promise.reject(new Error('The figure could not be drawn.')));

  await act(async () => {
    document.querySelector('form')?.requestSubmit();
  });
  await act(async () => {
    await Promise.resolve();
  });

  expect(document.body.querySelector('.bp6-alert-contents')?.textContent).toBe(
    'The figure could not be drawn.',
  );
  expect(downloads).toStrictEqual([]);
  expect(saved).toStrictEqual([]);
});
