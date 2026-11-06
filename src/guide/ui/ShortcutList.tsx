import type { ReactElement, ReactNode } from 'react';

/** One line of a list of keys. */
export interface ShortcutRow {
  /** The keys, each drawn as one cap. */
  keys: readonly string[];
  /** What they do. */
  label: ReactNode;
}

/**
 * Keys and what they do, one line each, the caps in a column of their own so
 * the eye runs down them.
 * @param props - The lines.
 * @param props.rows - The keys and what they do.
 * @returns The list.
 */
export function ShortcutList(props: {
  rows: readonly ShortcutRow[];
}): ReactElement {
  return (
    <dl className="shortcut-list">
      {props.rows.map((row) => (
        <div key={row.keys.join(' ')} className="shortcut-list__row">
          <dt>
            <ShortcutKeys keys={row.keys} />
          </dt>
          <dd>{row.label}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Keys drawn as caps, in the grey of a guide.
 * @param props - The keys.
 * @param props.keys - The keys.
 * @returns The caps.
 */
export function ShortcutKeys(props: { keys: readonly string[] }): ReactElement {
  return (
    <span className="shortcut-keys">
      {props.keys.map((key) => (
        <kbd key={key}>{key}</kbd>
      ))}
    </span>
  );
}
