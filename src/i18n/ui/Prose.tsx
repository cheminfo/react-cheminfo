/**
 * A paragraph of authored prose, with its inline marks drawn and its links put
 * back where the sentence wants them.
 *
 * An explanation page is prose, not labels: it carries bold lead-ins, italics
 * and a handful of links into the tool. `**strong**`, `*emphasis*` and
 * `` `code` `` are the inline marks `InlineText` reads. A link is a `{name}`
 * placeholder instead, cut out by `splitProse`, so a translation decides where
 * in the sentence it falls.
 */

import type { ReactElement, ReactNode } from 'react';
import { Fragment } from 'react';

import { InlineText } from '../../pedagogy/ui/InlineText.tsx';
import { splitProse } from '../core/prose.ts';

/** Props of {@link Prose}. */
export interface ProseProps {
  /** The message, already written in the language of the page. */
  text: string;
  /**
   * What each `{name}` placeholder of the message stands for.
   * @default {}
   */
  nodes?: Readonly<Record<string, ReactNode>>;
}

/**
 * Draw one piece of prose.
 * @param props - See {@link ProseProps}.
 * @returns The prose, marks drawn and placeholders replaced.
 */
export function Prose(props: ProseProps): ReactElement {
  const { text, nodes = {} } = props;
  return (
    <>
      {splitProse(text, Object.keys(nodes)).map((piece) =>
        piece.kind === 'text' ? (
          <InlineText key={piece.at} text={piece.text} />
        ) : (
          <Fragment key={piece.at}>{nodes[piece.name]}</Fragment>
        ),
      )}
    </>
  );
}
