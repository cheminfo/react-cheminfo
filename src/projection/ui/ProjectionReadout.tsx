import type { ReactElement } from 'react';
import { useMemo } from 'react';

import type { OverlayReadoutRow } from '../../overlay/ui/OverlayReadout.tsx';
import { OverlayReadout } from '../../overlay/ui/OverlayReadout.tsx';
import type { ProjectionResult } from '../core/projectionResult.ts';
import type {
  ProjectionSamples,
  ResolvedProjectionGroups,
} from '../core/projectionSamples.ts';

import { formatProjectionValue } from './projectionFormat.ts';

/** What {@link ProjectionReadout} says, and where. */
export interface ProjectionReadoutProps {
  /** The row the card is about, as an index into the score matrix. */
  index: number;
  /** What the run produced, for the axis names and the sample's own scores. */
  result: ProjectionResult;
  /** Who the rows are. */
  samples: ProjectionSamples;
  /** The groups as the figure draws them, for the row's group and its colour. */
  groups: ResolvedProjectionGroups;
  /** Which axis is drawn horizontally, from 0. */
  xAxis: number;
  /** Which axis is drawn vertically. */
  yAxis: number;
  /**
   * Which axis runs away from the reader, on the cloud. It is the one place a
   * cloud's third number is written at all: the box carries no tick labels, so
   * a reader who wants a value points at the sample.
   * @default undefined — the card names two axes, as the map's does
   */
  zAxis?: number;
  /** Where the pointer is, in pixels from the figure's left. */
  x: number;
  /** Where the pointer is, in pixels from the figure's top. */
  y: number;
  /** Width of the figure, so the card can be flipped rather than clipped. */
  boxWidth: number;
  /** Height of the figure. */
  boxHeight: number;
  /**
   * How a number is written.
   * @default a rounding to three decimals with the trailing zeros dropped
   */
  formatValue?: (value: number) => string;
  /**
   * The most rows shown before a `+ n more` footer.
   * @default 12
   */
  maxRows?: number;
  /**
   * Whether the card stays until it is dismissed.
   * @default false
   */
  pinned?: boolean;
  /**
   * Called when the reader dismisses a pinned card.
   * @default undefined
   */
  onUnpin?: () => void;
  /**
   * Value of the `data-testid` attribute of the card.
   * @default undefined
   */
  testId?: string;
}

/**
 * The card that says everything known about the sample under the pointer.
 *
 * It opens with what the reader can name the sample by, and only then with the
 * two numbers the figure is drawn from: a card that led with `−2.257` would be
 * asking a reader who has never met a component to care about the arithmetic
 * before they have found their own sample in it. Whatever else is known comes
 * last and in the caller's own order, because it is the part they came for and
 * the part this package cannot guess at.
 * @param props - See {@link ProjectionReadoutProps}.
 * @returns The card.
 */
export function ProjectionReadout(props: ProjectionReadoutProps): ReactElement {
  const {
    index,
    result,
    samples,
    groups,
    xAxis,
    yAxis,
    zAxis,
    x,
    y,
    boxWidth,
    boxHeight,
    formatValue = formatProjectionValue,
    maxRows = 12,
    pinned = false,
    onUnpin,
    testId,
  } = props;

  const drawn = useMemo(
    () => (zAxis === undefined ? [xAxis, yAxis] : [xAxis, yAxis, zAxis]),
    [xAxis, yAxis, zAxis],
  );
  const rows = useMemo(
    () => readoutRows(index, result, samples, groups, drawn, formatValue),
    [drawn, formatValue, groups, index, result, samples],
  );

  return (
    <OverlayReadout
      x={x}
      y={y}
      boxWidth={boxWidth}
      boxHeight={boxHeight}
      title={samples.ids[index] ?? ''}
      rows={rows}
      maxRows={maxRows}
      pinned={pinned}
      onUnpin={onUnpin}
      testId={testId}
    />
  );
}

function readoutRows(
  index: number,
  result: ProjectionResult,
  samples: ProjectionSamples,
  groups: ResolvedProjectionGroups,
  drawn: readonly number[],
  formatValue: (value: number) => string,
): OverlayReadoutRow[] {
  const rows: OverlayReadoutRow[] = [];
  const { axes, scores } = result;
  const known = index >= 0 && index < scores.rows;

  for (const axis of drawn) {
    const name = axes[axis]?.name;
    if (name === undefined) continue;
    rows.push({
      label: name,
      value: formatValue(known ? scores.get(index, axis) : Number.NaN),
    });
  }

  const group = groups.entries[groups.groupOf[index] ?? -1];
  if (group !== undefined) {
    rows.push({ label: groups.label, value: group.label, color: group.color });
  }

  if (known && samples.fields !== undefined) {
    for (const field of samples.fields(index)) {
      rows.push({ label: field.label, value: field.value });
    }
  }
  return rows;
}
