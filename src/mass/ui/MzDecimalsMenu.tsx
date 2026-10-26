import { Menu, MenuItem } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { Toolbar } from 'react-science/ui';

import type { MzDecimalsSetting } from '../core/mzDecimalsSetting.ts';
import { MAXIMUM_MZ_DECIMALS } from '../core/mzDecimalsSetting.ts';

export interface MzDecimalsMenuProps {
  /** What is chosen, `'auto'` while nothing is. */
  setting: MzDecimalsSetting;
  /**
   * How many decimals `'auto'` comes to for the spectra in view, which the
   * entry for it says, so choosing nothing is not a choice made blind.
   */
  autoDecimals: number;
  /** Called with what was picked. */
  onChange: (setting: MzDecimalsSetting) => void;
}

/**
 * How many decimals the masses are written with, picked from a panel toolbar.
 *
 * The first entry leaves it to the spectra — high-resolution masses or nominal
 * ones, as each spectrum's resolution says — and the rest fix a number for
 * every mass on screen at once: chart, crosshair, tables. A list rather than a
 * stepper, because the useful answers are few and a reader picking one wants
 * to see them side by side; the button is lit while a number overrides the
 * spectra, so a chart written to fewer decimals than it resolves never looks
 * like one that resolves no more.
 * @param props - Component props.
 * @returns The toolbar item and its menu.
 */
export function MzDecimalsMenu(props: MzDecimalsMenuProps): ReactElement {
  const { setting, autoDecimals, onChange } = props;

  return (
    <Toolbar.PopoverItem
      itemProps={{
        icon: 'floating-point',
        tooltip: LABEL,
        'aria-label': LABEL,
        active: setting !== 'auto',
      }}
      content={
        <Menu aria-label={LABEL}>
          <MenuItem
            roleStructure="listoption"
            selected={setting === 'auto'}
            text={`Automatic — by resolution (now ${decimalsText(autoDecimals)})`}
            onClick={() => onChange('auto')}
          />
          {CHOICES.map((decimals) => (
            <MenuItem
              key={decimals}
              roleStructure="listoption"
              selected={setting === decimals}
              text={
                decimals === 0
                  ? 'Nominal mass (0 decimals)'
                  : decimalsText(decimals)
              }
              onClick={() => onChange(decimals)}
            />
          ))}
        </Menu>
      }
    />
  );
}

const LABEL = 'Decimals of the masses';

/** Every number that can be chosen, from the nominal mass up. */
const CHOICES = Array.from(
  { length: MAXIMUM_MZ_DECIMALS + 1 },
  (_, decimals) => decimals,
);

/**
 * A number of decimals, as the menu says it.
 * @param decimals - How many.
 * @returns `1 decimal`, or `n decimals`.
 */
function decimalsText(decimals: number): string {
  return decimals === 1 ? '1 decimal' : `${decimals} decimals`;
}
