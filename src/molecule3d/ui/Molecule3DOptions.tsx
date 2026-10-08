/**
 * The display options of the molecule viewer, shown in the toolbar's popover:
 * the representation, the size, and the surface's opacity, solvent probe and
 * colours, with a button returning them all to the defaults.
 */

import { Button, SegmentedControl, Slider } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import { formatDecimal } from '../../format/core/numbers.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { Molecule3DSettings } from '../core/settings.ts';
import {
  MOLECULE_3D_RANGES,
  REPRESENTATIONS,
  REPRESENTATION_LABELS,
  isRepresentationId,
  resetMolecule3DSettings,
  sameMolecule3DSettings,
} from '../core/settings.ts';

import { Molecule3DSurfaceColors } from './Molecule3DSurfaceColors.tsx';

/** Props of {@link Molecule3DOptions}. */
export interface Molecule3DOptionsProps {
  settings: Molecule3DSettings;
  onChange: (settings: Molecule3DSettings) => void;
  /** Topological polar surface area in Å², or `null` when unknown. */
  polarSurfaceArea: number | null;
  /** What the reset button returns to; `showSurface` is left as it is. */
  defaults: Molecule3DSettings;
}

/**
 * The options panel.
 * @param props - See {@link Molecule3DOptionsProps}.
 * @returns The panel.
 */
export function Molecule3DOptions(props: Molecule3DOptionsProps): ReactElement {
  const { settings, onChange, polarSurfaceArea, defaults } = props;
  const t = useChromeT();
  const reset = resetMolecule3DSettings(settings, defaults);
  const atDefaults = sameMolecule3DSettings(settings, reset);

  return (
    <div style={PANEL_STYLE}>
      <SegmentedControl
        fill
        size="small"
        intent="primary"
        options={REPRESENTATIONS.map((representation) => ({
          value: representation,
          label: t.or(
            `molecule3d.representation.${representation}`,
            REPRESENTATION_LABELS[representation],
          ),
        }))}
        value={settings.representation}
        onValueChange={(value) => {
          if (isRepresentationId(value)) {
            onChange({ ...settings, representation: value });
          }
        }}
      />
      <div style={GRID_STYLE}>
        <SliderRow
          label={t('molecule3d.size')}
          range={MOLECULE_3D_RANGES.sizeFactor}
          digits={1}
          value={settings.sizeFactor}
          testId="molecule3d-size-value"
          onChange={(sizeFactor) => {
            onChange({ ...settings, sizeFactor });
          }}
        />
        {settings.showSurface ? null : (
          <span style={SURFACE_OFF_STYLE} data-testid="molecule3d-surface-off">
            {t('molecule3d.surfaceOff')}
            <Button
              variant="minimal"
              size="small"
              intent="primary"
              text={t('molecule3d.showSurface')}
              onClick={() => {
                onChange({ ...settings, showSurface: true });
              }}
            />
          </span>
        )}
        <SliderRow
          label={t('molecule3d.surfaceOpacity')}
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
          label={t('molecule3d.solventProbe')}
          title={t('molecule3d.solventProbeHelp')}
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
      <span style={FOOTER_STYLE}>
        {/* A disabled button fires no hover, so the wrapper carries the why. */}
        <span title={atDefaults ? t('molecule3d.atDefaults') : undefined}>
          <Button
            variant="minimal"
            size="small"
            icon="reset"
            text={t('molecule3d.resetSettings')}
            disabled={atDefaults}
            data-testid="molecule3d-reset-settings"
            onClick={() => {
              onChange(reset);
            }}
          />
        </span>
      </span>
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

/** Spans the grid, between the size and the surface rows it explains. */
const SURFACE_OFF_STYLE: CSSProperties = {
  display: 'flex',
  gridColumn: '1 / -1',
  alignItems: 'center',
  justifyContent: 'space-between',
  color: 'var(--text-muted)',
  fontSize: 12,
};

const FOOTER_STYLE: CSSProperties = { display: 'flex', justifyContent: 'end' };

/** Room on both sides, so the handle is never clipped at either end. */
const SLIDER_STYLE: CSSProperties = { display: 'block', paddingInline: 8 };

const VALUE_STYLE: CSSProperties = {
  fontSize: 12,
  fontVariantNumeric: 'tabular-nums',
  textAlign: 'right',
};
