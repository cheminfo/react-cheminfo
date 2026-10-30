import type { ReactElement } from 'react';

import { formatDecimal, formatInteger } from '../../format/core/numbers.ts';
import type { AsyncResult } from '../../hooks/ui/useAsync.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { FormulaCandidates } from '../core/formulaCandidates.ts';

import { CopyableFormula } from './CopyableFormula.tsx';

/** What {@link FormulaLookupResults} lists. */
export interface FormulaLookupResultsProps {
  /** The mass in the box, `undefined` while it is empty. */
  mass: number | undefined;
  /** The latest search: its formulas, or `null` when it gave up. */
  answer: AsyncResult<FormulaCandidates | null>;
  /** Whether a newer search is still to come, so an empty answer is stale. */
  waiting: boolean;
}

/**
 * The formulas a lookup found, closest first, each with its distance in ppm
 * and copied by a click; or the sentence saying why there are none.
 * @param props - See {@link FormulaLookupResultsProps}.
 * @returns The results.
 */
export function FormulaLookupResults(
  props: FormulaLookupResultsProps,
): ReactElement {
  const { mass, answer, waiting } = props;
  const t = useChromeT();
  const found = answer.data;

  if (mass === undefined) return hintOnly(t('formula.lookup.typeMass'));
  if (found === null) return hintOnly(t('formula.lookup.tooWide'));
  // A search still to come is not "nothing fits": the reader is mid-number.
  if (found === undefined || (found.candidates.length === 0 && waiting)) {
    return <div className="formula-lookup__results" />;
  }

  const { candidates, total } = found;
  const count = formatInteger(candidates.length);
  let heading: string = t('formula.lookup.countMany', { count });
  if (candidates.length < total) {
    heading = t('formula.lookup.closest', {
      count,
      total: formatInteger(total),
    });
  } else if (candidates.length === 1) {
    heading = t('formula.lookup.countOne', { count });
  }

  return (
    <div className="formula-lookup__results">
      <span className="formula-lookup__count">{heading}</span>
      {candidates.length === 0 ? (
        <span className="formula-lookup__hint">
          {t('formula.lookup.nothingFits')}
        </span>
      ) : (
        <ul className="formula-lookup__list">
          {candidates.map((candidate) => (
            <li
              key={candidate.mf}
              title={t('formula.lookup.detail', {
                mass: formatDecimal(candidate.em, 4),
                unsaturation: formatInteger(candidate.unsaturation),
              })}
            >
              <CopyableFormula formula={candidate.mf} />
              <span className="formula-lookup__ppm">
                {t('formula.lookup.ppm', {
                  value: formatDecimal(candidate.ppm, 1),
                })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function hintOnly(hint: string): ReactElement {
  return (
    <div className="formula-lookup__results">
      <span className="formula-lookup__hint">{hint}</span>
    </div>
  );
}
