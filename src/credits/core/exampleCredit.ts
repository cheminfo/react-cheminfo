/**
 * Who an example a site offers is owed to, and on what terms: the picture a
 * tool is tried on, who made it, its licence and the page it is published on.
 *
 * Most come from Wikimedia Commons, which serves a smaller copy of a file at a
 * handful of widths only, so a list of examples takes its thumbnails from
 * there and every credit links back to the file's own page.
 */

import { CHROME_CATALOG } from '../../i18n/core/chromeCatalog.ts';
import type { Language } from '../../i18n/core/languages.ts';
import { DEFAULT_LANGUAGE } from '../../i18n/core/languages.ts';
import { catalogTranslate } from '../../i18n/core/translate.ts';

/** Who an example is owed to, and on what terms. */
export interface ExampleCredit {
  /** Who made it, as the source names them. */
  author: string;
  /** The licence, short name: `CC BY 4.0`, `CC0 1.0`, `public domain`. */
  licence: string;
  /**
   * The licence's own page.
   * @default undefined — no page (public domain)
   */
  licenceUrl?: string;
  /** The page it is published on. */
  page: string;
  /**
   * The work to cite with it.
   * @default undefined
   */
  citation?: string;
}

/** The terms of a credit, as the licences below spell them out. */
type CreditTerms = Pick<ExampleCredit, 'licence' | 'licenceUrl'>;

/** The widths Wikimedia Commons serves a smaller copy of a file at; it refuses any other. */
export const COMMONS_WIDTHS = [330, 500, 960, 1280, 1920] as const;

/** CC0 1.0: its author has given up every right to it. */
export const CC0_1: CreditTerms = {
  licence: 'CC0 1.0',
  licenceUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
};

/** In the public domain, which has no licence page to link to. */
export const PUBLIC_DOMAIN: CreditTerms = { licence: 'public domain' };

const COMMONS_FILES = 'https://upload.wikimedia.org/wikipedia/commons';
const COMMONS_PAGES = 'https://commons.wikimedia.org/';

/**
 * Where a file of Wikimedia Commons is served: whole, or as the smaller copy
 * Commons keeps at one of {@link COMMONS_WIDTHS}. A TIFF, an SVG or a movie is
 * copied as a picture, under the name Commons gives that copy.
 * @param path - Its place on Commons as its address writes it, the two hash
 * folders and then its name: `8/8d/PP_cells_in_Pancreatic_Islet.png`.
 * @param width - How wide the copy is.
 * @default width undefined — the file itself
 * @returns The address.
 * @throws {Error} When Commons serves no copy at that width.
 */
export function commonsFile(path: string, width?: number): string {
  if (width === undefined) return `${COMMONS_FILES}/${path}`;
  const name = path.slice(path.lastIndexOf('/') + 1);
  if (!isCommonsWidth(width)) {
    throw new Error(
      `Wikimedia Commons keeps no copy of ${name} ${width} px wide: ask for ${COMMONS_WIDTHS.join(', ')}.`,
    );
  }
  return `${COMMONS_FILES}/thumb/${path}/${copyName(name, width)}`;
}

/**
 * Creative Commons Attribution, in one of its versions.
 * @param version - Its version, e.g. `4.0`.
 * @returns Its short name and its page.
 */
export function ccBy(version: string): CreditTerms {
  return {
    licence: `CC BY ${version}`,
    licenceUrl: `https://creativecommons.org/licenses/by/${version}/`,
  };
}

/**
 * Creative Commons Attribution-ShareAlike, in one of its versions.
 * @param version - Its version, e.g. `3.0`.
 * @returns Its short name and its page.
 */
export function ccBySa(version: string): CreditTerms {
  return {
    licence: `CC BY-SA ${version}`,
    licenceUrl: `https://creativecommons.org/licenses/by-sa/${version}/`,
  };
}

/**
 * A credit as one line of text, for where no link can go: the band under a
 * saved figure, its metadata. It reads as `ExampleCreditLine` does.
 * @param credit - Who is owed, and on what terms.
 * @param language - The language it is written in.
 * @default language 'en'
 * @returns E.g. `Image: Xiaojun Wang et al., CC BY 3.0, via Wikimedia Commons`.
 */
export function exampleCreditText(
  credit: ExampleCredit,
  language: Language = DEFAULT_LANGUAGE,
): string {
  const t = catalogTranslate(CHROME_CATALOG, language);
  return t(exampleCreditMessage(credit), {
    author: credit.author,
    licence: credit.licence,
  });
}

/**
 * The message a credit is written in: it names Wikimedia Commons when the page
 * is there, which is how Commons asks its files to be credited.
 * @param credit - The credit.
 * @returns Its key in the chrome's catalog.
 */
export function exampleCreditMessage(
  credit: ExampleCredit,
): 'examples.credit' | 'examples.creditViaCommons' {
  return credit.page.startsWith(COMMONS_PAGES)
    ? 'examples.creditViaCommons'
    : 'examples.credit';
}

function isCommonsWidth(width: number): boolean {
  for (const served of COMMONS_WIDTHS) {
    if (served === width) return true;
  }
  return false;
}

// Commons draws a paged file's first page, and a movie's first frame, as a
// picture of the format a browser shows.
function copyName(name: string, width: number): string {
  const extension = name.slice(name.lastIndexOf('.') + 1).toLowerCase();
  if (extension === 'tif' || extension === 'tiff') {
    return `lossy-page1-${width}px-${name}.jpg`;
  }
  if (extension === 'svg') return `${width}px-${name}.png`;
  if (extension === 'webm' || extension === 'ogv') {
    return `${width}px--${name}.jpg`;
  }
  return `${width}px-${name}`;
}
