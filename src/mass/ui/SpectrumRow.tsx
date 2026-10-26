import { InputGroup } from '@blueprintjs/core';
import { useMemo, useState } from 'react';
import { Button } from 'react-science/ui';

import { SpectrumColorSwatch } from '../../panel/ui/SpectrumColorSwatch.tsx';
import { downloadMassSpectrum } from '../core/downloadSpectra.ts';
import type { MassSpectrum } from '../core/massSpectrum.ts';
import { spectrumSubtitle } from '../core/massSummary.ts';
import type { MassTraceKind, TraceIconState } from '../core/traceIcon.ts';
import { nextTraceIconClick, traceIconState } from '../core/traceIcon.ts';

import { useMassActions } from './massStateContext.ts';

export interface SpectrumRowProps {
  /** The spectrum the row is of. */
  spectrum: MassSpectrum;
  /** Whether it is the one the panels act on. */
  isSelected: boolean;
}

/**
 * One loaded spectrum: its colour, its two traces, its name, and the way out.
 *
 * Everything on the row addresses the spectrum by its identity, never by where
 * it sits in the list — a row acts on a list that has been shortened by a close
 * since it was drawn, and an index would then recolour or close whichever
 * spectrum has taken that place.
 *
 * The two trace icons are the row's centre of gravity, and they are tri-state
 * rather than checkboxes; `traceIcon.ts` says why. The name is renamed in place
 * on a double click, because a name is what a chemist tells scans apart by and
 * a file's own titles are often the same string a dozen times over. The line
 * under it says what kind of spectrum it is: profile or centroid, how many
 * peaks, and at what resolution.
 * @param props - Component props.
 * @returns The row.
 */
export function SpectrumRow(props: SpectrumRowProps) {
  const { spectrum, isSelected } = props;
  const actions = useMassActions();
  const [draftName, setDraftName] = useState<string | null>(null);

  const subtitle = useMemo(
    () => spectrumSubtitle(spectrum, { describeKind: true }),
    [spectrum],
  );
  const profileState = traceIconState(spectrum.showProfile, isSelected);
  const centroidState = traceIconState(spectrum.showCentroid, isSelected);

  /**
   * Run the cycle of one trace icon.
   * @param kind - The trace the icon stands for.
   * @param state - What the icon was saying before the click.
   */
  function clickTrace(kind: MassTraceKind, state: TraceIconState): void {
    const click = nextTraceIconClick(kind, state);
    actions.setSpectrumVisibility(spectrum.id, click.visibility);
    if (click.select) actions.selectSpectrum(spectrum.id);
  }

  /** Take the name typed, unless it was emptied — a rename abandoned. */
  function commitRename(): void {
    const name = draftName?.trim() ?? '';
    setDraftName(null);
    if (name !== '') actions.renameSpectrum(spectrum.id, name);
  }

  return (
    <li
      // A row of controls rather than an option of a listbox, so the one every
      // panel is about is said to be the current one.
      aria-current={isSelected ? 'true' : undefined}
      style={isSelected ? selectedRowStyle : rowStyle}
      data-selected={isSelected ? 'true' : undefined}
    >
      <SpectrumColorSwatch
        color={spectrum.color}
        name={spectrum.name}
        onPick={(color) => actions.setSpectrumColor(spectrum.id, color)}
      />

      <Button
        variant="minimal"
        size="small"
        icon="timeline-line-chart"
        active={profileState !== 'hidden'}
        intent={profileState === 'selected' ? 'primary' : 'none'}
        disabled={spectrum.profile === null}
        tooltipProps={{
          ...rowTooltipProps,
          content:
            spectrum.profile === null
              ? 'This file was already centroided, so it has no continuous trace'
              : traceTooltip('profile', profileState),
        }}
        aria-label={`Continuous trace of ${spectrum.name}`}
        onClick={() => clickTrace('profile', profileState)}
      />

      <Button
        variant="minimal"
        size="small"
        icon="timeline-bar-chart"
        active={centroidState !== 'hidden'}
        intent={centroidState === 'selected' ? 'primary' : 'none'}
        tooltipProps={{
          ...rowTooltipProps,
          content: traceTooltip('centroid', centroidState),
        }}
        aria-label={`Centroid sticks of ${spectrum.name}`}
        onClick={() => clickTrace('centroid', centroidState)}
      />

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
        icon="download"
        aria-label={`Download ${spectrum.name}`}
        tooltipProps={{
          ...rowTooltipProps,
          content: 'Download this spectrum as a JCAMP-DX file',
        }}
        onClick={() => downloadMassSpectrum(spectrum)}
      />

      <Button
        variant="minimal"
        size="small"
        icon="cross"
        aria-label={`Close ${spectrum.name}`}
        tooltipProps={{ ...rowTooltipProps, content: 'Close this spectrum' }}
        onClick={() => actions.removeSpectrum(spectrum.id)}
      />
    </li>
  );
}

/**
 * What a click on a trace icon would do, said as a sentence.
 *
 * The three states of the icon look alike enough at 16 pixels that the cycle is
 * actually learned from the tooltip, so each one says what the click does rather
 * than what the icon means — including that picking one trace puts the other
 * away, which is the part a reader would otherwise discover by surprise.
 * @param kind - The trace the icon stands for.
 * @param state - What the icon is saying.
 * @returns The tooltip.
 */
function traceTooltip(kind: MassTraceKind, state: TraceIconState): string {
  const trace =
    kind === 'profile' ? 'the continuous trace' : 'the centroid sticks';
  const other =
    kind === 'profile' ? 'the centroid sticks' : 'the continuous trace';
  if (state === 'hidden') {
    return `Draw ${trace} instead of ${other}, and work on this spectrum`;
  }
  if (state === 'drawn') {
    return 'Work on this spectrum — its peaks are the ones labelled';
  }
  return 'Take this spectrum off the chart';
}

/**
 * How a tooltip behaves on a control that sits in a list: a hand crossing forty
 * rows passes over a hundred of these, and with no delay every one of them
 * opens.
 */
const rowTooltipProps = { compact: true, hoverOpenDelay: 300 } as const;

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  padding: '0 2px',
  borderRadius: 3,
} as const;

/** The selected row, which is the one every other panel is about. */
const selectedRowStyle = { ...rowStyle, background: '#e8f1fb' } as const;

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
  font: 'inherit',
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
