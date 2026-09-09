import type { ReactElement } from 'react';
import { useMemo } from 'react';

import { chartAxisTitle } from '../../chart/core/chartLabels.ts';
import type { ChartTrackEvent } from '../../chart/ui/TrackedLineChart.tsx';
import { TrackedLineChart } from '../../chart/ui/TrackedLineChart.tsx';
import { TrackedStickChart } from '../../chart/ui/TrackedStickChart.tsx';
import type { LoadingProfiles } from '../core/loadingProfiles.ts';
import type { ProjectionCopy } from '../core/projectionCopy.ts';
import { PROJECTION_COPY } from '../core/projectionCopy.ts';
import type { ProjectionOptions } from '../core/projectionOptions.ts';
import { DEFAULT_PROJECTION_OPTIONS } from '../core/projectionOptions.ts';

import {
  PANEL_TITLE_ROOM,
  PANEL_TITLE_STYLE,
  PROJECTION_TAB_HEIGHT,
  SMALLEST_PANEL,
  STACK_STYLE,
  SWATCH_STYLE,
} from './projectionTabStyles.ts';
import type { ProjectionVariableTrack } from './projectionVariablesModel.ts';
import {
  namesOfSlots,
  panelSeries,
  panelSticks,
  ticksOfSlots,
  variableTrack,
  writeValue,
} from './projectionVariablesModel.ts';
import { axisCaption, legendTitle } from './projectionVariablesWords.ts';

export type { ProjectionVariableTrack } from './projectionVariablesModel.ts';

/** What {@link ProjectionVariablesTab} needs. */
export interface ProjectionVariablesTabProps {
  /**
   * The panels as the viewer built them, or `null` when the run reported no
   * weights and there is nothing to draw.
   */
  profiles: LoadingProfiles | null;
  /**
   * What the panels are showing.
   * @default DEFAULT_PROJECTION_OPTIONS
   */
  options?: ProjectionOptions;
  /**
   * The words the tab writes.
   * @default PROJECTION_COPY
   */
  copy?: ProjectionCopy;
  /**
   * What the one selected sample is called, which the `sample` view rebuilds.
   * @default 'the selected sample'
   */
  sampleName?: string;
  /**
   * Width of the panels, in pixels, from the viewer's measurement.
   * @default 0 — nothing is drawn until the figure has been measured
   */
  width?: number;
  /**
   * Height the whole stack is given, in pixels, shared out between the panels.
   * @default 420
   */
  height?: number;
  /**
   * Called on every measurement the pointer enters, and with `null` when it
   * leaves. The readout is written here rather than left to the caller, so a
   * page lighting a band on a spectrum beside the viewer never has to work out
   * what the slot it was handed is called.
   * @default undefined
   */
  onTrackVariable?: (track: ProjectionVariableTrack | null) => void;
  /**
   * How a number is written in the readout.
   * @default a rounding to three decimals with the trailing zeros dropped
   */
  formatValue?: (value: number) => string;
  /**
   * Value of the `data-testid` attribute of the stack.
   * @default undefined
   */
  testId?: string;
}

/**
 * One panel per component, each drawing what that component leans on.
 *
 * Colour is the component here and nothing else: the palette's component order
 * is disjoint from its group order over the first four of each, so a reader
 * who learnt "blue is setosa" on the map never reads "blue is PC 1" here as
 * though it meant the same thing. A component's direction is arbitrary, so its
 * sign is carried by geometry — above or below the zero line — and never by a
 * second colour, which would advertise a meaning the arithmetic does not have.
 * Nothing is coloured along the horizontal axis either: a rainbow across the
 * measurements encodes the slot number, which the reader can already see.
 *
 * The panels carry no key. Every one of them is titled with its own swatch and
 * its own name, so a key would repeat what the titles already say; the one
 * thing the titles cannot say — that the faint grey line behind them is the
 * average sample — is the first thing the question mark in the bar does.
 * @param props - See {@link ProjectionVariablesTabProps}.
 * @returns The stack of panels.
 */
