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

    function report(): void {
      host.postMessage(
        { type: SHARE_REGIONS_MESSAGE, regions: measureRegions() },
        '*',
      );
    }

    // A chart, a web font or a structure drawn after mount all move the boxes,
    // so the page is measured again whenever anything in it resizes rather
    // than once, on a deadline it would lose.
    const observer = new ResizeObserver(report);
    observer.observe(document.documentElement);
    globalThis.addEventListener('resize', report);
    report();

    return () => {
      observer.disconnect();
      globalThis.removeEventListener('resize', report);
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
    regions.push({
      part,
      x: box.x + globalThis.scrollX,
      y: box.y + globalThis.scrollY,
      width: box.width,
      height: box.height,
    });
  }

  return regions;
}
