/**
 * What a page of the family shows, read for a browser suite to hold against
 * what it expects: whether pictures loaded, where the footer starts against
 * the fold, and what the About's build badge reads.
 */

import type { Locator } from '@playwright/test';

import { UNRELEASED_VERSION } from '../build/core/buildInfo.ts';

/** Where an element starts against the bottom of the window. */
export interface FoldReading {
  /** The element's top, in the viewport's pixels. */
  top: number;
  /** The window's height: the fold. */
  fold: number;
}

/**
 * Whether each of the pictures has loaded: a picture that failed or has not
 * arrived yet has no natural width.
 * @param images - The `<img>` elements, e.g. `page.locator('.empty-guide__figure img')`.
 * @returns One answer per picture, in document order.
 */
export function readImagesLoaded(images: Locator): Promise<boolean[]> {
  return images.evaluateAll((elements) => {
    const loaded: boolean[] = [];
    for (const element of elements) {
      loaded.push((element as HTMLImageElement).naturalWidth > 0);
    }
    return loaded;
  });
}

/**
 * Where an element starts, and where the window ends, read together: a footer
 * is below the fold when its top is at the window's height or under it.
 * @param element - The element, e.g. `page.locator('footer').last()`.
 * @returns Its top and the fold.
 */
export function readFold(element: Locator): Promise<FoldReading> {
  return element.evaluate((node) => ({
    top: node.getBoundingClientRect().top,
    fold: globalThis.innerHeight,
  }));
}

/**
 * What the build badge in the About's hero reads: the release when the root
 * `package.json` names one, the commit the build was made from before the first
 * release, then the instant it was made, to the minute.
 * @param version - The version of the repository's root `package.json`.
 * @returns The pattern the whole badge matches.
 */
export function buildBadgePattern(version: string): RegExp {
  const build =
    version === UNRELEASED_VERSION
      ? String.raw`[\da-f]{7}`
      : version.replaceAll('.', String.raw`\.`);
  return new RegExp(String.raw`^${build} · \d{4}-\d{2}-\d{2} \d{2}:\d{2} UTC$`);
}
