/**
 * A file opened or dropped on a site of the family, read as a figure: one the
 * site drew opens on the state it carries; one another site drew belongs on
 * that site; anything else is no figure to open.
 */

import type { CarriedFigureState } from '../../download/core/figureState.ts';
import { readFigureState } from '../../download/core/figureState.ts';

import type { FigureDestination } from './figureForward.ts';
import { figureDestination } from './figureForward.ts';

/** What a file opened on a site holds. */
export type OpenedFigure =
  | {
      /** A figure of the site, with the state it opens again from. */
      kind: 'own';
      state: CarriedFigureState;
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
  const state = await readFigureState(text, site);
  if (state !== undefined) return { kind: 'own', state };
  const destination = figureDestination(text, site, origins);
  if (destination !== undefined) {
    return { kind: 'elsewhere', svg: text, destination };
  }
  return { kind: 'none' };
}
