import type { ReactElement } from 'react';

import { roundTo } from '../../format/core/roundTo.ts';
import { NumberInput } from '../../number/ui/NumberInput.tsx';
import { OverlayRow } from '../../overlay/ui/OverlayRow.tsx';
import { useOverlaySurface } from '../../overlay/ui/overlaySurface.ts';
import { TOKEN } from '../../tokens/core/familyTokens.ts';
import { CSS_PIXELS_PER_INCH } from '../core/figureDpi.ts';
import {
  FIGURE_LAYOUT_MAX,
  FIGURE_LAYOUT_MIN,
  figureLayoutSide,
} from '../core/figureLayout.ts';

/** What {@link FigureWidthField} needs. */
export interface FigureWidthFieldProps {
  /** What the row is called. */
  label: string;
  /** The width, in pixels of the page. */
  value: number;
  /** Called with the width typed, in pixels of the page. */
  onChange: (width: number) => void;
}

/**
 * The width a figure is saved at, typed in centimetres: the unit a journal
 * gives it in.
 * @param props - See {@link FigureWidthFieldProps}.
 * @returns The row.
 */
export function FigureWidthField(props: FigureWidthFieldProps): ReactElement {
  const { label, value, onChange } = props;
  const { metrics } = useOverlaySurface();

  return (
    <OverlayRow label={label}>
      <NumberInput
        size={metrics.blueprintSize}
        value={centimetres(value)}
        min={centimetres(FIGURE_LAYOUT_MIN)}
        max={centimetres(FIGURE_LAYOUT_MAX)}
        step={0.5}
        buttons={false}
        ariaLabel={label}
        rightElement={<span style={UNIT_STYLE}>cm</span>}
        onChange={(typed) => {
          onChange(
            figureLayoutSide(
              (typed / CENTIMETRES_PER_INCH) * CSS_PIXELS_PER_INCH,
            ),
          );
        }}
      />
    </OverlayRow>
  );
}

const CENTIMETRES_PER_INCH = 2.54;

const UNIT_STYLE = { padding: '0 6px', color: TOKEN.textMuted };

function centimetres(pixels: number): number {
  return roundTo((pixels / CSS_PIXELS_PER_INCH) * CENTIMETRES_PER_INCH, 1);
}
