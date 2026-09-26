/**
 * The toolbars floating over the molecule canvas: the view — reset, spin,
 * surface, and the options, export and help popovers — in one vertical
 * react-science `Toolbar`, and the measuring tools with their own clear button
 * in a second one under it.
 */

import { Card } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';
import { Toolbar } from 'react-science/ui';

import { useChromeT } from '../../i18n/ui/useT.ts';
import type { MeasurementKind } from '../core/measurement.ts';
import {
  MEASUREMENT_ATOM_COUNTS,
  MEASUREMENT_KINDS,
  MEASUREMENT_LABELS,
} from '../core/measurement.ts';
import type { Molecule3DTools } from '../core/settings.ts';

import { Molecule3DHelp } from './Molecule3DHelp.tsx';
import {
  ClearMeasurementsIcon,
  MeasureIcon,
  SurfaceIcon,
} from './molecule3dIcons.tsx';

/** Props of {@link Molecule3DToolbar}. */
export interface Molecule3DToolbarProps {
  tools: Molecule3DTools;
  measureKind: MeasurementKind | null;
  onMeasureKindChange: (kind: MeasurementKind | null) => void;
  measurementCount: number;
  onClearMeasurements: () => void;
  spinning: boolean;
  onSpinningChange: (spinning: boolean) => void;
  showSurface: boolean;
  onShowSurfaceChange: (showSurface: boolean) => void;
  onResetView: () => void;
  /** Content of the options popover. */
  options: ReactElement;
  /** Content of the export popover. */
  exportPanel: ReactElement;
}

/**
 * The two toolbars; either is left out when none of its tools is on.
 * @param props - See {@link Molecule3DToolbarProps}.
 * @returns The toolbars, stacked.
 */
export function Molecule3DToolbar(props: Molecule3DToolbarProps): ReactElement {
  const {
    tools,
    measureKind,
    onMeasureKindChange,
    measurementCount,
    onClearMeasurements,
    spinning,
    onSpinningChange,
    showSurface,
    onShowSurfaceChange,
    onResetView,
    options,
    exportPanel,
  } = props;
  const t = useChromeT();
  const hasView =
    tools.spin ||
    tools.surface ||
    tools.reset ||
    tools.options ||
    tools.export ||
    tools.help;

  return (
    <div style={COLUMN_STYLE}>
      {hasView && (
        <Card elevation={1} style={CARD_STYLE}>
          <Toolbar vertical aria-label={t('molecule3d.view')}>
            {tools.reset && (
              <Toolbar.Item
                icon="zoom-to-fit"
                aria-label={t('molecule3d.resetView')}
                tooltip={t('molecule3d.resetView')}
                tooltipProps={TOOLTIP_PROPS}
                onClick={onResetView}
              />
            )}
            {tools.spin && (
              <Toolbar.Item
                icon="refresh"
                active={spinning}
                aria-label={t('molecule3d.spin')}
                tooltip={t('molecule3d.spin')}
                tooltipProps={TOOLTIP_PROPS}
                onClick={() => {
                  onSpinningChange(!spinning);
                }}
              />
            )}
            {tools.surface && (
              <Toolbar.Item
                icon={<SurfaceIcon />}
                active={showSurface}
                aria-label={t('molecule3d.surface')}
                tooltip={t('molecule3d.molecularSurface')}
                tooltipProps={TOOLTIP_PROPS}
                onClick={() => {
                  onShowSurfaceChange(!showSurface);
                }}
              />
            )}
            {tools.options && (
              <Toolbar.PopoverItem
                placement="right-start"
                content={options}
                itemProps={{
                  icon: 'cog',
                  'aria-label': t('molecule3d.displayOptions'),
                  tooltip: t('molecule3d.displayOptions'),
                  tooltipProps: TOOLTIP_PROPS,
                }}
              />
            )}
            {tools.export && (
              <Toolbar.PopoverItem
                placement="right-start"
                content={exportPanel}
                itemProps={{
                  icon: 'download',
                  'aria-label': t('molecule3d.exportImage'),
                  tooltip: t('molecule3d.exportImage'),
                  tooltipProps: TOOLTIP_PROPS,
                }}
              />
            )}
            {tools.help && (
              <Toolbar.PopoverItem
                placement="right-start"
                content={<Molecule3DHelp />}
                itemProps={{
                  icon: 'help',
                  'aria-label': t('structure.mouseAndKeyboard'),
                  tooltip: t('structure.mouseAndKeyboard'),
                  tooltipProps: TOOLTIP_PROPS,
                }}
              />
            )}
          </Toolbar>
        </Card>
      )}
      {tools.measure && (
        <Card elevation={1} style={CARD_STYLE}>
          <Toolbar vertical aria-label={t('molecule3d.measure')}>
            {MEASUREMENT_KINDS.map((kind) => (
              <Toolbar.Item
                key={kind}
                icon={<MeasureIcon kind={kind} />}
                active={measureKind === kind}
                aria-label={t.or(
                  `molecule3d.measurement.${kind}`,
                  MEASUREMENT_LABELS[kind],
                )}
                tooltip={t('molecule3d.measurementTooltip', {
                  what: t.or(
                    `molecule3d.measurement.${kind}`,
                    MEASUREMENT_LABELS[kind],
                  ),
                  atoms: MEASUREMENT_ATOM_COUNTS[kind],
                })}
                tooltipProps={TOOLTIP_PROPS}
                onClick={() => {
                  onMeasureKindChange(measureKind === kind ? null : kind);
                }}
              />
            ))}
            <Toolbar.Item
              icon={<ClearMeasurementsIcon />}
              disabled={measurementCount === 0}
              aria-label={t('molecule3d.clearMeasurements')}
              tooltip={t('molecule3d.clearMeasurements')}
              tooltipProps={TOOLTIP_PROPS}
              onClick={onClearMeasurements}
            />
          </Toolbar>
        </Card>
      )}
    </div>
  );
}

const TOOLTIP_PROPS = { placement: 'right' } as const;

const COLUMN_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  pointerEvents: 'auto',
};

const CARD_STYLE: CSSProperties = { padding: 0 };
