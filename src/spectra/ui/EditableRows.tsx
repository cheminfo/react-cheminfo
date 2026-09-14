import { Button } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';

import {
  EMPTY_STYLE,
  HELP_STYLE,
  LABEL_STYLE,
  LIST_STYLE,
  ROW_STYLE,
} from './fieldStyles.ts';
import { useRowKeys } from './rowKeys.ts';

/** What {@link EditableRows} edits. */
interface EditableRowsProps<Entry> {
  /**
   * What the list is called, drawn above it.
   * @default undefined — the part the list sits in already names it
   */
  label?: string;
  /** The entries, one row each. */
  value: readonly Entry[];
  /** Called with the new list on every edit. */
  onChange: (entries: Entry[]) => void;
  /**
   * The fields of one row; the remove button is added after them.
   * @param entry - The entry the row edits.
   * @param index - Where it sits, counting from zero.
   * @param replace - Hands up the list with this entry replaced.
   */
  renderRow: (
    entry: Entry,
    index: number,
    replace: (edited: Entry) => void,
  ) => ReactNode;
  /** The entry a new row opens with. */
  newEntry: () => Entry;
  /** What the list says while it holds nothing. */
  emptyText: string;
  /** What the add button says. */
  addText: string;
  /** What a screen reader calls the remove button of one row. */
  removeLabel: (index: number) => string;
  /**
   * The lines under the list saying what its entries do.
   * @default [] — the label says enough
   */
  help?: readonly string[];
}

/**
 * A flat list of settings rows, each with its own remove button, and a button
 * that adds one at the end.
 *
 * Every list of the settings — ranges, calculations, zones — is edited the same
 * way, so a reader who has learnt one has learnt them all. The rows keep their
 * identity through `useRowKeys`: a number half typed into a row stays with that
 * row when the one above it is removed.
 * @param props - See {@link EditableRowsProps}.
 * @returns The labelled list.
 */
export function EditableRows<Entry>(
  props: EditableRowsProps<Entry>,
): ReactElement {
  const {
    label,
    value,
    onChange,
    renderRow,
    newEntry,
    emptyText,
    addText,
    removeLabel,
    help = NO_HELP,
  } = props;
  const rows = useRowKeys(value.length);

  return (
    <div style={LIST_STYLE}>
      {label === undefined ? null : <span style={LABEL_STYLE}>{label}</span>}
      {value.length === 0 ? <span style={EMPTY_STYLE}>{emptyText}</span> : null}
      {value.map((entry, index) => (
        <div key={rows.keys[index] ?? index} style={ROW_STYLE}>
          {renderRow(entry, index, (edited) => {
            onChange(value.with(index, edited));
          })}
          <Button
            icon="cross"
            variant="minimal"
            size="small"
            aria-label={removeLabel(index)}
            onClick={() => {
              rows.removeAt(index);
              onChange(value.toSpliced(index, 1));
            }}
          />
        </div>
      ))}
      <div>
        <Button
          icon="plus"
          size="small"
          text={addText}
          onClick={() => {
            rows.append();
            onChange([...value, newEntry()]);
          }}
        />
      </div>
      {help.map((line) => (
        <span key={line} style={HELP_STYLE}>
          {line}
        </span>
      ))}
    </div>
  );
}

const NO_HELP: readonly string[] = [];
