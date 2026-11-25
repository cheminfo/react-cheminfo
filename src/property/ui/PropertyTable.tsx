import type { ReactElement, ReactNode } from 'react';

import { ClickToCopy } from '../../clipboard/ui/ClickToCopy.tsx';
import { copyableText } from '../core/copyableText.ts';

import { PropertySection } from './PropertySection.tsx';

/** One row of a {@link PropertyTable}. */
export interface PropertyRow {
  /** What the row is called, and the name its copy target carries. */
  label: string;
  /**
   * What the row's heading cell shows when it must differ from the label as
   * text: a range of numbers kept on one line, for instance.
   * @default the label
   */
  labelContent?: ReactNode;
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
  /**
   * The heading is a name — a file, an identifier, a step — written as it
   * is, rather than a label set in small capitals.
   * @default false
   */
  titleAsWritten?: boolean;
  /**
   * What stands between the heading and the rows and speaks for the whole
   * group: a badge, a note, an action.
   * @default undefined — nothing
   */
  lead?: ReactNode;
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
 * a row with no value is drawn as a plain cell; what speaks for the whole
 * group stands under its heading.
 * @param props - The heading and the rows.
 * @returns The group.
 */
export function PropertyTable(props: PropertyTableProps): ReactElement {
  const { title, lead, rows, className, titleAsWritten = false } = props;
  return (
    <PropertySection
      title={title}
      titleAsWritten={titleAsWritten}
      className={className}
    >
      {lead === undefined ? null : (
        <div className="properties__lead">{lead}</div>
      )}
      <table className="properties__table">
        <tbody>
          {rows.map((row) => {
            const copy = row.copy ?? copyableText(row.value);
            return (
              <tr key={row.label}>
                <th scope="row">
                  {row.labelContent ?? row.label}
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
    </PropertySection>
  );
}
