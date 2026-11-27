import type { ReactNode } from 'react';
import { Button, Toolbar } from 'react-science/ui';

import { SELECTED_ROW_TINT } from '../../panel/core/panelStyles.ts';
import { countLabel } from '../../panel/core/statusBar.ts';
import { SpectrumColorSwatch } from '../../panel/ui/SpectrumColorSwatch.tsx';
import { SpectrumNameCell } from '../../panel/ui/SpectrumNameCell.tsx';
import { transitionText } from '../core/panelFormat.ts';
import type { XpsSpectrum } from '../core/xpsSpectrum.ts';

import { useXpsActions } from './xpsStateContext.ts';

export interface SpectrumRowProps {
  /** The spectrum the row is of. */
  spectrum: XpsSpectrum;
  /** Whether it is the one the other five panels are about. */
  isSelected: boolean;
}

/**
 * One loaded spectrum: its colour, whether it is drawn, its name, and the way
 * out.
 *
 * Everything on the row addresses the spectrum by its identity, never by where
 * it sits in the list — a row acts on a list that may have been re-ordered by a
 * drop or shortened by a close since it was drawn, and an index would then
 * recolour or close whichever spectrum has taken that place.
 *
 * The name is renamed in place on a double click. A VAMAS file names all
 * forty-eight of its blocks after the one experiment, so the name the list shows
 * is the only thing telling two rows apart, and it is routinely the first thing
 * a reader fixes.
 * @param props - Component props.
 * @returns The row.
 */
export function SpectrumRow(props: SpectrumRowProps): ReactNode {
  const { spectrum, isSelected } = props;
  const actions = useXpsActions();

  const points = countLabel(spectrum.energy.x.length, 'point', 'points');
  const subtitle = `${transitionText(spectrum.transition)} · ${points}`;

  return (
    <div
      style={isSelected ? selectedRowStyle : rowStyle}
      data-selected={isSelected ? 'true' : undefined}
    >
      <SpectrumColorSwatch
        color={spectrum.color}
        name={spectrum.name}
        onPick={(color) => actions.setSpectrumColor(spectrum.id, color)}
      />

      <Toolbar aria-label={`Trace of ${spectrum.name}`}>
        <Toolbar.Item
          icon={spectrum.visible ? 'eye-open' : 'eye-off'}
          active={spectrum.visible}
          intent={spectrum.visible && isSelected ? 'primary' : 'none'}
          tooltip={
            spectrum.visible
              ? 'Take this spectrum off the chart'
              : 'Draw this spectrum on the chart'
          }
          aria-label={`Draw ${spectrum.name}`}
          onClick={() =>
            actions.setSpectrumVisibility(spectrum.id, !spectrum.visible)
          }
        />
      </Toolbar>

      <SpectrumNameCell
        name={spectrum.name}
        subtitle={subtitle}
        onSelect={() => actions.selectSpectrum(spectrum.id)}
        onRename={(name) => actions.renameSpectrum(spectrum.id, name)}
      />

      <Button
        variant="minimal"
        size="small"
        icon="cross"
        aria-label={`Close ${spectrum.name}`}
        tooltipProps={{ content: 'Close this spectrum' }}
        onClick={() => actions.removeSpectrum(spectrum.id)}
      />
    </div>
  );
}

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: '2px 4px',
  borderRadius: 3,
  border: '1px solid transparent',
} as const;

/** The selected row, which is the one every other panel is about. */
const selectedRowStyle = {
  ...rowStyle,
  // The shorthand again rather than `borderColor` alone: React cannot take a
  // longhand back off a shorthand, so the border stayed lit on the row the
  // selection had left.
  border: '1px solid var(--accent)',
  background: SELECTED_ROW_TINT,
} as const;
