import { Button } from '@blueprintjs/core';
import type { ReactNode } from 'react';

import { NumberInput } from '../../number/ui/NumberInput.tsx';
import type { XpsSensitivityFactor } from '../core/xpsInstrument.ts';

import {
  panelCellStyle as cellStyle,
  panelColumnTitleStyle as headerTextStyle,
  panelNumberCellStyle as numberCellStyle,
  panelScrollAreaStyle as scrollAreaStyle,
  panelStickyHeaderStyle as headerStyle,
  panelTableStyle as tableStyle,
} from './panelStyles.ts';

export interface FactorTableProps {
  /** The factors to list, in the order the instrument holds them. */
  factors: readonly XpsSensitivityFactor[];
  /** Whether they can be changed. */
  editable: boolean;
  /** Called with a factor as edited. */
  onChange: (factor: XpsSensitivityFactor) => void;
  /** Called to delete the factor of one line. */
  onRemove: (element: string, orbital: string) => void;
}

/**
 * The sensitivity factors of one instrument, one line per level.
 *
 * A factor of the reader's own instrument is typed where it is read, and a
 * line deleted from its end. Nothing here sorts: the order is the one the
 * factors were entered or pasted in, which is the order of the library they
 * were copied from.
 * @param props - Component props.
 * @returns The table.
 */
export function FactorTable(props: FactorTableProps): ReactNode {
  const { factors, editable, onChange, onRemove } = props;

  if (factors.length === 0) {
    return (
      <p style={emptyStyle}>
        No line yet. Add the factors of your instrument below, one at a time or
        pasted as a table.
      </p>
    );
  }

  return (
    <div style={scrollAreaStyle}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {(editable ? EDITABLE_TITLES : TITLES).map((title) => (
              <th key={title} scope="col" style={headerStyle}>
                <span style={headerTextStyle}>{title}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {factors.map((factor) => (
            <tr key={`${factor.element} ${factor.orbital}`}>
              <th scope="row" style={elementCellStyle}>
                {factor.element}
              </th>
              <td style={cellStyle}>{factor.orbital}</td>
              <td style={numberCellStyle}>
                {editable ? (
                  <NumberInput
                    size="small"
                    buttons={false}
                    min={MINIMUM_FACTOR}
                    step={0.01}
                    value={factor.factor}
                    ariaLabel={`Sensitivity factor of ${factor.element} ${factor.orbital}`}
                    style={factorStyle}
                    onChange={(value) => {
                      if (value > 0) onChange({ ...factor, factor: value });
                    }}
                  />
                ) : (
                  factor.factor
                )}
              </td>
              {editable ? (
                <td style={cellStyle}>
                  <Button
                    size="small"
                    variant="minimal"
                    icon="cross"
                    aria-label={`Delete the factor of ${factor.element} ${factor.orbital}`}
                    onClick={() => onRemove(factor.element, factor.orbital)}
                  />
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The smallest factor a box accepts: an area is divided by it, so zero is not
 * a factor but a division nobody can do.
 */
const MINIMUM_FACTOR = 0.0001;

const TITLES = ['Element', 'Level', 'Factor'] as const;

const EDITABLE_TITLES = [...TITLES, ''] as const;

const elementCellStyle = {
  ...cellStyle,
  textAlign: 'left',
  fontWeight: 600,
} as const;

const factorStyle = { width: 80, textAlign: 'right' } as const;

const emptyStyle = { fontSize: 12, opacity: 0.7, margin: 0 } as const;
