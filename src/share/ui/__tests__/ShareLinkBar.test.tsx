// @vitest-environment jsdom
/**
 * What the dialog's three buttons put on the clipboard.
 *
 * Neither the address nor the frame markup is printed in the dialog any more,
 * so the clipboard is the only way either reaches the person sharing the page,
 * and a static render cannot see it: the markup lives in a prop.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { ShareVocabulary } from '../../core/index.ts';
import { ShareDialog } from '../ShareDialog.tsx';

const VOCABULARY: ShareVocabulary = {
  parts: [
    { key: 'menu', label: 'The other sets', description: 'The capsules.' },
  ],
  params: {},
};

const BASE = 'https://smiles.cheminfo.org/exercises';

let host: HTMLDivElement;
let root: Root;
const written: string[] = [];
const dialog = { closed: 0, refuse: false };

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('ResizeObserver', NoResizeObserver);
  vi.stubGlobal('navigator', {
    clipboard: {
      writeText: (text: string) => {
        if (dialog.refuse) return Promise.reject(new Error('denied'));
        written.push(text);
        return Promise.resolve();
      },
    },
  });
  written.length = 0;
  dialog.closed = 0;
  dialog.refuse = false;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

async function clickButton(label: string): Promise<void> {
  await act(async () => {
    root.render(
      <ShareDialog
        isOpen
        usePortal={false}
        onClose={() => {
          dialog.closed += 1;
        }}
        vocabulary={VOCABULARY}
        title="Exercises"
        frameTitle="SMILES — Exercises"
        frameHeight={800}
        baseUrl={BASE}
        search="set=alkanes"
        preview={false}
      />,
    );
  });
  const button = [...host.querySelectorAll('button')].find(
    (candidate) => candidate.textContent === label,
  );
  if (button === undefined) throw new Error(`no button reading "${label}"`);
  await act(async () => {
    button.click();
  });
}

test('the first button copies the address the options are writing', async () => {
  await clickButton('Copy the link');

  expect(written).toStrictEqual([`${BASE}?set=alkanes&embed=1`]);
  expect(dialog.closed).toBe(1);
});

test('a refused copy leaves the dialog open, so the failure is seen', async () => {
  dialog.refuse = true;
  await clickButton('Copy the link');

  expect(written).toStrictEqual([]);
  expect(dialog.closed).toBe(0);
});

test('the third copies a frame carrying the name and the height it was given', async () => {
  await clickButton('Copy the iframe');

  expect(written).toStrictEqual([
    `<iframe src="${BASE}?set=alkanes&amp;embed=1" title="SMILES — Exercises" width="100%" height="800" style="border: 1px solid #ddd; border-radius: 8px" loading="lazy"></iframe>`,
  ]);
  expect(dialog.closed).toBe(1);
});

/** A `ResizeObserver` that observes nothing, for a DOM where nothing resizes. */
class NoResizeObserver implements ResizeObserver {
  public observe(): void {
    /* nothing is ever measured */
  }

  public unobserve(): void {
    /* nothing was ever measured */
  }

  public disconnect(): void {
    /* nothing to stop watching */
  }
}
