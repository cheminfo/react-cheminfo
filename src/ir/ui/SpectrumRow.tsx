import { Button } from 'react-science/ui';

import { SpectrumColorSwatch } from '../../panel/ui/SpectrumColorSwatch.tsx';
import { formatWavenumber } from '../core/irFormat.ts';
import type { IrSpectrum } from '../core/irSpectrum.ts';

export interface SpectrumRowProps {
  /** The spectrum the row is about. */
  spectrum: IrSpectrum;
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
    selected,
    onSelect,
    onToggle,
    onColor,
    onDownload,
    onRemove,
    onRename,
  } = props;

  const range =
    spectrum.wavenumber.length === 0
      ? ''
      : `${formatWavenumber(spectrum.wavenumber.at(-1) as number)}–${formatWavenumber(spectrum.wavenumber[0] as number)} cm⁻¹`;

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
