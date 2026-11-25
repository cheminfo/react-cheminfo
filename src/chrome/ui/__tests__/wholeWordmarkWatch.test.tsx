// @vitest-environment jsdom
/**
 * The bar measures the brand's room again when a part of its row changes
 * size, not only the row itself: a utility arriving after the first paint
 * narrows the brand while the row keeps its width, and the name, now cut,
 * gives way to the mark. A render that changes no size and no name measures
 * nothing.
 */

import type { ReactElement } from 'react';
import { act, useRef } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { useWholeWordmark } from '../useWholeWordmark.ts';

/** What the bar's observer watches, and how the test makes it report. */
const watch = { observed: [] as Element[], report: () => undefined as void };

/** A ResizeObserver that reports when the test says a size changed. */
class ReportingObserver {
  constructor(callback: () => void) {
    watch.report = callback;
  }

  observe(element: Element): void {
    watch.observed.push(element);
  }

  disconnect(): void {
    watch.observed = [];
  }
}

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('ResizeObserver', ReportingObserver);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

/** What the test hands the bar. */
interface BarProps {
  /**
   * The site whose name the bar writes.
   * @default 'image'
   */
  site?: string;
  /**
   * What its pages read, which changes no size the bar is measured on.
   * @default 'Pages'
   */
  pages?: string;
}

/**
 * A bar's row as the header lays it out: the brand, the pages, the spacer
 * and the utilities.
 * @param props - See {@link BarProps}.
 * @returns The row, saying whether the mark is alone.
 */
function Bar(props: BarProps): ReactElement {
  const { site = 'image', pages = 'Pages' } = props;
  const bar = useRef<HTMLDivElement>(null);
  const markOnly = useWholeWordmark(bar, site);
  return (
    <div ref={bar} data-mark-only={String(markOnly)}>
      <a className="brand" href="/">
        <span className="wordmark">{site}.cheminfo</span>
      </a>
      <nav className="app-header-nav">{pages}</nav>
      <span className="spacer" />
      <div className="app-header-actions" />
    </div>
  );
}

/**
 * A part of the bar, which the test needs drawn.
 * @param selector - Where it is.
 * @returns The element.
 */
function drawn(selector: string): HTMLElement {
  const element = host.querySelector<HTMLElement>(selector);
  if (element === null) throw new Error(`${selector} is drawn`);
  return element;
}

test('the row and each of its parts are watched, and a part narrowing the name to a cut gives the bar to the mark', () => {
  act(() => root.render(<Bar />));
  const row = drawn('[data-mark-only]');
  const word = drawn('.wordmark');
  const watched = watch.observed.map((element) =>
    element === row ? 'row' : element.className,
  );
  const before = row.dataset.markOnly;
  Object.defineProperty(word, 'scrollWidth', { value: 120 });
  Object.defineProperty(word, 'clientWidth', { value: 80 });
  act(() => watch.report());

  expect(watched).toStrictEqual([
    'row',
    'brand',
    'app-header-nav',
    'spacer',
    'app-header-actions',
  ]);
  expect([before, row.dataset.markOnly]).toStrictEqual(['false', 'true']);
});

test('a render that changes neither a size nor the name measures nothing, and another name is measured anew', () => {
  act(() => root.render(<Bar />));
  const word = drawn('.wordmark');
  let measured = 0;
  Object.defineProperty(word, 'scrollWidth', {
    get: () => {
      measured++;
      return 100;
    },
  });
  Object.defineProperty(word, 'clientWidth', { value: 100 });
  act(() => root.render(<Bar pages="Pages and tools" />));
  const unchanged = measured;
  act(() => root.render(<Bar site="smiles" pages="Pages and tools" />));

  expect([unchanged, measured]).toStrictEqual([0, 1]);
});
