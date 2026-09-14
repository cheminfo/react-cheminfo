import { HTMLSelect } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import { chainProblems } from '../core/chainProblems.ts';
import { filterEntry, filterMenu } from '../core/filterCatalog.ts';
import {
  addFilter,
  duplicateFilter,
  moveFilter,
  removeFilter,
} from '../core/filterChain.ts';
import { FILTER_GROUP_LABELS } from '../core/filterFields.ts';
import type { SettingsProblem } from '../core/problems.ts';
import type { SpectrumFilter, SpectrumFilterName } from '../core/settings.ts';

import { FilterRow } from './FilterRow.tsx';
import { ProblemList } from './ProblemList.tsx';
import { EMPTY_STYLE } from './fieldStyles.ts';
import { useRowKeys } from './rowKeys.ts';

/** What {@link FilterChainEditor} edits. */
export interface FilterChainEditorProps {
  /** The steps, in the order they run on every spectrum. */
  value: readonly SpectrumFilter[];
  /** Called with the new chain on every edit. */
  onChange: (chain: SpectrumFilter[]) => void;
  /**
   * The problems to show, when a panel already works out the whole settings'.
   * @default undefined — the editor works out the chain's own with `chainProblems`
   */
  problems?: readonly SettingsProblem[];
  /**
   * Whether the settings resample before the chain runs, which decides whether
   * cropping and rewriting the x axis are safe here.
   * @default false — the resampling runs after the chain
   */
  resampleFirst?: boolean;
  /**
   * Class names added to the root element.
   * @default undefined
   */
  className?: string;
}

/**
 * The per-spectrum chain: the ordered steps every spectrum is run through.
 *
 * The steps are drawn as a numbered list with their options open, because the
 * order is the meaning — scaling before a baseline is removed measures an
 * offset that is about to change — and a folded-away option is a change to the
 * data nobody can see. Each step's advice is drawn against the step it is
 * about; only what the chain as a whole gets wrong is drawn under the list.
 * @param props - See {@link FilterChainEditorProps}.
 * @returns The chain editor.
 */
export function FilterChainEditor(props: FilterChainEditorProps): ReactElement {
  const { className, value, onChange, problems, resampleFirst = false } = props;
  const rows = useRowKeys(value.length);

  // Not given and given empty mean different things: a panel that has already
  // checked the whole settings passes its own list, which may legitimately be
  // empty, while a panel that has not passes nothing and gets the chain's own.
  const found = problems ?? chainProblems(value, resampleFirst);
  const chainWide: SettingsProblem[] = [];
  const byStep = new Map<number, SettingsProblem[]>();
  for (const issue of found) {
    if (issue.part !== 'chain') continue;
    if (issue.index === undefined) {
      chainWide.push(issue);
      continue;
    }
    const held = byStep.get(issue.index);
    if (held === undefined) byStep.set(issue.index, [issue]);
    else held.push(issue);
  }

  function move(index: number, offset: number): void {
    const target = index + offset;
    if (target < 0 || target >= value.length) return;
    rows.move(index, target);
    onChange(moveFilter(value, index, offset));
  }

  return (
    <div className={className} style={CHAIN_STYLE}>
      {value.length === 0 ? (
        <span style={EMPTY_STYLE}>
          No steps — every spectrum is only brought onto the shared x grid.
        </span>
      ) : null}
      {value.map((step, index) => (
        <FilterRow
          key={rows.keys[index] ?? index}
          filter={step}
          position={index}
          count={value.length}
          problems={byStep.get(index) ?? NO_PROBLEMS}
          onChange={(edited) => {
            onChange(value.with(index, edited));
          }}
          onMove={(offset) => {
            move(index, offset);
          }}
          onDuplicate={() => {
            rows.insertAfter(index);
            onChange(duplicateFilter(value, index));
          }}
          onRemove={() => {
            rows.removeAt(index);
            onChange(removeFilter(value, index));
          }}
        />
      ))}
      <ProblemList problems={chainWide} showWhere={false} />
      <div style={ADD_STYLE}>
        <HTMLSelect
          value=""
          aria-label="Add a step"
          onChange={(event) => {
            const name = stepNamed(event.currentTarget.value);
            if (name === undefined) return;
            rows.append();
            onChange(addFilter(value, name));
          }}
        >
          <option value="">Add a step…</option>
          {filterMenu().map(({ group, names }) => (
            <optgroup key={group} label={FILTER_GROUP_LABELS[group]}>
              {names.map((name) => (
                <option key={name} value={name}>
                  {filterEntry(name).label}
                </option>
              ))}
            </optgroup>
          ))}
        </HTMLSelect>
      </div>
    </div>
  );
}

/**
 * The step the menu's value names.
 *
 * Read back off the menu rather than asserted, so a stale value picked up from
 * anywhere adds nothing instead of a step `filterXY` throws on.
 * @param chosen - What the select holds.
 * @returns The step name, or undefined when nothing is named.
 */
function stepNamed(chosen: string): SpectrumFilterName | undefined {
  for (const { names } of filterMenu()) {
    for (const name of names) {
      if (name === chosen) return name;
    }
  }
  return undefined;
}

/** One shared empty list, so a step with no problems re-renders nothing. */
const NO_PROBLEMS: readonly SettingsProblem[] = [];

const CHAIN_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
} as const satisfies CSSProperties;

const ADD_STYLE = {
  display: 'flex',
} as const satisfies CSSProperties;
