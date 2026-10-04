import { useEffect, useState } from 'react';

import type { ShareRegion } from '../core/index.ts';
import { SHARE_REGIONS_MESSAGE, isShareRegionsRequest } from '../core/index.ts';

/**
 * Report where each part of this page sits, while a share dialog is looking at
 * it through its preview.
 *
 * Nothing happens on a page nobody frames, and nothing happens in a frame
 * whose host never asks — a page embedded in a course is framed too, and owes
 * its host nothing.
 * @param hidden - The parts the link switches off, so the boxes are measured again when they change.
 * @returns Whether the page should mark its parts for the dialog to find.
 */
export function useShareRegionReports(hidden: ReadonlySet<string>): boolean {
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    const host = globalThis.parent;
    if (host === globalThis.self) return undefined;

    function onMessage(event: MessageEvent): void {
      if (isShareRegionsRequest(event.data)) setMarking(true);
    }

    globalThis.addEventListener('message', onMessage);
    return () => {
      globalThis.removeEventListener('message', onMessage);
    };
  }, []);

  useEffect(() => {
    if (!marking) return undefined;
    const host = globalThis.parent;
    let scheduled = 0;
    let reported = '';

    function report(): void {
      scheduled = 0;
      const regions = measureRegions();
      // A page that is drawing — a structure, a result, a chart — mutates many
      // times a second while its boxes stay where they are, and every message
      // sent re-renders the dialog on the other side. Only a move is news.
      const signature = JSON.stringify(regions);
      if (signature === reported) return;
      reported = signature;
      host.postMessage({ type: SHARE_REGIONS_MESSAGE, regions }, '*');
    }

    // A search that returns, a structure that draws and a font that lands all
    // move the boxes within a frame of each other, so the page is measured
    // once after them rather than once per notification.
    function schedule(): void {
      if (scheduled === 0) scheduled = requestAnimationFrame(report);
    }

    // A chart, a web font or a structure drawn after mount all move the boxes,
    // so the page is measured again whenever anything in it changes rather
    // than once, on a deadline it would lose. Watching its size is not enough:
    // a page laid out to the height of the viewport keeps that height while a
    // result appears inside a column of it, and the part nobody measured is
    // the one the reader is pointing at.
    const resizes = new ResizeObserver(schedule);
    resizes.observe(document.documentElement);
    resizes.observe(document.body);
    const mutations = new MutationObserver(schedule);
    mutations.observe(document.body, { childList: true, subtree: true });
    globalThis.addEventListener('resize', schedule);
    report();

    return () => {
      if (scheduled !== 0) cancelAnimationFrame(scheduled);
      resizes.disconnect();
      mutations.disconnect();
      globalThis.removeEventListener('resize', schedule);
    };
  }, [marking, hidden]);

  return marking;
}

function measureRegions(): ShareRegion[] {
  const markers = document.querySelectorAll<HTMLElement>('[data-share-part]');
  const range = document.createRange();
  const regions: ShareRegion[] = [];

  for (const marker of markers) {
    const { sharePart: part } = marker.dataset;
    if (part === undefined) continue;
    // The marker lays out as `display: contents`, so it has no box of its own.
    // A range over what it holds has the box its contents occupy.
    range.selectNodeContents(marker);
    const box = range.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) continue;
    // Rounded, so a layout that settles half a pixel to the left is not
    // reported as a part that moved.
    regions.push({
      part,
      x: Math.round(box.x + globalThis.scrollX),
      y: Math.round(box.y + globalThis.scrollY),
      width: Math.round(box.width),
      height: Math.round(box.height),
    });
  }

  return regions;
}
