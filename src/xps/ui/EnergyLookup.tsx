import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

import { NumberInput } from '../../number/ui/NumberInput.tsx';
import { PanelEmpty } from '../../panel/ui/PanelMessage.tsx';
import { assignElements } from '../core/assignElements.ts';
import { levelText, signedEnergy } from '../core/panelFormat.ts';
import { formatEnergy } from '../core/peakFormat.ts';

import { labelStyle, panelFieldStyle as fieldStyle } from './panelStyles.ts';

export interface EnergyLookupProps {
  /** How far in eV a published level may sit from the energy asked about. */
  tolerance: number;
  /** Called with the energy to draw the guide at, `null` to take it away. */
  onHover: (bindingEnergy: number | null) => void;
}

/**
 * What sits at a given binding energy.
 *
 * The question a survey scan is read with, asked directly. The peak table
 * answers it for the maxima the detection found, which is most of the time the
 * right list — but the shoulder nobody picked, the energy a colleague quoted and
 * the position a reference gives are all energies with no peak of ours attached,
 * and each of them is a reason to interrogate the table by hand.
 *
 * The window is the same tolerance the panel's slider sets, so this box and the
 * rows above it can never disagree about what counts as a match.
 * @param props - Component props.
 * @returns The box and whatever it found.
 */
export function EnergyLookup(props: EnergyLookupProps): ReactNode {
  const { tolerance, onHover } = props;
  const [energy, setEnergy] = useState<number | undefined>(undefined);
  const asked = energy ?? null;

  const candidates = useMemo(
    () => (asked === null ? [] : assignElements(asked, { tolerance })),
    [asked, tolerance],
  );

  return (
    <div style={fieldStyle}>
      <span style={labelStyle}>What sits at</span>
      <NumberInput
        allowEmpty
        fill
        size="small"
        min={0}
        value={energy}
        placeholder="284.6"
        buttons={false}
        ariaLabel="Binding energy to look up, in eV"
        onChange={setEnergy}
      />

      {asked !== null && candidates.length === 0 ? (
        <PanelEmpty>
          No published level sits within {formatEnergy(tolerance)} eV of{' '}
          {formatEnergy(asked)} eV. Widen the tolerance, or take it as a line
          the table does not carry.
        </PanelEmpty>
      ) : null}

      {asked !== null && candidates.length > 0 ? (
        <ul style={listStyle}>
          {candidates.map((candidate) => (
            <li
              key={`${candidate.element} ${candidate.orbital}`}
              style={itemStyle}
              onPointerEnter={() => onHover(asked)}
              onPointerLeave={() => onHover(null)}
            >
              <span style={levelStyle}>
                {levelText(candidate.element, candidate.orbital)}
              </span>
              <span style={energyStyle}>
                {formatEnergy(candidate.bindingEnergy)} eV
              </span>
              <span style={deltaStyle}>{signedEnergy(candidate.delta)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

const listStyle = {
  margin: 0,
  padding: 0,
  listStyle: 'none',
  fontSize: 11,
} as const;

const itemStyle = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 6,
  padding: '2px 4px',
  borderBottom: '1px solid rgb(237 240 243)',
} as const;

const levelStyle = { fontWeight: 600, whiteSpace: 'nowrap' } as const;

const energyStyle = {
  whiteSpace: 'nowrap',
  fontVariantNumeric: 'tabular-nums',
} as const;

/** How far the asked energy sits from the published one, quieter than both. */
const deltaStyle = {
  marginLeft: 'auto',
  whiteSpace: 'nowrap',
  fontVariantNumeric: 'tabular-nums',
  opacity: 0.6,
} as const;
