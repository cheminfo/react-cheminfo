import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { FigurePixels } from '../core/figureScale.ts';
import { whenFigureSettles } from '../core/figureSettle.ts';
import { figureElement } from '../core/figureTarget.ts';

/** Draws a figure at the size asked for, for a file. */
export type FigureRenderer = (size: FigurePixels) => ReactNode;

/** What {@link useFigureRedraw} hands back. */
export interface FigureRedraw {
  /**
   * Draw the figure off the page at a size, wait for it to settle, and hand
   * the box it was drawn in to `save`.
   */
  redraw: (
    targetId: string,
    size: FigurePixels,
    save: (box: Element) => Promise<void>,
  ) => Promise<void>;
  /** The copy being drawn, to be rendered anywhere in the caller's tree. */
  portal: ReactNode;
}

interface RedrawJob {
  /** The box off the page the copy is drawn in. */
  box: HTMLElement;
  /** The size it is drawn at. */
  size: FigurePixels;
}

/**
 * A second copy of a figure, drawn at another size for as long as it takes to
 * save it.
 *
 * The copy is rendered through a portal, so it sees every provider the figure
 * on the page sees, and the portal's box is placed next to the figure's own,
 * so it inherits the same tokens and the same type. It sits far to the left of
 * the page, out of sight, and is taken away once the file is written.
 * @param render - Draws the figure at a size.
 * @returns See {@link FigureRedraw}.
 */
export function useFigureRedraw(render?: FigureRenderer): FigureRedraw {
  const [job, setJob] = useState<RedrawJob | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  async function redraw(
    targetId: string,
    size: FigurePixels,
    save: (box: Element) => Promise<void>,
  ): Promise<void> {
    const box = mountRedrawBox(figureElement(targetId), size);
    const controller = new AbortController();
    controllerRef.current = controller;
    setJob({ box, size });
    try {
      await whenFigureSettles(box, { signal: controller.signal });
      await save(box);
    } finally {
      controllerRef.current = null;
      setJob(null);
      box.remove();
    }
  }

  const portal =
    job === null || render === undefined
      ? null
      : createPortal(render(job.size), job.box);

  return { redraw, portal };
}

/**
 * The box the copy is drawn in, beside the figure it copies.
 *
 * Its type is copied from the figure's box, since a chart inherits its labels'
 * size from wherever it is mounted and the copy is mounted one level up.
 * @param target - The box the figure on the page is mounted in.
 * @param size - The size the copy is drawn at.
 * @returns The box, already in the document.
 */
function mountRedrawBox(target: Element, size: FigurePixels): HTMLElement {
  const box = document.createElement('div');
  box.setAttribute('aria-hidden', 'true');
  box.inert = true;
  const type = window.getComputedStyle(target);
  Object.assign(box.style, {
    position: 'absolute',
    top: '0',
    left: '-100000px',
    width: `${size.width}px`,
    height: `${size.height}px`,
    pointerEvents: 'none',
    fontFamily: type.fontFamily,
    fontSize: type.fontSize,
    lineHeight: type.lineHeight,
    color: type.color,
  });

  if (target instanceof HTMLElement) {
    target.after(box);
    return box;
  }
  // A figure named by its `<svg>` gets the box beside the nearest element
  // that may hold a `<div>`.
  let host: Element | null = target;
  while (host instanceof SVGElement) host = host.parentElement;
  (host ?? document.body).append(box);
  return box;
}
