// @vitest-environment jsdom
/**
 * A figure handed to a document, drawn again at the document's size when the
 * page registered a way to, and copied as it is on screen otherwise. Frames
 * are fake timers; a drawing's box is the size its attributes state, since
 * jsdom lays nothing out.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { rect } from '../../core/__tests__/pageLayout.ts';
import {
  DOCUMENT_FIGURE_SIZE,
  documentFigureSvg,
} from '../../core/documentFigure.ts';
import type { FigureSvg } from '../../core/figureSvg.ts';
import { useDocumentFigure } from '../useDocumentFigure.tsx';
import type { FigureRenderer } from '../useFigureRedraw.tsx';

let host: HTMLDivElement;
let root: Root;

const renderCopy: FigureRenderer = (size) => (
  <svg
    width={size.width}
    height={size.height}
    viewBox={`0 0 ${size.width} ${size.height}`}
  >
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
    '<div id="plot"><svg width="1000" height="450" viewBox="0 0 1000 450"><rect width="1000" height="450"></rect></svg></div>';
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
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test('a figure nobody registered is copied at the size it has on screen', async () => {
  const figure = await documentFigureSvg('plot');

  expect(sizeOf(figure)).toStrictEqual({ width: 1000, height: 450 });
});

test('a registered figure is drawn again at the document size, and the copy is taken away', async () => {
  act(() => {
    root.render(<Harness id="plot" render={renderCopy} />);
  });

  const figure = await drawn('plot');

  expect(DOCUMENT_FIGURE_SIZE).toStrictEqual({ width: 480, height: 300 });
  expect(sizeOf(figure)).toStrictEqual({ width: 480, height: 300 });
  expect(rootTag(figure.markup)).toMatch(/ width="480" height="300" /);
  expect(document.querySelector('#plot')?.nextElementSibling?.tagName).toBe(
    'SECTION',
  );
});

test('once the page that registered it is gone, the figure is copied as it is again', async () => {
  act(() => {
    root.render(<Harness id="plot" render={renderCopy} />);
  });
  act(() => {
    root.render(null);
  });

  const figure = await documentFigureSvg('plot');

  expect(sizeOf(figure)).toStrictEqual({ width: 1000, height: 450 });
});

function Harness(props: { id: string; render: FigureRenderer }) {
  const portal = useDocumentFigure(props.id, props.render);
  return <>{portal}</>;
}

/**
 * Ask for the figure, and let the copy be drawn and stand still.
 * @param target - The box the figure is mounted in.
 * @returns The figure.
 */
async function drawn(target: string): Promise<FigureSvg> {
  let pending: Promise<FigureSvg> | undefined;
  await act(async () => {
    pending = documentFigureSvg(target);
  });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(5 * 16);
  });
  if (pending === undefined) throw new Error('the figure was not asked for');
  return pending;
}

function sizeOf(figure: FigureSvg): { width: number; height: number } {
  return { width: figure.width, height: figure.height };
}

function rootTag(markup: string): string {
  return /<svg\b[^>]*>/.exec(markup)?.[0] ?? '';
}
