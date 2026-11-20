/**
 * The partial bond section of the options popover: whether they are drawn,
 * and whether their lengths are written over them.
 */

import { Switch } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import type { Molecule3DFile } from '../core/file.ts';
import type { PartialBondMode } from '../core/partialBondMode.ts';
import { showsPartialBonds } from '../core/partialBondMode.ts';
import type { Molecule3DSettings } from '../core/settings.ts';
import { normalizeMolecule3DSettings } from '../core/settings.ts';

/** Props of {@link Molecule3DPartialBonds}. */
export interface Molecule3DPartialBondsProps {
  settings: Molecule3DSettings;
  onChange: (settings: Molecule3DSettings) => void;
  /** The format of the file on screen, which `auto` follows. */
  format: Molecule3DFile['format'];
}

/**
 * The two switches. The first shows what is drawn for the file on screen, and
 * turning it back to what `auto` draws for that file stores `auto` again.
 * @param props - See {@link Molecule3DPartialBondsProps}.
 * @returns The section.
 */
export function Molecule3DPartialBonds(
  props: Molecule3DPartialBondsProps,
): ReactElement {
  const { settings, onChange, format } = props;
  const t = useChromeT();
  // A site owning the settings may hand over a record from before they existed.
  const { partialBonds, partialBondLengths } =
    normalizeMolecule3DSettings(settings);
  const shown = showsPartialBonds(partialBonds, format);
  const byDefault = showsPartialBonds('auto', format);
  // Spacefill draws no bond: a disabled switch fires no hover, so the section
  // carries the why.
  const spacefill = settings.representation === 'spacefill';

  return (
    <div
      style={SECTION_STYLE}
      title={spacefill ? t('molecule3d.partialBondsSpacefill') : undefined}
    >
      <Switch
        alignIndicator="end"
        style={SWITCH_STYLE}
        checked={shown && !spacefill}
        disabled={spacefill}
        labelElement={
          <span title={t('molecule3d.partialBondsHelp')}>
            {t('molecule3d.partialBonds')}
          </span>
        }
        data-testid="molecule3d-partial-bonds"
        onChange={(event) => {
          const checked = event.currentTarget.checked;
          onChange({ ...settings, partialBonds: modeOf(checked, byDefault) });
        }}
      />
      <Switch
        alignIndicator="end"
        style={SWITCH_STYLE}
        checked={partialBondLengths}
        disabled={spacefill || !shown}
        label={t('molecule3d.partialBondLengths')}
        data-testid="molecule3d-partial-bond-lengths"
        onChange={(event) => {
          onChange({
            ...settings,
            partialBondLengths: event.currentTarget.checked,
          });
        }}
      />
    </div>
  );
}

/**
 * The mode a switch stores: `auto` when it lands on what `auto` draws.
 * @param checked - Whether the partial bonds are to be drawn.
 * @param byDefault - Whether `auto` draws them for the file on screen.
 * @returns The mode.
 */
function modeOf(checked: boolean, byDefault: boolean): PartialBondMode {
  if (checked === byDefault) return 'auto';
  return checked ? 'on' : 'off';
}

const SECTION_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

const SWITCH_STYLE: CSSProperties = { marginBottom: 0, fontSize: 12 };
