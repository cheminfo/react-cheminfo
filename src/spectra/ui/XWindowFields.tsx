import type { ReactElement } from 'react';

import { NumberField } from './NumberField.tsx';
import type { ScaleRange } from './scaleOptions.ts';

/** What {@link XWindowFields} edits. */
interface XWindowFieldsProps {
  /** The stretch of x, as the settings hold it. */
  value: ScaleRange;
  /** Called with the one bound that changed, undefined when it was emptied. */
  onChange: (patch: ScaleRange) => void;
  /**
   * Whether the two point numbers are offered beside the two x values.
   * @default false — only From and To are drawn
   */
  withPoints?: boolean;
}

/**
 * The bounds of a stretch of x: From and To, and the point numbers that win
 * over them where the processor resolves the window by index.
 *
 * Drawn without a wrapper, so the boxes join whatever row they are put in —
 * beside a range's name, or beside the number of points of the grid.
 * @param props - See {@link XWindowFieldsProps}.
 * @returns The boxes.
 */
export function XWindowFields(props: XWindowFieldsProps): ReactElement {
  const { value, onChange, withPoints = false } = props;

  return (
    <>
      <NumberField
        label="From"
        value={value.from}
        placeholder="the first x"
        onChange={(from) => {
          onChange({ from });
        }}
      />
      <NumberField
        label="To"
        value={value.to}
        placeholder="the last x"
        onChange={(to) => {
          onChange({ to });
        }}
      />
      {withPoints ? (
        <>
          <NumberField
            label="From point"
            value={value.fromIndex}
            integer
            placeholder="0"
            onChange={(fromIndex) => {
              onChange({ fromIndex });
            }}
          />
          <NumberField
            label="To point"
            value={value.toIndex}
            integer
            placeholder="the last point"
            onChange={(toIndex) => {
              onChange({ toIndex });
            }}
          />
        </>
      ) : null}
    </>
  );
}
