import { Button, Callout, Tag } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import { findFilterEntry } from '../core/filterCatalog.ts';
import type { FilterCatalogEntry } from '../core/filterEntries.ts';
import type { SettingsProblem } from '../core/problems.ts';
import type { SpectrumFilter } from '../core/settings.ts';

import { FilterFieldControl } from './FilterFieldControl.tsx';

/** What {@link FilterRow} draws and edits. */
export interface FilterRowProps {
  /** The step, as the settings hold it. */
  filter: SpectrumFilter;
  /** Where it sits in the chain, counted from zero. */
  position: number;
  /** How many steps the chain holds, so the end moves can be refused. */
  count: number;
  /** This step's problems, already picked out of the chain's. */
  problems: readonly SettingsProblem[];
  /** Called with the step carrying its new options. */
  onChange: (filter: SpectrumFilter) => void;
  /** Called with how far to move the step, negative towards the start. */
  onMove: (offset: number) => void;
  /** Called to repeat the step just after itself. */
  onDuplicate: () => void;
  /** Called to drop the step. */
  onRemove: () => void;
}

/**
 * One step of the chain: what it does, what it is set to, and what is wrong.
 *
 * The number in front of the name is the whole point of the row — a chain means
 * nothing but the order it runs in, so the position, the two moves and the
 * step's own advice sit together where a reader can act on all three at once.
 * @param props - See {@link FilterRowProps}.
 * @returns The step's card.
 */
export function FilterRow(props: FilterRowProps): ReactElement {
  const {
    filter,
    position,
    count,
    problems,
    onChange,
    onMove,
    onDuplicate,
    onRemove,
  } = props;
  const entry = findFilterEntry(filter.name) ?? unknownEntry(filter.name);

  return (
    <div style={ROW_STYLE}>
      <div style={HEADER_STYLE}>
        <Tag minimal round>
          {String(position + 1)}
        </Tag>
        <span style={TITLE_STYLE}>{entry.label}</span>
        <span style={SPACER_STYLE} />
        <Button
          icon="arrow-up"
          variant="minimal"
          size="small"
          disabled={position === 0}
          aria-label={`Move ${entry.label} up`}
          onClick={() => {
            onMove(-1);
          }}
        />
        <Button
          icon="arrow-down"
          variant="minimal"
          size="small"
          disabled={position === count - 1}
          aria-label={`Move ${entry.label} down`}
          onClick={() => {
            onMove(1);
          }}
        />
        <Button
          icon="duplicate"
          variant="minimal"
          size="small"
          aria-label={`Repeat ${entry.label}`}
          onClick={onDuplicate}
        />
        <Button
          icon="cross"
          variant="minimal"
          size="small"
          aria-label={`Remove ${entry.label}`}
          onClick={onRemove}
        />
      </div>
      <span style={SUMMARY_STYLE}>{entry.summary}</span>
      {entry.fixed === undefined ? null : (
        <span style={FIXED_STYLE}>{`Fixed upstream: ${entry.fixed}`}</span>
      )}
      {entry.caution === undefined ? null : (
        <Callout intent="warning" compact>
          {entry.caution}
        </Callout>
      )}
      {entry.fields.length === 0 ? null : (
        <div style={FIELDS_STYLE}>
          {entry.fields.map((field) => (
            <FilterFieldControl
              key={field.key}
              field={field}
              filter={filter}
              onChange={onChange}
            />
          ))}
        </div>
      )}
      {problems.map((issue) => (
        <Callout
          key={issue.message}
          intent={issue.severity === 'error' ? 'danger' : 'warning'}
          compact
        >
          {issue.message}
        </Callout>
      ))}
    </div>
  );
}

/**
 * What a row shows for a step the catalog does not describe.
 *
 * A chain can carry a name this editor has never heard of — the settings the
 * processor takes are typed `{ name: string }` — and a row naming it beats a
 * page that will not render.
 * @param name - The step's name, as the settings hold it.
 * @returns An entry with the name for a label and nothing to edit.
 */
function unknownEntry(name: string): FilterCatalogEntry {
  return {
    label: name,
    group: 'utility',
    summary:
      'This editor does not know this step, so its options are left as they are.',
    fields: [],
  };
}

const ROW_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  padding: 10,
  border: '1px solid var(--border, #d7dde4)',
  borderRadius: 'var(--radius, 6px)',
  background: 'var(--surface-raised, #ffffff)',
} as const satisfies CSSProperties;

const HEADER_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
} as const satisfies CSSProperties;

const TITLE_STYLE = {
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--text, #1c2127)',
} as const satisfies CSSProperties;

const SPACER_STYLE = {
  flex: '1 1 auto',
} as const satisfies CSSProperties;

const SUMMARY_STYLE = {
  fontSize: 12,
  color: 'var(--text-muted, #5b6875)',
} as const satisfies CSSProperties;

const FIXED_STYLE = {
  fontSize: 11,
  color: 'var(--text-faint, #8a96a3)',
} as const satisfies CSSProperties;

const FIELDS_STYLE = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  gap: 10,
} as const satisfies CSSProperties;
