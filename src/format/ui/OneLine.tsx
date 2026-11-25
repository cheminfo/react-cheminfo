import type { CSSProperties, ReactElement } from 'react';
import { Fragment } from 'react';

import { phrasesOf } from '../core/phrases.ts';

/** What {@link OneLine} writes. */
export interface OneLineProps {
  /** The text: phrases joined by `separator`. */
  text: string;
  /**
   * What joins two phrases; a phrase left out takes the separator before it
   * along, so the line never ends on one.
   * @default ' · '
   */
  separator?: string;
  /**
   * The line's own look: its colour, its size.
   * @default undefined
   */
  style?: CSSProperties;
  /**
   * A native title holding the whole text, for a line with no designed card
   * saying it in full.
   * @default undefined — no title
   */
  title?: string;
  /**
   * Class names added to the line.
   * @default undefined
   */
  className?: string;
  /**
   * Value of the line's `data-testid`.
   * @default undefined
   */
  testId?: string;
  /**
   * How many lines the phrases may take: past one, the text wraps between its
   * phrases — after a separator, never inside a phrase — and is cut with an
   * ellipsis on its last line only.
   * @default 1
   */
  lines?: number;
}

/**
 * A text kept to one line without cutting a phrase in two: a quantity and its
 * unit (`≥ 23.63 nm²`), a size (`2048 × 2048`), a name. The text is split at
 * its separators and each phrase is laid out whole; the phrases that do not
 * fit are left out from the end and an ellipsis says so; what is read and
 * copied is the text as it was given, and a card or a popover beside the
 * line says it whole. Given more `lines`, it wraps between its phrases first.
 * @param props - See {@link OneLineProps}.
 * @returns The line.
 */
export function OneLine(props: OneLineProps): ReactElement {
  const { text, separator = ' · ', style, title, className, testId } = props;
  const { lines = 1 } = props;
  const box = lines > 1 ? linesStyle(lines) : LINE_STYLE;
  return (
    <span
      className={className}
      style={style === undefined ? box : { ...box, ...style }}
      title={title}
      data-testid={testId}
    >
      {phrasesOf(text, separator).map((phrase, index) =>
        lines > 1 && index > 0 && phrase.text.startsWith(separator) ? (
          // The separator is text a line may break in, the phrase is not.
          <Fragment key={phrase.at}>
            {separator}
            <span style={PHRASE_STYLE}>
              {phrase.text.slice(separator.length)}
            </span>
          </Fragment>
        ) : (
          <span key={phrase.at} style={PHRASE_STYLE}>
            {phrase.text}
          </span>
        ),
      )}
    </span>
  );
}

/**
 * Some lines, wrapping between phrases and cut on the last.
 * @param lines - How many.
 * @returns The box's rules.
 */
function linesStyle(lines: number): CSSProperties {
  return {
    display: '-webkit-box',
    minWidth: 0,
    overflow: 'hidden',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: lines,
    whiteSpace: 'normal',
  };
}

/** One line, its overflow cut where a phrase ends and marked by an ellipsis. */
const LINE_STYLE: CSSProperties = {
  display: 'block',
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

/** A phrase is laid out whole, its leading separator and spaces kept. */
const PHRASE_STYLE: CSSProperties = {
  display: 'inline-block',
  whiteSpace: 'pre',
};
