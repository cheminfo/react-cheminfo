import type { ReactElement, ReactNode } from 'react';

import { ClickToCopy } from '../../clipboard/ui/ClickToCopy.tsx';
import { joinClassNames } from '../../shared/ui/joinClassNames.ts';
import { copyableText } from '../core/copyableText.ts';

/** One row of a {@link PropertyTable}. */
export interface PropertyRow {
  /** What the row is called. */
  label: string;
  /** The value, already formatted: text, a number, or a drawn element. */
  value: ReactNode;
  /**
   * What the number means, when the name alone does not say.
   * @default undefined
   */
  note?: string;
  /**
   * What a click on the value copies, when the value is drawn rather than
   * written: a formula drawn by `<MF>` copies its plain string.
   * @default the value itself when it is text or a number, nothing otherwise
   */
  copy?: string;
}

/** What {@link PropertyTable} needs. */
export interface PropertyTableProps {
  /**
   * The heading over the group.
   * @default undefined — no heading
   */
  title?: string;
  /** The rows, in the order they are read. */
  rows: readonly PropertyRow[];
  /**
   * Class the group carries, in addition to `properties`.
   * @default undefined
   */
  className?: string;
}

/**
 * One group of properties as a two-column table, each value its own copy
 * target: a mass, a formula or an identifier is taken away with one click, and
 * a row with no value is drawn as a plain cell.
 * @param props - The heading and the rows.
 * @returns The group.
 */
export function PropertyTable(props: PropertyTableProps): ReactElement {
  const { title, rows, className } = props;
  return (
    <section className={joinClassNames('properties', className)}>
      {title === undefined ? null : (
        <h3 className="properties__title">{title}</h3>
      )}
      <table className="properties__table">
        <tbody>
          {rows.map((row) => {
            const copy = row.copy ?? copyableText(row.value);
            return (
              <tr key={row.label}>
                <th scope="row">
                  {row.label}
                  {row.note === undefined ? null : (
                    <span className="properties__note">{row.note}</span>
                  )}
                </th>
                <ClickToCopy
                  as="td"
                  value={copy ?? ''}
                  label={row.label}
                  disabled={copy === null}
                >
                  {row.value}
                </ClickToCopy>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
