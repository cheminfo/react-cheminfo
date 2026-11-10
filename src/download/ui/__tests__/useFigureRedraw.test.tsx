// @vitest-environment jsdom
/**
 * A second copy of a figure, drawn off the page at another size for as long as
 * it takes to save it. Frames are fake timers; a drawing's box is the size its
 * attributes state, since jsdom lays nothing out.
 */

import type { ReactElement } from 'react';
import { act, useEffect } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { rect } from '../../core/__tests__/pageLayout.ts';
import type { FigureRedraw, FigureRenderer } from '../useFigureRedraw.tsx';
import { useFigureRedraw } from '../useFigureRedraw.tsx';

let host: HTMLDivElement;
let root: Root;
let redraw: FigureRedraw['redraw'] | undefined;

const SIZE = { width: 640, height: 360 };

const renderCopy: FigureRenderer = (size) => (
  <svg width={size.width} height={size.height}>
    <rect width={size.width} height={size.height} />
  </svg>
);

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'setTimeout'] });
  const measure = vi.spyOn(Element.prototype, 'getBoundingClientRect');
  measure.mockImplementation(() => {
    const element = measure.mock.contexts.at(-1);
    if (!(element instanceof SVGSVGElement)) return rect(0, 0, 0, 0);
    const width = Number(element.getAttribute('width'));
    const height = Number(element.getAttribute('height'));
    return rect(0, 0, width, height);
  });
  host = document.createElement('div');
  host.innerHTML =
    '<div id="plot" style="font-family: Georgia; font-size: 13px; line-height: 20px; color: rgb(1, 2, 3)"><svg width="200" height="100"></svg></div>' +
    '<div id="holder"><svg id="graph" width="200" height="100"></svg><p></p></div>';
  const section = document.createElement('section');
  host.append(section);
  document.body.append(host);
  root = createRoot(section);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  redraw = undefined;
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test('the copy is drawn beside the figure, out of sight and in its type, and saved once it stands still', async () => {
  mount(renderCopy);
  const seen: Array<{ box: HTMLElement; markup: string }> = [];

  const { done } = await start('plot', async (box) => {
    if (box instanceof HTMLElement) seen.push({ box, markup: box.innerHTML });
  });
  const box = document.querySelector('#plot')?.nextElementSibling;

  expect(box?.innerHTML).toBe(
    '<svg width="640" height="360"><rect width="640" height="360"></rect></svg>',
  );
  expect(box?.getAttribute('aria-hidden')).toBe('true');
  expect(box instanceof HTMLElement ? styleOf(box) : null).toStrictEqual({
    position: 'absolute',
    top: '0px',
    left: '-100000px',
    width: '640px',
    height: '360px',
    pointerEvents: 'none',
    fontFamily: 'Georgia',
    fontSize: '13px',
    lineHeight: '20px',
    color: 'rgb(1, 2, 3)',
  });
  expect(seen).toStrictEqual([]);

  await frames(3);
  await done;

  expect(seen).toStrictEqual([
    {
      box,
      markup:
        '<svg width="640" height="360"><rect width="640" height="360"></rect></svg>',
    },
  ]);
  expect(box?.isConnected).toBe(false);
});

test('a figure named by its drawing gets the box in the nearest element that can hold one', async () => {
  mount(renderCopy);
  const parents: Array<Element | null> = [];

  const { done } = await start('graph', async (box) => {
    parents.push(box.parentElement);
  });

  expect(document.querySelector('#holder')?.lastElementChild?.innerHTML).toBe(
    '<svg width="640" height="360"><rect width="640" height="360"></rect></svg>',
  );

  await frames(3);
  await done;

  expect(parents).toStrictEqual([document.querySelector('#holder')]);
});

test('a page left while the copy is drawing saves nothing, and takes the box away', async () => {
  mount(renderCopy);
  const save = vi.fn(async () => undefined);

  const { done } = await start('plot', save);
  const outcome = failureOf(done);
  const box = document.querySelector('#plot')?.nextElementSibling;
  act(() => {
    root.unmount();
  });
  root = createRoot(document.createElement('section'));
  await frames(1);

  await expect(outcome).resolves.toBe('The figure was not saved.');

  expect(save).not.toHaveBeenCalled();
  expect(box?.isConnected).toBe(false);
});

test('with nothing to draw the copy, the save is given up rather than waited on forever', async () => {
  mount(undefined);
  const save = vi.fn(async () => undefined);

  const { done } = await start('plot', save);
  const outcome = failureOf(done);

  expect(document.querySelector('#plot')?.nextElementSibling?.innerHTML).toBe(
    '',
  );

  await frames(600);

  await expect(outcome).resolves.toBe(
    'The figure did not finish drawing, so nothing was saved.',
  );

  expect(save).not.toHaveBeenCalled();
});

/**
 * Hands the hook's `redraw` out once it is rendered.
 * @param props - The props.
 * @param props.render - Draws the copy, or nothing.
 * @returns The copy being drawn, wherever the portal puts it.
 */
function Harness(props: { render?: FigureRenderer }): ReactElement {
  const { redraw: draw, portal } = useFigureRedraw(props.render);
  useEffect(() => {
    redraw = draw;
  });
  return <>{portal}</>;
}

function mount(render: FigureRenderer | undefined): void {
  act(() => {
    root.render(<Harness render={render} />);
  });
}

/**
 * Start a redraw, letting React draw the copy before any frame is painted.
 * @param targetId - The box the figure is mounted in.
 * @param save - Writes the copy.
 * @returns The redraw, still waiting for the copy to stand still.
 */
async function start(
  targetId: string,
  save: (box: Element) => Promise<void>,
): Promise<{ done: Promise<void> }> {
  let done: Promise<void> = Promise.resolve();
  await act(async () => {
    if (redraw === undefined) throw new Error('the hook is not rendered');
    done = redraw(targetId, SIZE, save);
  });
  // Wrapped, so awaiting the start does not also await the save.
  return { done };
}

/**
 * What a redraw failed with, read as soon as it is started so its rejection
 * is never left unhandled while the frames run.
 * @param done - The redraw.
 * @returns Its error message, or `saved`.
 */
function failureOf(done: Promise<void>): Promise<string> {
  return done.then(
    () => 'saved',
    (error: unknown) =>
      error instanceof Error ? error.message : String(error),
  );
}

async function frames(count: number): Promise<void> {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(count * 16 + 16);
  });
}

function styleOf(box: HTMLElement): Record<string, string> {
  const { position, top, left, width, height, pointerEvents } = box.style;
  const { fontFamily, fontSize, lineHeight, color } = box.style;
  return {
    position,
    top,
    left,
    width,
    height,
    pointerEvents,
    fontFamily,
    fontSize,
    lineHeight,
    color,
  };
}
