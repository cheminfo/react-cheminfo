/**
 * The line under a conformer table saying what its shares are worth.
 *
 * A share is exponential in the energy gap, so the line turns the published
 * error of the method behind the energies into the factor a share is good to.
 * The force field's line also calls the column an ordering: off by 3.6
 * kcal/mol, a share is not a percentage anybody should quote.
 */

import type { CSSProperties, ReactElement } from 'react';

import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import type { Translate } from '../../i18n/ui/useT.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { TOKEN } from '../../tokens/core/familyTokens.ts';
import { ROOM_TEMPERATURE } from '../core/conformerBoltzmann.ts';
import {
  GFN2_DRUGLIKE_ENERGY_ERROR,
  GFN2_ENERGY_ERROR,
  MMFF94_ENERGY_ERROR,
  shareFactor,
} from '../core/conformerEnergyError.ts';
import type { ConformerRanking } from '../core/conformerTypes.ts';

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
  const t = useChromeT();
  return (
    <p style={noteStyle} data-testid="conformer-share-note">
      {noteText(ranking, temperature, t)}
    </p>
  );
}

function noteText(
  ranking: ConformerRanking,
  temperature: number,
  t: Translate<ChromeKey>,
): string {
  if (ranking === 'refined') {
    return t('conformers.share.refined', {
      temperature,
      error: GFN2_ENERGY_ERROR,
      factor: shareFactor(GFN2_ENERGY_ERROR, temperature),
    });
  }
  return t('conformers.share.forceField', {
    temperature,
    error: MMFF94_ENERGY_ERROR,
    refinedError: GFN2_DRUGLIKE_ENERGY_ERROR,
    factor: shareFactor(MMFF94_ENERGY_ERROR, temperature),
  });
}

const noteStyle = {
  margin: 0,
  color: TOKEN.textMuted,
  fontSize: 11,
  lineHeight: 1.35,
} as const satisfies CSSProperties;
