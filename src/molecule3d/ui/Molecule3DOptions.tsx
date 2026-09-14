/**
 * The display options of the molecule viewer, shown in the toolbar's popover:
 * the representation, the size, and the surface's opacity, solvent probe and
 * colours.
 */

import { SegmentedControl, Slider } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import { formatDecimal } from '../../format/core/numbers.ts';
import type { Molecule3DSettings } from '../core/settings.ts';
import {
  MOLECULE_3D_RANGES,
  REPRESENTATIONS,
  REPRESENTATION_LABELS,
  isRepresentationId,
} from '../core/settings.ts';

import { Molecule3DSurfaceColors } from './Molecule3DSurfaceColors.tsx';

/** Props of {@link Molecule3DOptions}. */
export interface Molecule3DOptionsProps {
  settings: Molecule3DSettings;
  onChange: (settings: Molecule3DSettings) => void;
  /** Topological polar surface area in Å², or `null` when unknown. */
  polarSurfaceArea: number | null;
}

/**
 * The options panel.
 * @param props - See {@link Molecule3DOptionsProps}.
 * @returns The panel.
 */
export function Molecule3DOptions(props: Molecule3DOptionsProps): ReactElement {
  const { settings, onChange, polarSurfaceArea } = props;

  return (
    <div style={PANEL_STYLE}>
      <SegmentedControl
        fill
        size="small"
        intent="primary"
        options={REPRESENTATION_OPTIONS}
        value={settings.representation}
        onValueChange={(value) => {
          if (isRepresentationId(value)) {
            onChange({ ...settings, representation: value });
          }
        }}
      />
      <div style={GRID_STYLE}>
        <SliderRow
          label="Size"
          range={MOLECULE_3D_RANGES.sizeFactor}
          digits={1}
          value={settings.sizeFactor}
          testId="molecule3d-size-value"
          onChange={(sizeFactor) => {
            onChange({ ...settings, sizeFactor });
          }}
        />
        <SliderRow
          label="Surface opacity"
          range={MOLECULE_3D_RANGES.surfaceAlpha}
          digits={2}
          value={settings.surfaceAlpha}
          disabled={!settings.showSurface}
          testId="molecule3d-opacity-value"
          onChange={(surfaceAlpha) => {
            onChange({ ...settings, surfaceAlpha });
          }}
        />
        <SliderRow
          label="Solvent probe [Å]"
          title={PROBE_HELP}
          range={MOLECULE_3D_RANGES.probeRadius}
          digits={1}
          value={settings.probeRadius}
          disabled={!settings.showSurface}
          testId="molecule3d-probe-value"
          onChange={(probeRadius) => {
            onChange({ ...settings, probeRadius });
          }}
        />
      </div>
      <Molecule3DSurfaceColors
        settings={settings}
        onChange={onChange}
        polarSurfaceArea={polarSurfaceArea}
      />
    </div>
  );
}

interface SliderRowProps {
  label: string;
  title?: string;
  range: { minimum: number; maximum: number; step: number };
  digits: number;
  value: number;
  disabled?: boolean;
  testId: string;
  onChange: (value: number) => void;
}

/**
 * Label, slider and value as three grid cells; tick labels would collide.
 * @param props - See {@link SliderRowProps}.
 * @returns The three cells.
 */
function SliderRow(props: SliderRowProps): ReactElement {
  return (
    <>
      <span style={LABEL_STYLE} title={props.title}>
        {props.label}
      </span>
      <span style={SLIDER_STYLE}>
        <Slider
          min={props.range.minimum}
          max={props.range.maximum}
          stepSize={props.range.step}
          labelRenderer={false}
          disabled={props.disabled}
          value={props.value}
          onChange={props.onChange}
        />
      </span>
      <span style={VALUE_STYLE} data-testid={props.testId}>
        {formatDecimal(props.value, props.digits)}
      </span>
    </>
  );
}

const REPRESENTATION_OPTIONS = REPRESENTATIONS.map((representation) => ({
  value: representation,
  label: REPRESENTATION_LABELS[representation],
}));

const PROBE_HELP =
  'Radius of the solvent sphere rolled over the atoms. 1.4 Å is a water molecule; a larger probe smooths the surface and closes the narrow pockets.';

const PANEL_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  width: 300,
  padding: 12,
};

const GRID_STYLE: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'max-content minmax(0, 1fr) 3em',
  alignItems: 'center',
  columnGap: 10,
  rowGap: 6,
};

const LABEL_STYLE: CSSProperties = { fontSize: 12 };

/** Room on both sides, so the handle is never clipped at either end. */
const SLIDER_STYLE: CSSProperties = { display: 'block', paddingInline: 8 };

const VALUE_STYLE: CSSProperties = {
  fontSize: 12,
  fontVariantNumeric: 'tabular-nums',
  textAlign: 'right',
};
