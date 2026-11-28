import type { ReactElement } from 'react';

import { ClickToCopy } from '../../clipboard/ui/ClickToCopy.tsx';

/** A labelled value of a card: `HOMO −12.18 eV`, `Atomic weight 55.845 Da`. */
export interface CardFact {
  /** What the value is; it also names the value a click copies. */
  label: string;
  /** The value, written as the answer writes it. */
  value: string;
  /**
   * A short qualifier after the value, e.g. a symmetry label or `predicted`.
   * @default undefined
   */
  detail?: string;
  /**
   * Whether a click copies the value: true for a number a student quotes,
   * false for a count nobody pastes anywhere.
   * @default true
   */
  copy?: boolean;
}

/** What {@link CardFacts} lists. */
export interface CardFactsProps {
  /** The values, in the order they are read. */
  facts: readonly CardFact[];
}

/**
 * The key numbers a card leads with, in one line that wraps on a narrow frame.
 * A value a student quotes is copied by a click on it, its hover text naming
 * it after its label; a count is not.
 * @param props - See {@link CardFactsProps}.
 * @returns The line, `card-facts`, or nothing when there is no value to give.
 */
export function CardFacts(props: CardFactsProps): ReactElement | null {
  const { facts } = props;
  if (facts.length === 0) return null;
  return (
    <div className="card-facts">
      {facts.map((fact) => (
        <span key={fact.label} className="card-fact">
          <span className="card-fact__label">{fact.label}</span>
          {fact.copy === false ? (
            <span className="card-fact__value">{fact.value}</span>
          ) : (
            <ClickToCopy
              value={fact.value}
              label={fact.label.toLowerCase()}
              className="card-fact__value"
            >
              {fact.value}
            </ClickToCopy>
          )}
          {fact.detail === undefined ? null : (
            <span className="card-fact__detail">{fact.detail}</span>
          )}
        </span>
      ))}
    </div>
  );
}
