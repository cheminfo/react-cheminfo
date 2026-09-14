import type { KeyboardEvent } from 'react';
import { useRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { useActiveHeading } from '../useActiveHeading.ts';
import { useAsync } from '../useAsync.ts';
import { useContainerSize } from '../useContainerSize.ts';
import { useDebouncedValue } from '../useDebouncedValue.ts';
import { useDocumentListNavigation } from '../useDocumentListNavigation.ts';
import { useListKeyboardNavigation } from '../useListKeyboardNavigation.ts';
import { usePolling } from '../usePolling.ts';
import { useResizeObserver } from '../useResizeObserver.ts';

const neverSettles = () =>
  new Promise<number>(() => {
    // Never settles, so the first render is all there is to read.
  });

test('a task, a poll and a heading all start from nothing on the first render', () => {
  function Probe() {
    const task = useAsync(neverSettles);
    const poll = usePolling(neverSettles, { interval: 1000 });
    const heading = useActiveHeading(null);
    return (
      <output>
        {task.status} {String(poll.value)} {String(poll.done)} {String(heading)}
      </output>
    );
  }

  expect(renderToStaticMarkup(<Probe />)).toBe(
    '<output>loading undefined false null</output>',
  );
});

test('a document-navigated list renders with its container ref attached', () => {
  function Probe() {
    const listRef = useDocumentListNavigation<HTMLUListElement>({
      length: 3,
      selectedIndex: 1,
      onSelect: () => null,
    });
    return (
      <ul ref={listRef}>
        <li data-selected="true">ethanol</li>
      </ul>
    );
  }

  expect(renderToStaticMarkup(<Probe />)).toBe(
    '<ul><li data-selected="true">ethanol</li></ul>',
  );
});

test('a resize observer given no element yet renders instead of throwing', () => {
  function Probe() {
    useResizeObserver(null, () => {
      throw new Error('nothing to observe');
    });
    return <div>viewer</div>;
  }

  expect(renderToStaticMarkup(<Probe />)).toBe('<div>viewer</div>');
});

test('a debounced value starts on its source, so nothing flashes empty', () => {
  function Probe() {
    return <output>{useDebouncedValue('benzene', 400)}</output>;
  }

  expect(renderToStaticMarkup(<Probe />)).toBe('<output>benzene</output>');
});

test('a container that has not been measured yet reads as no size at all', () => {
  function Probe() {
    const ref = useRef<HTMLDivElement>(null);
    const { width, height } = useContainerSize(ref);
    return (
      <div ref={ref}>
        {width}×{height}
      </div>
    );
  }

  expect(renderToStaticMarkup(<Probe />)).toBe('<div>0×0</div>');
});

test('a page with no ResizeObserver renders instead of throwing', () => {
  function Probe() {
    const ref = useRef<HTMLDivElement>(null);
    useResizeObserver(ref, () => {
      throw new Error('nothing is observed where nothing can be measured');
    });
    return <div ref={ref}>chart</div>;
  }

  expect(renderToStaticMarkup(<Probe />)).toBe('<div>chart</div>');
});

test('the navigation hook hands back a handler that selects the next entry', () => {
  const selected: number[] = [];
  let prevented = 0;
  let handler: ((event: KeyboardEvent<HTMLElement>) => void) | null = null;

  function Probe() {
    handler = useListKeyboardNavigation({
      length: 4,
      selectedIndex: 0,
      onSelect: (index) => selected.push(index),
    });
    return <div tabIndex={0} onKeyDown={handler} />;
  }

  renderToStaticMarkup(<Probe />);
  const onKeyDown = handler as unknown as (event: unknown) => void;
  onKeyDown({
    key: 'End',
    preventDefault: () => {
      prevented += 1;
    },
  });

  expect(selected).toStrictEqual([3]);
  expect(prevented).toBe(1);
});
