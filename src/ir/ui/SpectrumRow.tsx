import { Button } from 'react-science/ui';

import { SpectrumColorSwatch } from '../../panel/ui/SpectrumColorSwatch.tsx';
import { formatWavenumberRange } from '../core/irFormat.ts';
import type { IrSpectrum } from '../core/irSpectrum.ts';
import type { IrTechnique } from '../core/irTechnique.ts';
import { IR_TECHNIQUE_RULES } from '../core/irTechnique.ts';

export interface SpectrumRowProps {
  /** The spectrum the row is about. */
  spectrum: IrSpectrum;
  /**
   * What it was measured with, which decides the order its range is written
   * in: high to low for infrared, low to high for Raman.
   * @default 'infrared'
   */
  technique?: IrTechnique;
  /** Whether the panels are about it. */
  selected: boolean;
  /** Point the panels at it. */
  onSelect: () => void;
  /** Draw it, or stop drawing it. */
  onToggle: () => void;
  /** Draw it in another colour of the palette. */
  onColor: (color: string) => void;
  /** Hand it over as a file. */
  onDownload: () => void;
  /** Close it. */
  onRemove: () => void;
  /** Call it something else. */
  onRename: (name: string) => void;
}

/**
 * One spectrum: its colour, its name, where it runs, and what can be done to it.
 * @param props - Component props.
 * @returns The row.
 */
export function SpectrumRow(props: SpectrumRowProps) {
  const {
    spectrum,
    technique = 'infrared',
    selected,
    onSelect,
    onToggle,
    onColor,
    onDownload,
    onRemove,
    onRename,
  } = props;

  const range = formatWavenumberRange(
    spectrum.wavenumber,
    IR_TECHNIQUE_RULES[technique].reverseX,
  );

  return (
    <div
      style={selected ? selectedRowStyle : rowStyle}
      data-selected={selected ? 'true' : undefined}
    >
      <Button
        variant="minimal"
        icon={spectrum.visible ? 'eye-open' : 'eye-off'}
        tooltipProps={{ content: spectrum.visible ? 'Hide' : 'Draw' }}
        aria-label={spectrum.visible ? 'Hide this spectrum' : 'Draw it'}
        onClick={onToggle}
      />

      {/* The swatch is the colour control: a spectrum is told from the others by
          its colour, so the colour is where a reader reaches to change it. */}
      <SpectrumColorSwatch
        color={spectrum.color}
        name={spectrum.name}
        onPick={onColor}
      />

      <input
        style={nameStyle}
        value={spectrum.name}
        spellCheck={false}
        autoComplete="off"
        aria-label="What this spectrum is called"
        onFocus={onSelect}
        onChange={(event) => onRename(event.target.value)}
      />

      <span style={rangeStyle}>{range}</span>

      <Button
        variant="minimal"
        icon="download"
        tooltipProps={{ content: 'Download this spectrum as a JCAMP-DX file' }}
        aria-label="Download this spectrum"
        onClick={onDownload}
      />

      <Button
        variant="minimal"
        icon="cross"
        intent="danger"
        tooltipProps={{ content: 'Close this spectrum' }}
        aria-label="Close this spectrum"
        onClick={onRemove}
      />
    </div>
  );
}

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: '1px 2px',
  borderRadius: 3,
} as const;

const selectedRowStyle = { ...rowStyle, background: '#e8f1fb' } as const;

const nameStyle = {
  flex: '1 1 1px',
  minWidth: 0,
  border: '1px solid transparent',
  borderRadius: 2,
  background: 'transparent',
  font: 'inherit',
  fontSize: 12,
  padding: '1px 3px',
} as const;

const rangeStyle = {
  flex: 'none',
  fontSize: 11,
  opacity: 0.6,
  fontVariantNumeric: 'tabular-nums',
} as const;
