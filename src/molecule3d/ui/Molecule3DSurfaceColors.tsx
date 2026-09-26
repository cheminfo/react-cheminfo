/**
 * The colour section of the options popover: how the surface is coloured, its
 * colour in uniform mode, and the legend and polar surface area in polarity
 * mode.
 */

import { SegmentedControl } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';
import { ColorPickerDropdown } from 'react-science/ui';

import { formatDecimal } from '../../format/core/numbers.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { Molecule3DSettings } from '../core/settings.ts';
import {
  SURFACE_CHARGE_COLORS,
  SURFACE_COLORINGS,
  SURFACE_COLORING_LABELS,
  isSurfaceColoringId,
} from '../core/settings.ts';

/** Props of {@link Molecule3DSurfaceColors}. */
export interface Molecule3DSurfaceColorsProps {
  settings: Molecule3DSettings;
  onChange: (settings: Molecule3DSettings) => void;
  /** Topological polar surface area in Å², or `null` when unknown. */
  polarSurfaceArea: number | null;
}

/**
 * The surface colour controls.
 * @param props - See {@link Molecule3DSurfaceColorsProps}.
 * @returns The section.
 */
export function Molecule3DSurfaceColors(
  props: Molecule3DSurfaceColorsProps,
): ReactElement {
  const { settings, onChange, polarSurfaceArea } = props;
  const t = useChromeT();
  const disabled = !settings.showSurface;
  const { surfaceColoring, surfaceColor } = settings;

  return (
    <div style={SECTION_STYLE}>
      <span style={LABEL_STYLE}>{t('molecule3d.surfaceColour')}</span>
      <SegmentedControl
        fill
        size="small"
        disabled={disabled}
        options={SURFACE_COLORINGS.map((coloring) => ({
          value: coloring,
          label: t.or(
            `molecule3d.coloring.${coloring}`,
            SURFACE_COLORING_LABELS[coloring],
          ),
        }))}
        value={surfaceColoring}
        onValueChange={(value) => {
          if (isSurfaceColoringId(value)) {
            onChange({ ...settings, surfaceColoring: value });
          }
        }}
      />
      {surfaceColoring === 'uniform' && (
        <span style={ROW_STYLE}>
          <span style={LABEL_STYLE}>{t('molecule3d.colour')}</span>
          {disabled ? (
            <span style={{ ...SWATCH_STYLE, background: surfaceColor }} />
          ) : (
            // The dropdown's button fills its parent; the span gives it a size.
            <span style={PICKER_STYLE} data-testid="molecule3d-surface-color">
              <ColorPickerDropdown
                color={{ hex: surfaceColor }}
                disableAlpha
                onChange={(result) => {
                  onChange({ ...settings, surfaceColor: result.hex });
                }}
              />
            </span>
          )}
        </span>
      )}
      {surfaceColoring === 'polarity' && (
        <>
          <span style={ROW_STYLE} data-testid="molecule3d-polarity-legend">
            <LegendItem color={SURFACE_CHARGE_COLORS.positive} label="δ+" />
            <LegendItem color={SURFACE_CHARGE_COLORS.negative} label="δ−" />
            <LegendItem
              color={SURFACE_CHARGE_COLORS.neutral}
              label={t('molecule3d.neutral')}
            />
          </span>
          <span
            style={LABEL_STYLE}
            title={t('molecule3d.tpsaHelp')}
            data-testid="molecule3d-tpsa-value"
          >
            TPSA:{' '}
            {polarSurfaceArea === null
              ? '—'
              : `${formatDecimal(polarSurfaceArea, 1)} Å²`}
          </span>
        </>
      )}
    </div>
  );
}

function LegendItem(props: { color: string; label: string }): ReactElement {
  return (
    <span style={LEGEND_ITEM_STYLE}>
      <span style={{ ...LEGEND_SWATCH_STYLE, background: props.color }} />
      <span style={LABEL_STYLE}>{props.label}</span>
    </span>
  );
}

const SECTION_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const ROW_STYLE: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 12,
};

const LABEL_STYLE: CSSProperties = { fontSize: 12 };

const PICKER_STYLE: CSSProperties = { display: 'inline-block', width: 40 };

const SWATCH_STYLE: CSSProperties = {
  display: 'inline-block',
  width: 40,
  height: 30,
  borderRadius: 3,
  opacity: 0.5,
};

const LEGEND_ITEM_STYLE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
};

const LEGEND_SWATCH_STYLE: CSSProperties = {
  display: 'inline-block',
  width: 12,
  height: 12,
  borderRadius: 2,
};
