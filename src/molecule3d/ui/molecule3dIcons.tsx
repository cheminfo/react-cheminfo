/**
 * The glyphs of the molecule toolbar that Blueprint has no icon for, drawn in
 * one language: atoms as dots, bonds as lines, 16 px, in `currentColor` so
 * they follow the button's own state.
 */

import type { ReactElement } from 'react';

import type { MeasurementKind } from '../core/measurement.ts';

/** The atoms a measurement joins, drawn as dots and the bonds between them. */
const ICON_POINTS: Record<MeasurementKind, ReadonlyArray<[number, number]>> = {
  distance: [
    [2.5, 8],
    [13.5, 8],
  ],
  angle: [
    [13, 3],
    [3, 13],
    [13.5, 13],
  ],
  dihedral: [
    [2, 4],
    [6, 12.5],
    [10, 3.5],
    [14, 12],
  ],
};

/**
 * The glyph of one measuring tool.
 * @param props - Which measurement.
 * @param props.kind - The measurement the tool builds.
 * @returns The 16 px glyph.
 */
export function MeasureIcon(props: { kind: MeasurementKind }): ReactElement {
  const { kind } = props;
  const points = ICON_POINTS[kind];
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden>
      <polyline
        points={points.map((point) => point.join(',')).join(' ')}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.3}
        strokeDasharray={kind === 'distance' ? '2 1.5' : undefined}
      />
      {points.map(([x, y]) => (
        <circle key={`${x},${y}`} cx={x} cy={y} r={1.9} fill="currentColor" />
      ))}
    </svg>
  );
}

/**
 * A measured distance crossed out: the button removes measurements, and only
 * measurements, which a generic trash can would not say.
 * @returns The 16 px glyph.
 */
export function ClearMeasurementsIcon(): ReactElement {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden>
      <polyline
        points="2.2,5.5 11,5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.3}
        strokeDasharray="2 1.5"
      />
      <circle cx={2.2} cy={5.5} r={1.9} fill="currentColor" />
      <circle cx={11} cy={5.5} r={1.9} fill="currentColor" />
      <path
        d="M9.6 9.6l4.8 4.8M14.4 9.6l-4.8 4.8"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * A three-atom molecule wrapped in a translucent blob: the surface drawn over
 * the model.
 * @returns The 16 px glyph.
 */
export function SurfaceIcon(): ReactElement {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden>
      <path
        d="M8 1.2c2.9 0 5.9 1.7 6.3 4.6.3 1.9-.7 2.9-.4 4.4.4 2.2-1.9 4.6-5.1 4.6-3 0-6.3-1.6-6.8-4.4C1.6 8.8 2.6 7.8 2.4 6.2 2 3.4 5 1.2 8 1.2Z"
        fill="currentColor"
        fillOpacity={0.18}
        stroke="currentColor"
        strokeWidth={0.9}
      />
      <polyline
        points="5.1,10.2 8,5.8 10.9,10.2"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.1}
      />
      <circle cx={5.1} cy={10.2} r={1.4} fill="currentColor" />
      <circle cx={8} cy={5.8} r={1.4} fill="currentColor" />
      <circle cx={10.9} cy={10.2} r={1.4} fill="currentColor" />
    </svg>
  );
}
