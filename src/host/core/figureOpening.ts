/**
 * A file opened or dropped on a site of the family, read as a figure: one the
 * site drew opens on the state it carries; one another site drew belongs on
 * that site; anything else is no figure to open. A document of the site, the
 * `.<site>.zip` Save as writes, opens on its figure and its workspace.
 */

import type { CarriedFigureStates } from '../../download/core/figureState.ts';
import { readFigureStates } from '../../download/core/figureState.ts';
import { isSameSite } from '../../ecosystem/core/lookup.ts';
import { documentFigure } from '../../storage/core/documentFigure.ts';
import type { SiteDocument } from '../../storage/core/siteDocument.ts';
import { readSiteDocument } from '../../storage/core/siteDocument.ts';
import type { WorkspaceRecord } from '../../storage/core/workspaceFile.ts';

import type { FigureDestination } from './figureForward.ts';
import { figureDestination } from './figureForward.ts';

/** What a file opened on a site holds. */
export type OpenedFigure =
  | {
      /** A figure of the site, with the state it opens again from. */
      kind: 'own';
      state: CarriedFigureStates;
    }
  | {
      /** A figure of another site of the family, which opens there. */
      kind: 'elsewhere';
      svg: string;
      destination: FigureDestination;
    }
  | {
      /** No figure any site of the family opens again. */
      kind: 'none';
    };

/**
 * Read a file opened or dropped on a site as a figure.
 * @param text - The file's text.
 * @param site - The site it was opened on, as the family names it.
 * @param origins - The origin to open each site on instead of its own, as a
 * development server names its siblings running locally.
 * @default {}
 * @returns What the file holds.
 */
export async function readOpenedFigure(
  text: string,
  site: string,
  origins: Readonly<Record<string, string>> = {},
): Promise<OpenedFigure> {
  const state = await readFigureStates(text, site);
  if (state !== undefined) return { kind: 'own', state };
  const destination = figureDestination(text, site, origins);
  if (destination !== undefined) {
    return { kind: 'elsewhere', svg: text, destination };
  }
  return { kind: 'none' };
}

/** What a file opened on a site holds, as a figure and what came with it. */
export interface OpenedFile {
  /** The figure it holds, or that it holds none. */
  figure: OpenedFigure;
  /**
   * The workspace a document of the site carries beside its figure.
   * @default undefined — an SVG, or a document saved without its workspace
   */
  workspace?: WorkspaceRecord;
}

/**
 * Read a file opened or dropped on a site: a figure saved as SVG, or a
 * document of the site — its figure and the workspace it was saved with. A
 * document of another site is read for its figure, which belongs there.
 * @param file - The file.
 * @param site - The site it was opened on, as the family names it.
 * @param origins - The origin to open each site on instead of its own, as a
 * development server names its siblings running locally.
 * @default {}
 * @returns What the file holds.
 */
export async function readOpenedFile(
  file: Blob,
  site: string,
  origins: Readonly<Record<string, string>> = {},
): Promise<OpenedFile> {
  if (!(await isZip(file))) {
    return { figure: await readOpenedFigure(await file.text(), site, origins) };
  }
  let document: SiteDocument;
  try {
    document = await readSiteDocument(file);
  } catch {
    return { figure: { kind: 'none' } };
  }
  const svg = documentFigure(document);
  if (!svg) return { figure: { kind: 'none' } };
  const figure = await readOpenedFigure(svg.text(), site, origins);
  return figure.kind === 'own' &&
    isSameSite(document.site, site) &&
    document.preferences
    ? { figure, workspace: document.preferences }
    : { figure };
}

// A ZIP archive starts with the signature of its first entry, `PK\x03\x04`.
async function isZip(file: Blob): Promise<boolean> {
  const head = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  return (
    head[0] === 0x50 && head[1] === 0x4b && head[2] === 0x03 && head[3] === 0x04
  );
}
