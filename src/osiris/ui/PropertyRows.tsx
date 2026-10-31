/**
 * The ten predicted numbers, one row each: a name, a bar and a value.
 *
 * The order is the legacy panel's — cLogP, solubility, molweight, TPSA,
 * drug-likeness, the two hydrogen-bond counts, stereocentres, rotatable bonds,
 * drug score — and it is `PROPERTY_KEYS`, which the comparison table's columns
 * and the plot's default axes also read. A reader who learned the panel reads
 * the table without relearning it.
 *
 * A value the predictor could not answer prints the missing marker and draws no
 * bar. It is never zero: `DrugScoreCalculator` consumes every sentinel and
 * hands back a plausible number, so a bar drawn from one would be a wrong
 * answer with nothing saying it is wrong.
 */

import type { ReactElement } from 'react';

import { MISSING_VALUE } from '../../format/core/missing.ts';
import { formatDecimal } from '../../format/core/numbers.ts';
import { barGeometry } from '../core/barGeometry.ts';
import type { PropertyKey } from '../core/propertyKeys.ts';
import { PROPERTY_KEYS, propertyValue } from '../core/propertyKeys.ts';
import { propertyScale } from '../core/scales.ts';
import type { OsirisProperties } from '../core/types.ts';

import { PropertyBar } from './PropertyBar.tsx';

/** What {@link PropertyRows} needs. */
export interface PropertyRowsProps {
  /**
   * What was predicted, or `null` while the molecule is still being worked on —
   * in which case every row stands with its name and no value, so nothing moves
   * when the answer arrives.
   * @default null
   */
  properties?: OsirisProperties | null;
  /**
   * The rows to draw. They are drawn in the panel's order whatever order they
   * are given in, so a narrowed panel still reads as the whole one does.
   * @default PROPERTY_KEYS
   */
  keys?: readonly PropertyKey[];
}

/**
 * The property rows, all ten unless fewer are asked, in the panel's order.
 * @param props - See {@link PropertyRowsProps}.
 * @returns One row per property.
 */
export function PropertyRows(props: PropertyRowsProps): ReactElement {
  const { properties = null, keys = PROPERTY_KEYS } = props;

  return (
    <div className="property-rows">
      {PROPERTY_KEYS.filter((key) => keys.includes(key)).map((key) => (
        <PropertyRow
          key={key}
          propertyKey={key}
          value={properties === null ? null : propertyValue(properties, key)}
        />
      ))}
    </div>
  );
}

interface PropertyRowProps {
  propertyKey: PropertyKey;
  value: number | null;
}

function PropertyRow(props: PropertyRowProps): ReactElement {
  const { propertyKey, value } = props;
  const scale = propertyScale(propertyKey);
  const geometry = barGeometry(propertyKey, value);

  return (
    <div className="property-row">
      <span className="property-row__label">
        {scale.label}
        {scale.unit === '' ? null : (
          <span className="property-row__unit">{scale.unit}</span>
        )}
      </span>
      <span className="property-row__bar">
        {geometry === null ? null : <PropertyBar geometry={geometry} />}
      </span>
      <span className="property-row__value">
        {value === null ? MISSING_VALUE : formatDecimal(value, scale.decimals)}
      </span>
    </div>
  );
}
