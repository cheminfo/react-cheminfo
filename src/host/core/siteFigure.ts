/**
 * An editor's document as a figure: what every picture saved, copied or
 * handed to a host carries so it opens here again, opening one, and the
 * figure itself, written off the page or drawn by the site.
 */

import type {
  CarriedFigureStates,
  FigureStates,
} from '../../download/core/figureState.ts';
import { readFigureStates } from '../../download/core/figureState.ts';
import type { FigureSvg } from '../../download/core/figureSvg.ts';
import { figureSvg } from '../../download/core/figureSvg.ts';
import { withPageFigureSource } from '../../download/core/pageFigureSource.ts';
import { CHROME_CATALOG } from '../../i18n/core/chromeCatalog.ts';
import type { Language } from '../../i18n/core/languages.ts';

import { loadedFigureStates } from './figureDocument.ts';
import type { HostOutputs } from './hostOutputs.ts';
import type { LoadedInput } from './selectInputs.ts';

/** The site's signal holding the document on screen. */
export interface FigureDocumentCell<D> {
  /** The document, read without subscribing. */
  peek: () => D;
  /** Be told when it changes; returns the stop. */
  subscribe: (listener: (document: D) => void) => () => void;
}

/** What a site's figure is made of. */
export interface SiteFigureOptions<D> {
  /** The site's name, as its figures name it: the tool's `name`. */
  site: string;
  /**
   * The host named in the sentence refusing a figure of another version.
   * @default `${site}.cheminfo.org`
   */
  host?: string;
  /**
   * The version of what a figure carries, so an older one is told apart.
   * @default 1
   */
  version?: number;
  /** The document on screen. */
  document: FigureDocumentCell<D>;
  /** Read a carried document, trusted for nothing. */
  read: (value: unknown) => D | undefined;
  /** Whether a document holds nothing a figure is worth carrying. */
  isEmpty: (document: D) => boolean;
  /**
   * Show a document in place of the one on screen: `forget` when a host
   * handed it over, so nothing is left to undo behind it.
   */
  open: (document: D, options: { forget: boolean }) => void;
  /** The site's own sentence for a figure carrying no document it reads. */
  emptyMessage: string;
  /**
   * The `id` of the element the figure is written off.
   * @default undefined — `draw` makes the figure
   */
  figureId?: string;
  /**
   * The figure, for a site that draws it rather than reading it off the page.
   * @default undefined — written off `figureId`
   */
  draw?: () => FigureSvg;
  /**
   * The outputs a host reads beside the figure, such as a table.
   * @default none
   */
  outputs?: HostOutputs['read'];
  /**
   * The language a refusal is said in.
   * @default English
   */
  language?: () => Language;
}

/** A site's figure, and what opens one. */
export interface SiteFigure<D> {
  /**
   * What a figure of the page carries now.
   * @returns The document's state, or undefined while it holds nothing.
   */
  figureState: () => FigureStates | undefined;
  /**
   * The document a figure carries.
   * @throws {Error} When it was saved by another version, or holds nothing
   * this version reads.
   */
  documentOf: (states: FigureStates) => D;
  /** Open a figure saved here, in place of the document; undo brings it back. */
  openFigure: (states: FigureStates | CarriedFigureStates) => void;
  /** Open the figure a host handed over, with nothing to undo behind it. */
  loadFromHost: (inputs: readonly LoadedInput[]) => Promise<void>;
  /**
   * The figure as the SVG every save and copy writes, carrying the document.
   * @throws {Error} When the figure is not on the page.
   */
  writeFigure: () => Promise<FigureSvg>;
  /**
   * The document an SVG of the site carries, as a paste reads it.
   * @returns It, or undefined when the picture holds none.
   */
  readSvg: (svg: string) => Promise<D | undefined>;
  /** What a host reads off the page: the figure, drawn when it asks. */
  hostOutputs: HostOutputs;
}

/**
 * An editor's figure.
 * @param options - The site, its document and how it is read and shown, and
 * where its figure comes from.
 * @returns What a figure carries, and what opens one.
 */
export function createSiteFigure<D>(
  options: SiteFigureOptions<D>,
): SiteFigure<D> {
  const { site, version = 1, document, read, isEmpty, open } = options;
  const { emptyMessage, figureId, draw, outputs, language } = options;
  const { host = `${site}.cheminfo.org` } = options;

  function documentOf(states: FigureStates): D {
    const carried = states.data;
    if (carried?.version !== version) {
      throw new Error(
        CHROME_CATALOG.translate('figure.otherVersion', language?.() ?? 'en', {
          values: { host },
        }),
      );
    }
    const value = read(carried.value);
    if (value === undefined) throw new Error(emptyMessage);
    return value;
  }

  function drawn(): FigureSvg | undefined {
    if (draw) return draw();
    const box = figureId
      ? globalThis.document?.querySelector(`#${figureId}`)
      : null;
    return box ? figureSvg(box) : undefined;
  }

  return {
    figureState: () => {
      const value = document.peek();
      return isEmpty(value) ? undefined : { data: { version, value } };
    },
    documentOf,
    openFigure: (states) => {
      open(documentOf(states), { forget: false });
    },
    loadFromHost: async (inputs) => {
      const states = await loadedFigureStates(inputs, site);
      if (states !== undefined) open(documentOf(states), { forget: true });
    },
    writeFigure: async () => {
      const figure = drawn();
      if (!figure) throw new Error('The figure is not on the page.');
      return { ...figure, markup: await withPageFigureSource(figure.markup) };
    },
    readSvg: async (svg) => {
      const states = await readFigureStates(svg, site);
      if (states === undefined) return undefined;
      try {
        return documentOf(states);
      } catch {
        return undefined;
      }
    },
    hostOutputs: {
      read: outputs ?? (() => []),
      subscribe: (listener) => document.subscribe(() => listener()),
      render: {
        figure: () => {
          if (isEmpty(document.peek())) return Promise.resolve(undefined);
          const figure = drawn();
          if (!figure) return Promise.resolve(undefined);
          return Promise.resolve({
            key: 'figure',
            kind: 'image.svg',
            value: { svg: figure.markup },
          });
        },
      },
    },
  };
}
