/**
 * The line under a conformer table saying what its shares are worth.
 *
 * A share is exponential in the energy gap, so the line turns the published
 * error of the method behind the energies into the factor a share is good to.
 * The force field's line also calls the column an ordering: off by 3.6
 * kcal/mol, a share is not a percentage anybody should quote.
 *
 * English only, like the table's own column headings.
 */

import type { CSSProperties, ReactElement } from 'react';

import { TOKEN } from '../../tokens/core/familyTokens.ts';
import { ROOM_TEMPERATURE } from '../core/conformerBoltzmann.ts';
import {
  GFN2_ENERGY_ERROR,
  MMFF94_ENERGY_ERROR,
  shareFactor,
} from '../core/conformerEnergyError.ts';
import type { ConformerRanking } from '../core/conformers.ts';

/** Props of {@link ConformerShareNote}. */
export interface ConformerShareNoteProps {
  /**
   * Which method's energies the shares were computed from: MMFF94's, or
   * GFN2-xTB's once the set has been refined.
   * @default 'force-field'
   */
  ranking?: ConformerRanking;
  /**
   * Temperature the shares are quoted at, in kelvin — the one given to the
   * table.
   * @default ROOM_TEMPERATURE
   */
  temperature?: number;
}

/**
 * What the population column of a `<ConformerTable>` is worth, in one line.
 * @param props - See {@link ConformerShareNoteProps}.
 * @returns The caption.
 */
export function ConformerShareNote(
  props: ConformerShareNoteProps,
): ReactElement {
  const { ranking = 'force-field', temperature = ROOM_TEMPERATURE } = props;
  return (
    <p style={noteStyle} data-testid="conformer-share-note">
      {noteText(ranking, temperature)}
    </p>
  );
}

function noteText(ranking: ConformerRanking, temperature: number): string {
  if (ranking === 'refined') {
    return (
      `Shares at ${temperature} K, from GFN2-xTB energies alone: no entropy, ` +
      `no solvent. GFN2-xTB is typically off by ${GFN2_ENERGY_ERROR} kcal/mol, ` +
      `which places a share within a factor of ` +
      `${shareFactor(GFN2_ENERGY_ERROR, temperature)}.`
    );
  }
  return (
    `Shares at ${temperature} K, from MMFF94 energies alone: no entropy, no ` +
    `solvent. On drug-like molecules MMFF94 is off by ${MMFF94_ENERGY_ERROR} ` +
    `kcal/mol, which places a share only within a factor of ` +
    `${shareFactor(MMFF94_ENERGY_ERROR, temperature)}: read the column as an ` +
    `ordering.`
  );
}

const noteStyle = {
  margin: 0,
  color: TOKEN.textMuted,
  fontSize: 11,
  lineHeight: 1.35,
} as const satisfies CSSProperties;
