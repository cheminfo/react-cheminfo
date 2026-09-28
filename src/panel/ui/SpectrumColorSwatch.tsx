import { PopoverNext } from '@blueprintjs/core';
import { useState } from 'react';

import {
  EXTRA_SPECTRUM_COLORS,
  SPECTRUM_COLORS,
} from '../../chart/core/spectrumColor.ts';

export interface SpectrumColorSwatchProps {
  /** The colour the spectrum is drawn in. */
  color: string;
  /** What the list calls it, for the labels a screen reader reads out. */
  name: string;
  /** Called with the colour that was picked. */
  onPick: (color: string) => void;
}

/**
 * The chip that says what colour a spectrum is drawn in, and changes it.
 *
 * The palette is what `spectrumColor.ts` holds and nothing else: a free colour
 * picker would let two spectra be set to the same blue, or to a hue that
 * disappears against the chart, and telling the traces apart is the whole job
 * the colour has.
 *
 * Its two tiers are drawn as two rows, in that order and unlabelled. A row is
 * enough: the top one is what the chart uses by itself, so a reader who never
 * looks below it is already right, and one who does is choosing deliberately —
 * which is the only way a colour that asks more of its reader's eyes should
 * ever be picked. A legend explaining the difference would be read once and be
 * in the way afterwards; `spectrumColor.ts` is where the difference is written
 * down.
 *
 * One component for every viewer rather than one per package: a swatch that
 * opens a picker in the mass panel and walks the palette in the infrared one is
 * two different controls wearing the same chip, and whichever a reader learned
 * first is the wrong one in the other editor.
 * @param props - Component props.
 * @returns The chip.
 */
export function SpectrumColorSwatch(props: SpectrumColorSwatchProps) {
  const { color, name, onPick } = props;
  const [isOpen, setIsOpen] = useState(false);

  function offer(offered: string) {
    return (
      <button
        key={offered}
        type="button"
        title={offered}
        aria-label={`Draw ${name} in ${offered}`}
        style={{
          ...(offered === color ? activeSwatchStyle : swatchStyle),
          background: offered,
        }}
        onClick={() => {
          onPick(offered);
          setIsOpen(false);
        }}
      />
    );
  }

  return (
    <PopoverNext
      // A handful of chips need no arrow pointing back at a chip of the same
      // size.
      arrow={false}
      isOpen={isOpen}
      placement="bottom-start"
      onInteraction={setIsOpen}
      content={
        <div style={paletteStyle}>
          <div style={paletteRowStyle}>{SPECTRUM_COLORS.map(offer)}</div>
          <div style={paletteRowStyle}>{EXTRA_SPECTRUM_COLORS.map(offer)}</div>
        </div>
      }
    >
      <button
        type="button"
        title="Draw this spectrum in another colour"
        aria-label={`Colour of ${name}`}
        style={{ ...swatchStyle, background: color }}
      />
    </PopoverNext>
  );
}

/**
 * A round chip rather than a square one: it is the mark the chart's own
 * tooltip uses for a series, so the row and the chart name the same spectrum
 * the same way.
 */
const swatchStyle = {
  flex: 'none',
  width: 14,
  height: 14,
  padding: 0,
  borderRadius: '50%',
  border: '1px solid rgba(17, 20, 24, 0.2)',
  cursor: 'pointer',
} as const;

const activeSwatchStyle = {
  ...swatchStyle,
  border: '2px solid rgb(17 20 24)',
} as const;

const paletteStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  padding: 8,
} as const;

const paletteRowStyle = {
  display: 'flex',
  gap: 6,
} as const;
