// @vitest-environment jsdom
/**
 * A narrow share dialog shows its options and its preview as two tabs, the
 * part pointed at in its list is drawn in the preview, and a protected link is
 * handed out only once it is sealed — always framed.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { ShareVocabulary } from '../../core/index.ts';
import { openSealedAddress, sealShareUrl } from '../../core/index.ts';
import type { ShareDialogProps } from '../ShareDialog.tsx';
import { ShareDialog } from '../ShareDialog.tsx';

import { until } from './until.ts';

const VOCABULARY: ShareVocabulary = {
  parts: [{ key: 'answers', label: 'The answers', description: 'The list.' }],
  params: {},
};

const BASE = 'https://isomers.cheminfo.org/exercises';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  delete (Element.prototype as Partial<Element>).scrollIntoView;
  vi.unstubAllGlobals();
});

function render(props: Partial<ShareDialogProps> = {}): void {
  act(() => {
    root.render(
      <ShareDialog
        isOpen
        usePortal={false}
        onClose={() => undefined}
        vocabulary={VOCABULARY}
        title="Exercises"
        baseUrl={BASE}
        search="formulas=C4H10O"
        {...props}
      />,
    );
  });
}

function link(): string | null {
  const anchor = [...host.querySelectorAll('a')].find(
    (candidate) => candidate.textContent === 'Open in a new tab',
  );
  return anchor?.getAttribute('href') ?? null;
}

function row(label: string): HTMLElement {
  const found = [...host.querySelectorAll<HTMLElement>('.share-part')].find(
    (candidate) =>
      candidate.querySelector('.share-part__label')?.textContent === label,
  );
  if (found === undefined) throw new Error(`no row ${label}`);
  return found;
}

function flip(label: string): void {
  act(() => {
    row(label).querySelector<HTMLInputElement>('input')?.click();
  });
}

test('a dialog too narrow for two panes shows them as two tabs', () => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      readonly #callback: ResizeObserverCallback;

      constructor(callback: ResizeObserverCallback) {
        this.#callback = callback;
      }

      observe(): void {
        this.#callback(
          [{ contentRect: { width: 600, height: 500 } } as ResizeObserverEntry],
          this as unknown as ResizeObserver,
        );
      }

      disconnect(): void {
        // Nothing is observed.
      }
    },
  );
  render();
  const tab = (name: string) =>
    [...host.querySelectorAll<HTMLElement>('[role="tab"]')].find(
      (candidate) => candidate.textContent === name,
    );

  expect(tab('Options')?.getAttribute('aria-selected')).toBe('true');
  expect(host.querySelector('.share-dialog__options')).not.toBeNull();
  expect(host.querySelector('.share-preview')).toBeNull();

  act(() => {
    tab('Preview')?.click();
  });

  expect(host.querySelector('.share-dialog__options')).toBeNull();
  expect(host.querySelector('.share-preview iframe')?.getAttribute('src')).toBe(
    `${BASE}?formulas=C4H10O&embed=1`,
  );
});

test('the part pointed at in the list is the one drawn in the preview', () => {
  // jsdom scrolls nothing; the preview brings the part it draws into view.
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  });
  render();
  const frame = host.querySelector('iframe');
  const event = new Event('message');
  Object.defineProperties(event, {
    data: {
      value: {
        type: 'cheminfo:share-regions',
        regions: [{ part: 'answers', x: 0, y: 40, width: 200, height: 30 }],
      },
    },
    source: { value: frame?.contentWindow },
  });
  act(() => {
    globalThis.dispatchEvent(event);
  });

  expect(host.querySelector('.share-preview__region')).toBeNull();

  act(() => {
    row('The answers').dispatchEvent(
      new MouseEvent('mouseover', { bubbles: true }),
    );
  });

  expect(host.querySelector('.share-preview__region')?.textContent).toBe(
    'The answers',
  );

  act(() => {
    row('The answers').dispatchEvent(
      new MouseEvent('mouseout', { bubbles: true, relatedTarget: host }),
    );
  });

  expect(host.querySelector('.share-preview__region')).toBeNull();

  act(() => {
    row('The answers')
      .querySelector('input')
      ?.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
  });

  expect(host.querySelector('.share-preview__region')?.textContent).toBe(
    'The answers',
  );

  act(() => {
    row('The answers')
      .querySelector('input')
      ?.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
  });

  expect(host.querySelector('.share-preview__region')).toBeNull();
});

test('a protected link is handed out once sealed, and leaving the frame drops the seal', async () => {
  await openSealedAddress(undefined);
  const sealed = await sealShareUrl(`${BASE}?formulas=C4H10O&embed=1`);
  render({ preview: false });

  expect(link()).toBe(`${BASE}?formulas=C4H10O&embed=1`);

  flip('Protect this link');

  expect(link()).toBeNull();

  await until(() => link() !== null);

  expect(link()).toBe(sealed);

  flip('Embed in another page');

  expect(link()).toBe(`${BASE}?formulas=C4H10O`);
  expect(
    host.querySelector<HTMLInputElement>('.share-part input')?.checked,
  ).toBe(false);
});