export function ProjectionVariablesTab(
  props: ProjectionVariablesTabProps,
): ReactElement {
  const { profiles, onTrackVariable, testId } = props;
  const { options = DEFAULT_PROJECTION_OPTIONS, copy = PROJECTION_COPY } =
    props;
  const { width = 0, height = PROJECTION_TAB_HEIGHT } = props;
  const { sampleName = A_SAMPLE, formatValue = writeValue } = props;

  const categories = useMemo(() => namesOfSlots(profiles), [profiles]);
  const tickLabels = useMemo(() => ticksOfSlots(profiles), [profiles]);

  function report(panel: number, event: ChartTrackEvent | null): void {
    if (onTrackVariable === undefined || profiles === null) return;
    onTrackVariable(
      event === null
        ? null
        : variableTrack(profiles, event.index, panel, formatValue),
    );
  }

  if (profiles === null) {
    return <div style={STACK_STYLE} data-testid={testId} />;
  }

  const average = options.showAverage && profiles.mean !== undefined;
  const last = profiles.profiles.length - 1;
  const room = Math.max(SMALLEST_PANEL, Math.floor(height / (last + 1)));
  const bars = profiles.axis.kind === 'named' && !inTheirOwnUnits(profiles);
  const peaks = profiles.axis.kind === 'peaks' ? profiles.axis : null;
  const scale = profiles.sharedScale
    ? { domain: [profiles.domain.min, profiles.domain.max] as const }
    : {};

  return (
    <div style={STACK_STYLE} data-testid={testId}>
      {profiles.profiles.map((profile, panel) => (
        <div key={profile.index}>
          <span style={PANEL_TITLE_STYLE}>
            <span style={{ ...SWATCH_STYLE, background: profile.color }} />
            {chartAxisTitle(profile.label, { share: profile.share })}
          </span>
          {peaks === null ? (
            <TrackedLineChart
              categories={categories}
              tickLabels={tickLabels}
              series={panelSeries(profiles, profile, bars, average, copy)}
              width={width}
              height={room - PANEL_TITLE_ROOM}
              y={{ ...scale, label: profiles.valueLabel }}
              xLabel={panel === last ? axisCaption(profiles.axis) : undefined}
              label={`${profile.label}. ${legendTitle(profiles, copy, sampleName)}`}
              onTrack={(event) => {
                report(panel, event);
              }}
            />
          ) : (
            <TrackedStickChart
              positions={positionsOf(peaks.values, profiles.order)}
              categories={categories}
              series={panelSticks(profiles, profile, average, copy)}
              width={width}
              height={room - PANEL_TITLE_ROOM}
              y={{ ...scale, label: profiles.valueLabel }}
              xLabel={panel === last ? axisCaption(profiles.axis) : undefined}
              label={`${profile.label}. ${legendTitle(profiles, copy, sampleName)}`}
              onTrack={(event) => {
                report(panel, event);
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Where each drawn slot sits on the axis.
 *
 * A slot is not a measurement: the panels can be ordered by strength rather
 * than by position, and a stick has to stand where its measurement was
 * measured whichever order they were drawn in.
 * @param values - Where each measurement sits.
 * @param order - Which measurement each slot holds.
 * @returns One position per slot.
 */
function positionsOf(values: readonly number[], order: Int32Array): number[] {
  const positions = new Array<number>(order.length);
  for (let slot = 0; slot < order.length; slot++) {
    positions[slot] = values[order[slot] ?? slot] ?? Number.NaN;
  }
  return positions;
}

/**
 * Whether the panels are drawing the data's own units rather than weights.
 *
 * Bars are read from the zero line, and in those two views zero is not where
 * the reader's eye starts: an absorbance sits on a baseline, so bars grown
 * from nothing would be one tall column per measurement with the pattern
 * hidden in their tips. Those views draw lines whatever the axis is.
 * @param built - The panels as they were built.
 * @returns Whether zero is a meaningless place to grow a bar from.
 */
function inTheirOwnUnits(built: LoadingProfiles): boolean {
  return built.view === 'effect' || built.view === 'sample';
}

/** What the rebuilt sample is called when the viewer has not named it. */
const A_SAMPLE = 'the selected sample';
