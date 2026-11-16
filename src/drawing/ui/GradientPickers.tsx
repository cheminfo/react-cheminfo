import type { IconName } from '@blueprintjs/core';
import { Button } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';
import { useId } from 'react';

import type { GradientKind } from '../core/graphicGradients.ts';
import { splitColor } from '../core/palette.ts';
import type { Point } from '../core/types.ts';

/** How a fill may blend: flat, or one of the gradients. */
export type FillKind = GradientKind | 'flat';

/** What each way of blending is called, flat first. */
const KINDS: ReadonlyArray<{ value: FillKind; name: string }> = [
  { value: 'flat', name: 'Flat' },
  { value: 'linear', name: 'Linear' },
  { value: 'reflected', name: 'Reflected, as on a cylinder' },
  { value: 'radial', name: 'Radial, as on a sphere' },
];

/**
 * The ways a fill may blend, each a tile painted in the colours in use, the
 * one in use pressed.
 * @param props - The kind in use, the two colours, and what picking does.
 * @param props.value - The kind in use, undefined when the shapes differ.
 * @param props.from - The fill, `#rrggbb` or `#rrggbbaa`.
 * @param props.to - The colour it blends into.
 * @param props.onPick - Called with the kind picked.
 * @returns The row of tiles.
 */
export function GradientKindRow(props: {
  value: FillKind | undefined;
  from: string;
  to: string;
  onPick: (kind: FillKind) => void;
}): ReactElement {
  const { value, from, to, onPick } = props;
  const id = useId().replaceAll(/[^\w-]/g, '');
  return (
    <div className="gradient-kinds" role="group" aria-label="Gradient">
      {KINDS.map((kind) => (
        <button
          key={kind.value}
          type="button"
          className="gradient-kind"
          title={kind.name}
          aria-label={kind.name}
          aria-pressed={value === kind.value}
          onClick={() => {
            onPick(kind.value);
          }}
        >
          <svg viewBox="0 0 24 16" aria-hidden="true">
            <defs>
              {tilePaint(kind.value, `${id}-${kind.value}`, from, to)}
            </defs>
            <rect
              width="24"
              height="16"
              rx="2"
              fill={
                kind.value === 'flat'
                  ? splitColor(from).hex
                  : `url(#${id}-${kind.value})`
              }
            />
          </svg>
        </button>
      ))}
    </div>
  );
}

// The gradient a tile is painted with, in the box of the tile.
function tilePaint(
  kind: FillKind,
  id: string,
  from: string,
  to: string,
): ReactNode {
  if (kind === 'flat') return null;
  const stops =
    kind === 'reflected'
      ? [stop(0, to), stop(0.5, from), stop(1, to)]
      : [stop(0, from), stop(1, to)];
  return kind === 'radial' ? (
    <radialGradient id={id} r="0.7">
      {stops}
    </radialGradient>
  ) : (
    <linearGradient id={id}>{stops}</linearGradient>
  );
}

function stop(offset: number, color: string): ReactElement {
  const { hex, opacity } = splitColor(color);
  return (
    <stop
      key={offset}
      offset={offset}
      stopColor={hex}
      stopOpacity={opacity < 1 ? opacity : undefined}
    />
  );
}

/** A cell of a three-by-three grid, from -1 to 1 across and down. */
interface Cell {
  across: number;
  down: number;
}

const CELLS: readonly Cell[] = [-1, 0, 1].flatMap((down) =>
  [-1, 0, 1].map((across) => ({ across, down })),
);

/** The arrow pointing from the middle of the grid to each cell. */
const ARROWS: Readonly<Record<string, IconName>> = {
  '-1 -1': 'arrow-top-left',
  '0 -1': 'arrow-up',
  '1 -1': 'arrow-top-right',
  '-1 0': 'arrow-left',
  '1 0': 'arrow-right',
  '-1 1': 'arrow-bottom-left',
  '0 1': 'arrow-down',
  '1 1': 'arrow-bottom-right',
};

const SIDES = ['top', '', 'bottom'];
const ENDS = ['left', '', 'right'];

/**
 * The direction a gradient runs in, as eight arrows round a square, the one
 * it runs along pressed.
 * @param props - The direction in use and what picking does.
 * @param props.angle - The direction, clockwise from left to right, in
 * degrees; undefined when the shapes differ.
 * @param props.onPick - Called with the direction picked, in degrees.
 * @returns The grid.
 */
export function DirectionGrid(props: {
  angle: number | undefined;
  onPick: (angle: number) => void;
}): ReactElement {
  return (
    <div className="point-grid" role="group" aria-label="Direction">
      {CELLS.map(({ across, down }) => {
        const icon = ARROWS[`${across} ${down}`];
        if (!icon) return <span key="middle" />;
        const angle = cellAngle(across, down);
        return (
          <Button
            key={icon}
            size="small"
            variant="minimal"
            icon={icon}
            active={props.angle === angle}
            aria-pressed={props.angle === angle}
            aria-label={`Towards the ${placeName(across, down)}`}
            onClick={() => {
              props.onPick(angle);
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * Where a radial gradient starts, as nine points of the shape, the one it
 * starts from pressed.
 * @param props - The centre in use and what picking does.
 * @param props.centre - The centre, -1 to 1 across and down; undefined when
 * the shapes differ.
 * @param props.onPick - Called with the centre picked.
 * @returns The grid.
 */
export function CentreGrid(props: {
  centre: Point | undefined;
  onPick: (centre: Point) => void;
}): ReactElement {
  const { centre } = props;
  return (
    <div className="point-grid" role="group" aria-label="Centre">
      {CELLS.map(({ across, down }) => {
        const pressed = centre?.x === across && centre.y === down;
        const name = `From the ${placeName(across, down)}`;
        return (
          <Button
            key={`${across} ${down}`}
            size="small"
            variant="minimal"
            icon={pressed ? 'full-circle' : 'circle'}
            active={pressed}
            aria-pressed={pressed}
            aria-label={name}
            title={name}
            onClick={() => {
              props.onPick({ x: across, y: down });
            }}
          />
        );
      })}
    </div>
  );
}

// A cell named as a place of the shape: the top left, the right, the middle.
function placeName(across: number, down: number): string {
  const words = [SIDES[down + 1], ENDS[across + 1]].filter(Boolean);
  return words.length > 0 ? words.join(' ') : 'middle';
}

function cellAngle(across: number, down: number): number {
  const degrees = (Math.atan2(down, across) * 180) / Math.PI;
  return (degrees + 360) % 360;
}
