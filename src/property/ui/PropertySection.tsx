import type { ReactElement, ReactNode } from 'react';

import { joinClassNames } from '../../shared/ui/joinClassNames.ts';

/** What {@link PropertySection} needs. */
export interface PropertySectionProps {
  /**
   * The heading over the group.
   * @default undefined — no heading
   */
  title?: string;
  /**
   * The heading is a name — a file, an identifier, a step — written as it
   * is, rather than a label set in small capitals.
   * @default false
   */
  titleAsWritten?: boolean;
  /** What the group holds: a table of properties, of numbers, a panel. */
  children: ReactNode;
  /**
   * What is said under the group, for all of it.
   * @default undefined — nothing
   */
  note?: ReactNode;
  /**
   * Class the group carries, in addition to `properties`.
   * @default undefined
   */
  className?: string;
}

/**
 * One group of the properties of a thing, under its heading: what
 * `PropertyTable` and `PropertyNumbers` stand in, and what a panel of the
 * page's own stands in among them.
 * @param props - See {@link PropertySectionProps}.
 * @returns The group.
 */
export function PropertySection(props: PropertySectionProps): ReactElement {
  const { title, titleAsWritten = false, children, note, className } = props;
  return (
    <section className={joinClassNames('properties', className)}>
      {title === undefined ? null : (
        <h3
          className={joinClassNames(
            'properties__title',
            titleAsWritten && 'properties__title--as-written',
          )}
        >
          {title}
        </h3>
      )}
      {children}
      {note === undefined ? null : <p className="properties__note">{note}</p>}
    </section>
  );
}

/** One column of a {@link PropertyNumbers}. */
export interface PropertyColumn {
  /** Names the column among the others. */
  key: string;
  /** Its heading. */
  label: ReactNode;
}

/** What {@link PropertyNumbers} needs. */
export interface PropertyNumbersProps {
  /** The columns, the first naming each row. */
  columns: readonly PropertyColumn[];
  /** The rows: a `<tr>` each, its first cell a `<th scope="row">`. */
  children: ReactNode;
}

/**
 * A table of numbers among the tables of properties — a statistic per
 * column, their names over them —, its last column ending where the values
 * of a `PropertyTable` end.
 * @param props - See {@link PropertyNumbersProps}.
 * @returns The table.
 */
export function PropertyNumbers(props: PropertyNumbersProps): ReactElement {
  const { columns, children } = props;
  return (
    <table className="properties__table properties__table--numbers">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} scope="col">
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}
