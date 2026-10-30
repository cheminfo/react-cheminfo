import { Button } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { useCallback, useMemo, useState } from 'react';

import { useAsync } from '../../hooks/ui/useAsync.ts';
import { useDebouncedValue } from '../../hooks/ui/useDebouncedValue.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { NumberInput } from '../../number/ui/NumberInput.tsx';
import { joinClassNames } from '../../shared/ui/joinClassNames.ts';
import type { ElementRange } from '../core/elementRanges.ts';
import { DEFAULT_ELEMENT_RANGES } from '../core/elementRanges.ts';
import type { FormulaCandidates } from '../core/formulaCandidates.ts';
import {
  FORMULA_LOOKUP_LIMIT,
  findFormulaCandidates,
} from '../core/formulaCandidates.ts';

import { ElementRangeFields } from './ElementRangeFields.tsx';
import { FormulaLookupResults } from './FormulaLookupResults.tsx';

/** What {@link FormulaLookup} opens on, and who owns the mass. */
export interface FormulaLookupProps {
  /**
   * The elements offered and the range each opens on, read when the panel
   * mounts and again when it is reset. Each bound is then the reader's to tune.
   * @default DEFAULT_ELEMENT_RANGES — C 1–30, H 1–30, O 0–6, N, S, F, Cl and Br 0–4
   */
  ranges?: readonly ElementRange[];
  /**
   * How many formulas are listed, closest first.
   * @default FORMULA_LOOKUP_LIMIT — 100
   */
  limit?: number;
  /**
   * The mass in the box, in Da. With `onMassChange` the page owns it and the
   * box shows this value; without, it is only the mass the box opens on.
   * @default undefined — the box opens empty
   */
  mass?: number;
  /**
   * Called with every mass typed, and with `undefined` when the box is emptied
   * or the panel reset. Passing it makes the mass the page's.
   * @default undefined — the panel keeps the mass itself
   */
  onMassChange?: (mass: number | undefined) => void;
  /**
   * Class the panel carries, in addition to `formula-lookup`: where it sits —
   * a column, a sticky rail, a shadow — is the page's.
   * @default undefined
   */
  className?: string;
}

/**
 * The molecular formulas that fit a monoisotopic mass: the reader types the
 * mass of the neutral molecule, tunes how many atoms of each element a formula
 * may hold, and reads the closest formulas with their distance in ppm. Each
 * formula is copied by a click.
 *
 * The ranges belong to the question on screen, so a page showing several
 * questions mounts the panel with a `key` per question.
 * @param props - See {@link FormulaLookupProps}.
 * @returns The panel.
 */
export function FormulaLookup(props: FormulaLookupProps): ReactElement {
  const {
    ranges: openingRanges = DEFAULT_ELEMENT_RANGES,
    limit = FORMULA_LOOKUP_LIMIT,
    mass: massProp,
    onMassChange,
    className,
  } = props;
  const t = useChromeT();
  const [ownMass, setOwnMass] = useState(massProp);
  const [ranges, setRanges] = useState(openingRanges);
  const mass = onMassChange === undefined ? ownMass : massProp;

  function changeMass(next: number | undefined): void {
    if (onMassChange === undefined) setOwnMass(next);
    else onMassChange(next);
  }

  function changeRange(
    element: string,
    bound: 'min' | 'max',
    value: number,
  ): void {
    setRanges((current) =>
      current.map((range) =>
        range.element === element ? { ...range, [bound]: value } : range,
      ),
    );
  }

  function reset(): void {
    changeMass(undefined);
    setRanges(openingRanges);
  }

  const search = useMemo(
    () => ({ mass, ranges, limit }),
    [mass, ranges, limit],
  );
  const settled = useDebouncedValue(search, SEARCH_DELAY_MS);
  const task = useCallback(() => searchFormulas(settled), [settled]);
  const answer = useAsync(task);

  return (
    <aside className={joinClassNames('formula-lookup', className)}>
      <div className="formula-lookup__header">
        <span>{t('formula.lookup.title')}</span>
        <Button
          size="small"
          variant="minimal"
          icon="reset"
          className="no-print"
          title={t('formula.lookup.reset')}
          aria-label={t('formula.lookup.reset')}
          onClick={reset}
        />
      </div>

      <div className="formula-lookup__body">
        <label className="formula-lookup__field">
          <span>{t('formula.lookup.mass')}</span>
          <NumberInput
            size="small"
            buttons={false}
            fill
            allowEmpty
            min={0}
            value={mass}
            placeholder={t('formula.lookup.massPlaceholder')}
            onChange={changeMass}
          />
        </label>
        <span className="formula-lookup__hint">
          {t('formula.lookup.neutral')}
        </span>
        <ElementRangeFields ranges={ranges} onChange={changeRange} />
      </div>

      <FormulaLookupResults
        mass={mass}
        answer={answer}
        waiting={settled !== search || answer.pending}
      />
    </aside>
  );
}

/**
 * How long the inputs stay still before the formulas are searched again: a
 * mass is typed a digit at a time, and only the last one is worth a search.
 */
const SEARCH_DELAY_MS = 250;

const NO_CANDIDATES: FormulaCandidates = { candidates: [], total: 0 };

interface Search {
  mass: number | undefined;
  ranges: readonly ElementRange[];
  limit: number;
}

/**
 * The formulas one search finds, or `null` when it gave up: ranges wide
 * enough to exhaust the enumeration are the one way it fails.
 * @param search - The mass, ranges and limit to search.
 * @returns The formulas found.
 */
async function searchFormulas(
  search: Search,
): Promise<FormulaCandidates | null> {
  if (search.mass === undefined) return NO_CANDIDATES;
  try {
    return await findFormulaCandidates(search.mass, {
      ranges: search.ranges,
      limit: search.limit,
    });
  } catch {
    return null;
  }
}
