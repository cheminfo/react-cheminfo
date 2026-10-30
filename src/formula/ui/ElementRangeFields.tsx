import type { ReactElement } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { NumberInput } from '../../number/ui/NumberInput.tsx';
import type { ElementRange } from '../core/elementRanges.ts';

/** What {@link ElementRangeFields} edits. */
export interface ElementRangeFieldsProps {
  /** The elements, and their bounds as they stand. */
  ranges: readonly ElementRange[];
  /** Called with the element, the bound edited and its new value. */
  onChange: (element: string, bound: 'min' | 'max', value: number) => void;
}

/**
 * The bounds of each element, written as the range they are read as:
 * `C 1 – 30`. The dash says which box is which, so the grid needs no heading
 * row and fits two elements to a line; each box carries its own accessible
 * name instead.
 * @param props - See {@link ElementRangeFieldsProps}.
 * @returns The grid of ranges.
 */
export function ElementRangeFields(
  props: ElementRangeFieldsProps,
): ReactElement {
  const { ranges, onChange } = props;
  const t = useChromeT();
  return (
    <div className="formula-lookup__ranges">
      {ranges.map((range) => (
        <div key={range.element} className="formula-lookup__range">
          <span className="formula-lookup__element">{range.element}</span>
          <NumberInput
            size="small"
            buttons={false}
            fill
            integer
            min={0}
            max={range.max}
            value={range.min}
            ariaLabel={t('formula.lookup.fewest', {
              element: range.element,
            })}
            onChange={(value) => {
              onChange(range.element, 'min', value);
            }}
          />
          <span className="formula-lookup__dash">–</span>
          <NumberInput
            size="small"
            buttons={false}
            fill
            integer
            min={range.min}
            value={range.max}
            ariaLabel={t('formula.lookup.most', { element: range.element })}
            onChange={(value) => {
              onChange(range.element, 'max', value);
            }}
          />
        </div>
      ))}
    </div>
  );
}
