import { FormGroup, HTMLSelect } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import {
  POINTS_PER_CM,
  centimetres,
  clampSide,
  sameFigureSize,
} from '../core/pages.ts';
import type { Box, FigureSize } from '../core/types.ts';

import type { PageChange } from './PageField.tsx';
import { FigureSideInput } from './PageSideInput.tsx';

/** What the menu offers: fitting the drawing, or a size. */
interface FigureChoice {
  id: string;
  name: string;
  size: FigureSize | undefined;
}

const FIT = 'fit';
const CUSTOM = 'custom';

/** What {@link FigureField} is given. */
export interface FigureFieldProps {
  /** The size of the figure, when it sets a side. */
  size: FigureSize | undefined;
  /** The journal's column widths, in points, when the style names a journal. */
  columns: { single: number; double: number } | undefined;
  /** The box that fits the drawing, in points. */
  fitted: Box;
  /**
   * Called with the size asked for: `picked` from the menu, after which the
   * whole figure is usually framed, or `typed` side by side.
   */
  onChange: (size: FigureSize | undefined, how: PageChange) => void;
}

/**
 * The size of the figure as it is saved and copied: by default the drawing and
 * a narrow margin; or a journal column, centred on the drawing. A figure of a
 * set size shows its width and height, which can be typed.
 * @param props - See {@link FigureFieldProps}.
 * @returns A row of a form.
 */
export function FigureField(props: FigureFieldProps): ReactElement {
  const { size, columns, fitted, onChange } = props;
  const choices = figureChoices(columns);
  const matched = choices.find((choice) => sameFigureSize(choice.size, size));
  return (
    <FormGroup label="Figure" helperText={figureLine(size, fitted)}>
      <HTMLSelect
        iconName="caret-down"
        fill
        value={matched?.id ?? CUSTOM}
        aria-label="Figure size"
        options={[
          ...choices.map((choice) => ({
            value: choice.id,
            label: choice.name,
          })),
          { value: CUSTOM, label: 'Another size' },
        ]}
        onChange={(event) => {
          const id = event.currentTarget.value;
          const chosen = choices.find((choice) => choice.id === id);
          if (chosen) onChange(chosen.size, 'picked');
          else if (!size) onChange(rounded(fitted), 'picked');
        }}
      />
      {size ? (
        <div className="page-field__size">
          <FigureSideInput
            label="Figure width"
            value={size.width}
            onChange={(width) => {
              onChange(withSide(size, 'width', width), 'typed');
            }}
          />
          <span aria-hidden="true">×</span>
          <FigureSideInput
            label="Figure height"
            value={size.height}
            onChange={(height) => {
              onChange(withSide(size, 'height', height), 'typed');
            }}
          />
          <span className="page-field__unit">cm</span>
        </div>
      ) : null}
    </FormGroup>
  );
}

function figureChoices(
  columns: { single: number; double: number } | undefined,
): FigureChoice[] {
  const fit: FigureChoice = {
    id: FIT,
    name: 'Fit the drawing',
    size: undefined,
  };
  if (!columns) return [fit];
  return [
    fit,
    {
      id: 'column',
      name: `One column, ${centimetres(columns.single)} wide`,
      size: { width: columns.single },
    },
    {
      id: 'columns',
      name: `Two columns, ${centimetres(columns.double)} wide`,
      size: { width: columns.double },
    },
  ];
}

// What is saved, and whether the drawing spills over it.
function figureLine(size: FigureSize | undefined, fitted: Box): string {
  if (!size) return 'Saved and copied with a 4 pt margin.';
  const spills =
    (size.width !== undefined && fitted.width > size.width) ||
    (size.height !== undefined && fitted.height > size.height);
  return spills
    ? 'Centred on the drawing, which spills over and is cut.'
    : 'Centred on the drawing. An empty side fits it.';
}

function withSide(
  size: FigureSize,
  side: keyof FigureSize,
  length: number | undefined,
): FigureSize | undefined {
  const { [side]: _side, ...rest } = size;
  const next: FigureSize =
    length === undefined ? rest : { ...rest, [side]: length };
  return next.width === undefined && next.height === undefined
    ? undefined
    : next;
}

// A size picked from the drawing, to the millimetre.
function rounded(size: Box): FigureSize {
  return {
    width: clampSide(roundTenth(size.width / POINTS_PER_CM) * POINTS_PER_CM),
    height: clampSide(roundTenth(size.height / POINTS_PER_CM) * POINTS_PER_CM),
  };
}

function roundTenth(value: number): number {
  return Math.round(value * 10) / 10;
}
