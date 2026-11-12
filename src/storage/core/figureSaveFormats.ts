import {
  siteFigureExtension,
  siteFigureName,
} from '../../download/core/figureFileName.ts';
import { FIGURE_SVG_TYPE } from '../../download/core/figureSvg.ts';

import type { SaveFormat } from './documentSaverTypes.ts';
import { siteDocumentExtension, writeSiteDocument } from './siteDocument.ts';

/** What {@link figureSaveFormats} saves. */
export interface FigureSaveFormatsOptions<D> {
  /** The site, as its figures name it, e.g. `plate`. */
  site: string;
  /**
   * The site's figure of a document, carrying the state it opens again from.
   * @returns The SVG.
   */
  figure: (document: D) => Promise<string> | string;
  /**
   * The preferences a document keeps as its workspace, keyed as the site's
   * bucket keeps them.
   * @default undefined — the document holds the figure alone
   */
  workspace?: () => Record<string, unknown>;
  /**
   * The build that writes the document, e.g. `plate.cheminfo.org 1.4.0`.
   * @default undefined
   */
  generator?: string;
}

/**
 * The two formats a figure site saves in: its own SVG, which opens here again
 * and anywhere as a picture, then `.<site>.zip`, the same figure with the
 * workspace beside it.
 * @param options - See {@link FigureSaveFormatsOptions}.
 * @returns The formats, for `createDocumentSaver`.
 */
export function figureSaveFormats<D>(
  options: FigureSaveFormatsOptions<D>,
): [SaveFormat<D>, SaveFormat<D>] {
  const { site, figure, workspace, generator } = options;
  return [
    {
      id: 'svg',
      label: 'figure.saveSvg',
      extension: siteFigureExtension(site),
      picker: {
        description: 'SVG',
        accept: { 'image/svg+xml': ['.svg'] },
      },
      write: async (document) =>
        new Blob([await figure(document)], { type: FIGURE_SVG_TYPE }),
    },
    {
      id: 'document',
      label: 'figure.saveDocument',
      extension: siteDocumentExtension(site),
      picker: {
        description: 'ZIP',
        accept: { 'application/zip': ['.zip'] },
      },
      holdsParts: workspace !== undefined,
      write: async (document, parts, name) => {
        const stem = name.slice(0, -siteDocumentExtension(site).length);
        const kept =
          parts?.workspace && workspace
            ? {
                preferences: {
                  id: crypto.randomUUID(),
                  name: stem,
                  preferences: workspace(),
                },
              }
            : {};
        return writeSiteDocument(
          {
            data: [
              {
                path: siteFigureName(stem, site),
                content: await figure(document),
              },
            ],
            ...kept,
          },
          { site, ...(generator ? { generator } : {}) },
        );
      },
    },
  ];
}
