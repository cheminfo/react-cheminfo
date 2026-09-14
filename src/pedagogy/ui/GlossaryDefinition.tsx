import type { CSSProperties, ReactElement, ReactNode } from 'react';

import type { GlossaryEntry, GlossaryExample } from '../core/glossary.ts';

import { InlineText } from './InlineText.tsx';
import { exampleText } from './exampleText.ts';
import { useGlossary } from './glossaryContext.ts';
import type { ProseInk, ProseTone } from './pedagogyStyle.ts';
import { MONOSPACE, PROSE_INK } from './pedagogyStyle.ts';

/** Props of {@link GlossaryDefinition}. */
export interface GlossaryDefinitionProps<TExample = GlossaryExample> {
  /** The term to explain, already resolved from a marker. */
  entry: GlossaryEntry<TExample>;
  /**
   * The ground it is drawn on: the dark plate of a tooltip, or the page, where
   * a glossary lists every term.
   * @default 'tooltip'
   */
  tone?: ProseTone;
  /**
   * Draws the illustration of one example; its note is still written under it.
   * @default the surrounding provider's, and otherwise the code and the input
   */
  renderExample?: (example: TExample) => ReactNode;
  /**
   * Draws the code spans of the summary and of the notes.
   * @default the surrounding provider's, and otherwise a monospace span
   */
  renderCode?: (code: string) => ReactNode;
  /**
   * Class names added to the root element.
   * @default undefined
   */
  className?: string;
}

/**
 * One definition: the term, one paragraph, then the worked examples.
 *
 * The tooltip a marker opens and the entry a glossary page lists are this one
 * body on two grounds, so a term reads the same wherever it is looked up.
 * @param props - The entry, and the ground it is drawn on.
 * @returns The definition.
 */
export function GlossaryDefinition<TExample = GlossaryExample>(
  props: GlossaryDefinitionProps<TExample>,
): ReactElement {
  const { className, entry, tone = 'tooltip' } = props;
  const context = useGlossary();
  const ink = PROSE_INK[tone];
  const renderCode =
    props.renderCode ??
    context.renderCode ??
    ((code: string) => <code style={codeStyle(ink)}>{code}</code>);
  const renderExample = (props.renderExample ?? context.renderExample) as
    ((example: TExample) => ReactNode) | undefined;

  const items: ReactNode[] = [];
  for (let position = 0; position < entry.examples.length; position++) {
    const example = entry.examples[position] as TExample;
    const note = exampleText(example, 'note');
    items.push(
      <li key={`example-${position}`}>
        {renderExample === undefined ? (
          <ExampleLine example={example} ink={ink} />
        ) : (
          renderExample(example)
        )}
        {note !== undefined && (
          <div style={{ ...NOTE_STYLE, color: ink.muted }}>
            <InlineText text={note} renderCode={renderCode} />
          </div>
        )}
      </li>,
    );
  }

  return (
    <div
      className={className}
      style={tone === 'tooltip' ? TOOLTIP_BODY_STYLE : BODY_STYLE}
    >
      <div style={TITLE_STYLE}>{entry.title}</div>
      <div style={{ ...SUMMARY_STYLE, color: ink.text }}>
        <InlineText text={entry.summary} renderCode={renderCode} />
      </div>
      {items.length > 0 && <ul style={LIST_STYLE}>{items}</ul>}
    </div>
  );
}

function ExampleLine(props: {
  example: unknown;
  ink: ProseInk;
}): ReactElement | null {
  const { example, ink } = props;
  const code = exampleText(example, 'code');
  const input = exampleText(example, 'input');
  if (code === undefined) return null;

  return (
    <>
      <code style={codeStyle(ink)}>{code}</code>
      {input !== undefined && <span>{` on ${input}`}</span>}
    </>
  );
}

function codeStyle(ink: ProseInk): CSSProperties {
  return { fontFamily: MONOSPACE, fontWeight: 600, color: ink.code };
}

const BODY_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const TOOLTIP_BODY_STYLE: CSSProperties = { ...BODY_STYLE, maxWidth: 340 };

const TITLE_STYLE: CSSProperties = { fontWeight: 600, fontSize: 13 };

const SUMMARY_STYLE: CSSProperties = { fontSize: 12, lineHeight: 1.45 };

const LIST_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  margin: 0,
  paddingLeft: 16,
  fontSize: 12,
  lineHeight: 1.4,
};

const NOTE_STYLE: CSSProperties = { fontStyle: 'italic' };
