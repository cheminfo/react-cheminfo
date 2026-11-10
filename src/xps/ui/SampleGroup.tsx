import { Icon } from '@blueprintjs/core';
import type { ReactNode } from 'react';

import { countLabel } from '../../panel/core/statusBar.ts';
import type { SpectrumGroup } from '../core/spectrumGroups.ts';

import { SpectrumRow } from './SpectrumRow.tsx';
import { panelGroupHeaderStyle } from './panelStyles.ts';

export interface SampleGroupProps {
  /** The sample and its spectra. */
  group: SpectrumGroup;
  /** Identity of the spectrum the other panels are about, `null` for none. */
  selectedId: string | null;
  /** Whether the rows are folded away. */
  isCollapsed: boolean;
  /** Whether the heading is drawn at all. */
  showHeading: boolean;
  /** Called with the sample's identity when the heading is clicked. */
  onToggle: (id: string) => void;
}

/**
 * The spectra of one sample, under a heading that folds them away.
 *
 * Folding is what makes a file of six samples readable at all: the reader is
 * working on one sample at a time, and the other forty rows are context they
 * want to be able to reach rather than context they want to scroll past. The
 * heading says how many spectra are inside, so a folded group still answers the
 * question that was asked of it.
 *
 * How many are *drawn* is deliberately not on the heading. A sample is a group
 * of rows and not a thing that can be shown or hidden, and a count that changed
 * as traces were toggled would invite a click that has no meaning.
 * @param props - Component props.
 * @returns The heading and, unless it is folded, its rows.
 */
export function SampleGroup(props: SampleGroupProps): ReactNode {
  const { group, selectedId, isCollapsed, showHeading, onToggle } = props;

  return (
    <>
      {showHeading ? (
        <button
          type="button"
          style={panelGroupHeaderStyle}
          aria-expanded={!isCollapsed}
          title={
            isCollapsed
              ? 'Show the spectra of this sample'
              : 'Fold the spectra of this sample away'
          }
          onClick={() => onToggle(group.id)}
        >
          <Icon
            icon={isCollapsed ? 'chevron-right' : 'chevron-down'}
            size={12}
          />
          <span>{group.label}</span>
          <span style={countStyle}>
            {countLabel(group.spectra.length, 'spectrum', 'spectra')}
          </span>
        </button>
      ) : null}

      {isCollapsed
        ? null
        : group.spectra.map((spectrum) => (
            <SpectrumRow
              key={spectrum.id}
              spectrum={spectrum}
              isSelected={spectrum.id === selectedId}
            />
          ))}
    </>
  );
}

/** How many spectra the sample holds, quieter than the sample's own name. */
const countStyle = { fontWeight: 400, opacity: 0.8 } as const;
