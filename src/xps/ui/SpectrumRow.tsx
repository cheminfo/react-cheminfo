import { InputGroup } from '@blueprintjs/core';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Button, Toolbar } from 'react-science/ui';

import { countLabel } from '../../panel/core/statusBar.ts';
import { SpectrumColorSwatch } from '../../panel/ui/SpectrumColorSwatch.tsx';
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
  const [draftName, setDraftName] = useState<string | null>(null);

  const points = countLabel(spectrum.energy.x.length, 'point', 'points');
  const subtitle = `${transitionText(spectrum.transition)} · ${points}`;

  function commitRename(): void {
    const name = draftName?.trim() ?? '';
    setDraftName(null);
    // An empty box is a rename abandoned rather than a request for a nameless
    // spectrum, which nothing in the list could then be told apart by.
    if (name !== '') actions.renameSpectrum(spectrum.id, name);
  }

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

      {draftName === null ? (
        <button
          type="button"
          style={nameStyle}
          title="Click to work on this spectrum, double click to rename it"
          onClick={() => actions.selectSpectrum(spectrum.id)}
          onDoubleClick={() => setDraftName(spectrum.name)}
        >
          <span style={nameTextStyle}>{spectrum.name}</span>
          <span style={subtitleStyle}>{subtitle}</span>
        </button>
      ) : (
        <InputGroup
          autoFocus
          size="small"
          value={draftName}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          aria-label={`Name of ${spectrum.name}`}
          onValueChange={setDraftName}
          onBlur={commitRename}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commitRename();
            if (event.key === 'Escape') setDraftName(null);
          }}
        />
      )}

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
  background: 'color-mix(in oklab, var(--accent) 10%, var(--surface))',
} as const;

const nameStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 1,
  flex: '1 1 1px',
  minWidth: 0,
  padding: '1px 2px',
  border: 'none',
  background: 'none',
  color: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',
} as const;

/** One line, cut short rather than wrapped: the rows stay a fixed height. */
const nameTextStyle = {
  maxWidth: '100%',
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 1.2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;

const subtitleStyle = {
  maxWidth: '100%',
  fontSize: 10,
  lineHeight: 1.2,
  opacity: 0.7,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;
