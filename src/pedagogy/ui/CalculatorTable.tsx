import { HTMLTable } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';

/** What {@link CalculatorTable} needs. */
export interface CalculatorTableProps {
  /** The column headings. */
  headers: readonly string[];
  /** The body rows. */
  children: ReactNode;
  /**
   * The rows the working ends on: the totals.
   * @default undefined
   */
  footer?: ReactNode;
}

/**
 * The working of a calculator, one row per atom or isotope, totals last.
 * @param props - See {@link CalculatorTableProps}.
 * @returns The table.
 */
export function CalculatorTable(props: CalculatorTableProps): ReactElement {
  const { headers, children, footer } = props;
  return (
    <HTMLTable compact striped className="calculator__table">
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
      {footer === undefined ? null : <tfoot>{footer}</tfoot>}
    </HTMLTable>
  );
}
